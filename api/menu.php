<?php
require_once __DIR__ . '/shared.php';
ensureDirs();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonOut(['error' => 'Method not allowed.'], 405);
}

jsonOut(['menu' => readJSON(MENU_PATH)]);
