<?php
// Conexion a SQLite y creacion de tablas.

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dataDir = __DIR__ . '/../../data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0777, true);
    }

    $pdo = new PDO('sqlite:' . $dataDir . '/deudas.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS deudas (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo              TEXT NOT NULL DEFAULT 'por_pagar',  -- por_pagar | por_cobrar
            descripcion       TEXT NOT NULL,
            contraparte       TEXT DEFAULT '',                   -- a quien le debo / quien me debe
            moneda            TEXT NOT NULL DEFAULT 'USD',        -- BS | USD | USDT
            monto             REAL NOT NULL DEFAULT 0,
            monto_abonado     REAL NOT NULL DEFAULT 0,
            fecha_creacion    TEXT NOT NULL,
            fecha_vencimiento TEXT DEFAULT '',
            estado            TEXT NOT NULL DEFAULT 'pendiente',  -- pendiente | pagada
            notas             TEXT DEFAULT '',
            notified_date     TEXT DEFAULT ''
        )
    ");

    return $pdo;
}
