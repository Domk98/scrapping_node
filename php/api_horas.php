<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';
requerirAcceso();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET'); http_response_code(405); echo json_encode(['error' => 'Metodo no permitido']); exit;
}
$cd = obtenerCd();
try {
    $link = conectar();
    $stmt = $link->prepare('SELECT cd, nick, fecha, tiempo FROM tiempo_cbhours WHERE cd = ?');
    $stmt->bind_param('s', $cd);
    $stmt->execute();
    $result = $stmt->get_result();
    $response = [];
    while ($row = $result->fetch_assoc()) {
        $response[$row['cd']][] = ['nick' => $row['nick'], 'fecha' => $row['fecha'], 'tiempo' => $row['tiempo']];
    }
    echo json_encode((object)$response);
} catch (Throwable $error) {
    http_response_code(500); echo json_encode(['error' => 'No se pudo consultar la informacion']);
}
