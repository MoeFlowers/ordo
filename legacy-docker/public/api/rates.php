<?php
// Proxy + cache de tasas de cambio (BCV y USDT en Bs por USD/USDT).
// Fuente: ve.dolarapi.com  (sin API key). Cachea 30 min.
header('Content-Type: application/json; charset=utf-8');

$cacheFile = __DIR__ . '/../../data/rates_cache.json';
$maxAge = 30 * 60; // 30 minutos
$apiUrl = getenv('RATES_API') ?: 'https://ve.dolarapi.com/v1/dolares';

// Servir cache fresca
if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $maxAge) {
    readfile($cacheFile);
    exit;
}

function fetchJson(string $url) {
    $ctx = stream_context_create(['http' => ['timeout' => 8, 'header' => "User-Agent: control-deudas\r\n"]]);
    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) return null;
    $j = json_decode($raw, true);
    return is_array($j) ? $j : null;
}

$data = fetchJson($apiUrl);

$bcv = null;   // Bs por 1 USD (tasa oficial BCV)
$usdt = null;  // Bs por 1 USDT (mercado / paralelo)

if (is_array($data)) {
    foreach ($data as $item) {
        $fuente = strtolower($item['fuente'] ?? '');
        $valor = $item['promedio'] ?? $item['venta'] ?? $item['compra'] ?? null;
        if ($valor === null) continue;
        if ($fuente === 'oficial') {
            $bcv = (float)$valor;
        } elseif ($fuente === 'paralelo' || $fuente === 'bitcoin') {
            // Aproximamos USDT al mercado paralelo si no hay una fuente USDT dedicada
            if ($usdt === null || $fuente === 'paralelo') {
                $usdt = (float)$valor;
            }
        }
    }
}

// Si USDT no vino, usar la paralela; si tampoco, igualar a BCV
if ($usdt === null) $usdt = $bcv;

$result = [
    'ok'         => ($bcv !== null),
    'bcv'        => $bcv,   // Bs / USD
    'usdt'       => $usdt,  // Bs / USDT
    'fecha'      => date('c'),
    'fuente'     => 've.dolarapi.com',
];

$json = json_encode($result, JSON_UNESCAPED_UNICODE);

// Guardar cache solo si la consulta fue buena; si fallo, intentar servir cache vieja
if ($result['ok']) {
    @file_put_contents($cacheFile, $json);
    echo $json;
} elseif (is_file($cacheFile)) {
    readfile($cacheFile);
} else {
    echo $json;
}
