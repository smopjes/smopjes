<?php
$_base = dirname(__DIR__);
define('MENU_PATH',   $_base . '/data/menu.json');
define('ORDERS_PATH', $_base . '/data/orders.json');
define('MENUS_LOG',   $_base . '/logs/menus.log');
define('ORDERS_LOG',  $_base . '/logs/orders.log');
define('VALID_DAYS',  ['monday','tuesday','wednesday','thursday','friday']);

function ensureDirs(): void {
    foreach ([dirname(MENU_PATH), dirname(MENUS_LOG)] as $dir) {
        if (!is_dir($dir)) mkdir($dir, 0755, true);
    }
}

function readJSON(string $path, mixed $default = null): mixed {
    if (!file_exists($path)) return $default;
    $raw = file_get_contents($path);
    return json_decode($raw, true) ?? $default;
}

function writeJSON(string $path, mixed $data): void {
    $fp = fopen($path, 'c');
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function appendLog(string $path, array $entry): void {
    $fp = fopen($path, 'a');
    if (flock($fp, LOCK_EX)) {
        fwrite($fp, json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n");
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function getWeekId(): string {
    return (new DateTime())->format('o-\WW');
}

function jsonOut(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getBody(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function requireAdmin(): void {
    require_once dirname(__DIR__) . '/config.php';
    $provided = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    if (!defined('ADMIN_PASSWORD') || !hash_equals(ADMIN_PASSWORD, $provided)) {
        jsonOut(['error' => 'Ongeldig wachtwoord.'], 401);
    }
}
