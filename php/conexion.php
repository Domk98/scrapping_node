<?php
// Configure environment variables in PHP/FPM; PHP does not load the Node .env file.
function conectar() {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $link = new mysqli(getenv('DB_HOST') ?: '127.0.0.1', getenv('DB_USER') ?: '', getenv('DB_PASSWORD') ?: '', getenv('DB_NAME') ?: 'scraping_demo', (int)(getenv('DB_PORT') ?: 3306));
    $link->set_charset('utf8mb4');
    return $link;
}
function requerirAcceso() {
    $expected = getenv('API_ACCESS_TOKEN');
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$expected || !hash_equals('Bearer ' . $expected, $authorization)) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit;
    }
}
function obtenerCd() {
    $cd = $_GET['cd'] ?? '';
    if (!is_string($cd) || trim($cd) === '') {
        http_response_code(400);
        echo json_encode(['error' => 'cd requerido']);
        exit;
    }
    return $cd . (getenv('TENANT_SUFFIX') ?: '');
}
