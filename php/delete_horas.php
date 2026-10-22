<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';
requerirAcceso();
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    header('Allow: DELETE'); http_response_code(405); echo json_encode(['error' => 'Metodo no permitido']); exit;
}
$cd = obtenerCd();
try {
    $link = conectar();
    $stmt = $link->prepare('DELETE FROM tiempo_cbhours WHERE cd = ?');
    $stmt->bind_param('s', $cd); $stmt->execute();
    echo json_encode(['deleted' => $stmt->affected_rows]);
} catch (Throwable $error) {
    http_response_code(500); echo json_encode(['error' => 'No se pudo eliminar la informacion']);
}
