<?php
// Envia un correo con las deudas por pagar proximas a vencer (o vencidas).
// Idempotente: no reenvia una deuda el mismo dia (usa notified_date).
// Se ejecuta desde el contenedor "cron".

require __DIR__ . '/db.php';
require __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function log_line(string $s): void {
    echo '[' . date('Y-m-d H:i:s') . '] ' . $s . PHP_EOL;
}

$gmailUser = getenv('GMAIL_USER') ?: '';
$gmailPass = getenv('GMAIL_APP_PASSWORD') ?: '';
$notify    = getenv('NOTIFY_EMAIL') ?: $gmailUser;
$dias      = (int)(getenv('REMINDER_DAYS') ?: 3);

if ($gmailUser === '' || $gmailPass === '' || str_contains($gmailPass, 'pon_aqui')) {
    log_line('Correo NO configurado (revisa GMAIL_USER / GMAIL_APP_PASSWORD en .env). Se omite el envio.');
    exit(0);
}

$hoy = new DateTime('today');
$limite = (clone $hoy)->modify("+{$dias} days");

$pdo = db();
$rows = $pdo->query("SELECT * FROM deudas
    WHERE estado='pendiente' AND tipo='por_pagar' AND fecha_vencimiento != ''")->fetchAll();

$porAvisar = [];
foreach ($rows as $r) {
    $venc = DateTime::createFromFormat('Y-m-d', $r['fecha_vencimiento']);
    if (!$venc) continue;
    // Vencidas o dentro de la ventana de aviso
    if ($venc <= $limite && $r['notified_date'] !== date('Y-m-d')) {
        $porAvisar[] = $r;
    }
}

if (!$porAvisar) {
    log_line('Sin deudas por avisar hoy.');
    exit(0);
}

// Construir el cuerpo del correo
$simbolo = ['BS' => 'Bs', 'USD' => '$', 'USDT' => 'USDT'];
$filas = '';
foreach ($porAvisar as $r) {
    $saldo = $r['monto'] - $r['monto_abonado'];
    $venc = DateTime::createFromFormat('Y-m-d', $r['fecha_vencimiento']);
    $diff = (int)$hoy->diff($venc)->format('%r%a');
    $estadoTxt = $diff < 0 ? "VENCIDA hace " . abs($diff) . " dia(s)"
                : ($diff === 0 ? "vence HOY" : "vence en $diff dia(s)");
    $sim = $simbolo[$r['moneda']] ?? $r['moneda'];
    $filas .= "<tr>"
        . "<td style='padding:8px;border-bottom:1px solid #eee'>" . htmlspecialchars($r['descripcion']) . "</td>"
        . "<td style='padding:8px;border-bottom:1px solid #eee'>" . htmlspecialchars($r['contraparte']) . "</td>"
        . "<td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>$sim " . number_format($saldo, 2) . "</td>"
        . "<td style='padding:8px;border-bottom:1px solid #eee'>" . $r['fecha_vencimiento'] . "</td>"
        . "<td style='padding:8px;border-bottom:1px solid #eee;color:" . ($diff < 0 ? '#c0392b' : '#e67e22') . "'>$estadoTxt</td>"
        . "</tr>";
}

$html = "
<div style='font-family:Arial,sans-serif;max-width:640px;margin:auto'>
  <h2 style='color:#2c3e50'>Recordatorio de deudas por pagar</h2>
  <p>Tienes <b>" . count($porAvisar) . "</b> deuda(s) vencida(s) o por vencer en los proximos $dias dia(s):</p>
  <table style='border-collapse:collapse;width:100%'>
    <tr style='background:#f4f6f8;text-align:left'>
      <th style='padding:8px'>Descripcion</th>
      <th style='padding:8px'>A quien</th>
      <th style='padding:8px;text-align:right'>Saldo</th>
      <th style='padding:8px'>Vence</th>
      <th style='padding:8px'>Estado</th>
    </tr>
    $filas
  </table>
  <p style='color:#7f8c8d;font-size:12px;margin-top:20px'>Enviado automaticamente por tu Control de Deudas.</p>
</div>";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $gmailUser;
    $mail->Password = $gmailPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($gmailUser, 'Control de Deudas');
    $mail->addAddress($notify);
    $mail->isHTML(true);
    $mail->Subject = 'Deudas por vencer (' . count($porAvisar) . ')';
    $mail->Body = $html;
    $mail->AltBody = 'Tienes ' . count($porAvisar) . ' deuda(s) por vencer. Abre tu Control de Deudas.';

    $mail->send();
    log_line('Correo enviado a ' . $notify . ' con ' . count($porAvisar) . ' deuda(s).');

    // Marcar como notificadas hoy
    $ids = array_map(fn($r) => (int)$r['id'], $porAvisar);
    $in = implode(',', $ids);
    $pdo->exec("UPDATE deudas SET notified_date='" . date('Y-m-d') . "' WHERE id IN ($in)");
} catch (Exception $e) {
    log_line('ERROR al enviar correo: ' . $mail->ErrorInfo);
    exit(1);
}
