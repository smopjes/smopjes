<?php
require_once dirname(__DIR__) . '/shared.php';
ensureDirs();
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonOut(['error' => 'Method not allowed.'], 405);
}

$body  = getBody();
$soup  = $body['soup'] ?? [];
$vega  = $body['vega'] ?? [];
$mains = $body['mains'] ?? [];

if (empty(trim($soup['name'] ?? ''))) jsonOut(['error' => 'Soepnaam is verplicht.'], 400);
if (empty(trim($vega['name'] ?? ''))) jsonOut(['error' => 'Veganaam is verplicht.'], 400);
if (!is_array($mains) || count($mains) === 0) {
    jsonOut(['error' => 'Minimaal één hoofdgerecht is verplicht.'], 400);
}

$cleanMains = [];
foreach ($mains as $i => $m) {
    $mname = trim($m['name'] ?? '');
    $mdays = $m['days'] ?? [];
    if (!$mname) jsonOut(['error' => 'Naam van gerecht ' . ($i + 1) . ' is verplicht.'], 400);
    if (!is_array($mdays) || count($mdays) === 0) {
        jsonOut(['error' => "Gerecht \"$mname\" moet aan minimaal één dag gekoppeld zijn."], 400);
    }
    foreach ($mdays as $day) {
        if (!in_array($day, VALID_DAYS, true)) {
            jsonOut(['error' => "Ongeldige dag \"$day\" voor gerecht \"$mname\"."], 400);
        }
    }
    $cleanMains[] = ['id' => 'main' . ($i + 1), 'name' => $mname, 'days' => $mdays];
}

$weekId = getWeekId();
$now    = (new DateTime())->format('c');

$menu = [
    'weekId'    => $weekId,
    'createdAt' => $now,
    'soup'      => ['name' => trim($soup['name'])],
    'vega'      => ['name' => trim($vega['name'])],
    'mains'     => $cleanMains,
];

writeJSON(MENU_PATH, $menu);
writeJSON(ORDERS_PATH, ['weekId' => $weekId, 'orders' => []]);
appendLog(MENUS_LOG, ['event' => 'menu_set', 'weekId' => $weekId, 'timestamp' => $now, 'menu' => $menu]);

jsonOut(['ok' => true, 'weekId' => $weekId, 'message' => "Menu voor $weekId opgeslagen."]);
