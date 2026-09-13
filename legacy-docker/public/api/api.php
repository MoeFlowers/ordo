<?php
// API CRUD de deudas (JSON).
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

function body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function out($data): void {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

try {
    $pdo = db();

    switch ($action) {

        case 'list':
            $rows = $pdo->query("SELECT * FROM deudas ORDER BY
                CASE estado WHEN 'pendiente' THEN 0 ELSE 1 END,
                CASE WHEN fecha_vencimiento = '' THEN 1 ELSE 0 END,
                fecha_vencimiento ASC, id DESC")->fetchAll();
            out(['ok' => true, 'deudas' => $rows]);
            break;

        case 'add': {
            $d = body();
            $stmt = $pdo->prepare("INSERT INTO deudas
                (tipo, descripcion, contraparte, moneda, monto, monto_abonado,
                 fecha_creacion, fecha_vencimiento, estado, notas)
                VALUES (?,?,?,?,?,?,?,?,?,?)");
            $stmt->execute([
                in_array($d['tipo'] ?? '', ['por_pagar', 'por_cobrar']) ? $d['tipo'] : 'por_pagar',
                trim($d['descripcion'] ?? '') ?: 'Sin descripcion',
                trim($d['contraparte'] ?? ''),
                in_array($d['moneda'] ?? '', ['BS', 'USD', 'USDT']) ? $d['moneda'] : 'USD',
                (float)($d['monto'] ?? 0),
                0,
                date('Y-m-d'),
                trim($d['fecha_vencimiento'] ?? ''),
                'pendiente',
                trim($d['notas'] ?? ''),
            ]);
            out(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }

        case 'update': {
            $d = body();
            $id = (int)($d['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE deudas SET
                tipo=?, descripcion=?, contraparte=?, moneda=?, monto=?,
                fecha_vencimiento=?, notas=? WHERE id=?");
            $stmt->execute([
                in_array($d['tipo'] ?? '', ['por_pagar', 'por_cobrar']) ? $d['tipo'] : 'por_pagar',
                trim($d['descripcion'] ?? '') ?: 'Sin descripcion',
                trim($d['contraparte'] ?? ''),
                in_array($d['moneda'] ?? '', ['BS', 'USD', 'USDT']) ? $d['moneda'] : 'USD',
                (float)($d['monto'] ?? 0),
                trim($d['fecha_vencimiento'] ?? ''),
                trim($d['notas'] ?? ''),
                $id,
            ]);
            out(['ok' => true]);
            break;
        }

        case 'abonar': {
            $d = body();
            $id = (int)($d['id'] ?? 0);
            $monto = (float)($d['monto'] ?? 0);
            $row = $pdo->prepare("SELECT monto, monto_abonado FROM deudas WHERE id=?");
            $row->execute([$id]);
            $r = $row->fetch();
            if (!$r) out(['ok' => false, 'error' => 'No existe']);
            $nuevo = min($r['monto'], $r['monto_abonado'] + $monto);
            $estado = ($nuevo >= $r['monto'] - 0.0001) ? 'pagada' : 'pendiente';
            $pdo->prepare("UPDATE deudas SET monto_abonado=?, estado=? WHERE id=?")
                ->execute([$nuevo, $estado, $id]);
            out(['ok' => true, 'estado' => $estado]);
            break;
        }

        case 'toggle_estado': {
            $d = body();
            $id = (int)($d['id'] ?? 0);
            $row = $pdo->prepare("SELECT monto, estado FROM deudas WHERE id=?");
            $row->execute([$id]);
            $r = $row->fetch();
            if (!$r) out(['ok' => false, 'error' => 'No existe']);
            if ($r['estado'] === 'pagada') {
                $pdo->prepare("UPDATE deudas SET estado='pendiente' WHERE id=?")->execute([$id]);
            } else {
                $pdo->prepare("UPDATE deudas SET estado='pagada', monto_abonado=monto WHERE id=?")->execute([$id]);
            }
            out(['ok' => true]);
            break;
        }

        case 'delete': {
            $d = body();
            $id = (int)($d['id'] ?? 0);
            $pdo->prepare("DELETE FROM deudas WHERE id=?")->execute([$id]);
            out(['ok' => true]);
            break;
        }

        default:
            out(['ok' => false, 'error' => 'Accion desconocida']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    out(['ok' => false, 'error' => $e->getMessage()]);
}
