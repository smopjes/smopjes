<?php
require_once dirname(__DIR__) . '/shared.php';
ensureDirs();
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonOut(['error' => 'Method not allowed.'], 405);
}

jsonOut(readJSON(ORDERS_PATH, ['weekId' => null, 'orders' => []]));
