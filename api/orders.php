<?php
require_once __DIR__ . '/shared.php';
ensureDirs();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonOut(['error' => 'Method not allowed.'], 405);
}

$menu = readJSON(MENU_PATH);
if (!$menu) {
    jsonOut(['error' => 'Er is nog geen menu voor deze week.'], 400);
}

$body  = getBody();
$name  = trim($body['name'] ?? '');
$days  = $body['days'] ?? [];

if (!$name) jsonOut(['error' => 'Naam is verplicht.'], 400);
if (!is_array($days)) jsonOut(['error' => 'Dagkeuzes ontbreken.'], 400);

$validMainIds = array_column($menu['mains'], 'id');

foreach (VALID_DAYS as $day) {
    $choice = $days[$day]['choice'] ?? null;
    if (!$choice) jsonOut(['error' => "Keuze voor $day ontbreekt."], 400);
    if (in_array($choice, ['none','soup','vega'], true)) continue;
    if (!in_array($choice, $validMainIds, true)) {
        jsonOut(['error' => "Ongeldige keuze \"$choice\" voor $day."], 400);
    }
    $main = null;
    foreach ($menu['mains'] as $m) {
        if ($m['id'] === $choice) { $main = $m; break; }
    }
    if (!in_array($day, $main['days'], true)) {
        jsonOut(['error' => "{$main['name']} is niet beschikbaar op $day."], 400);
    }
}

$ordersData  = readJSON(ORDERS_PATH, ['weekId' => $menu['weekId'], 'orders' => []]);
$nameNorm    = strtolower($name);
$now         = (new DateTime())->format('c');

$order = [
    'id'          => 'ord_' . round(microtime(true) * 1000),
    'name'        => $name,
    'submittedAt' => $now,
    'days'        => $days,
];

$existingIdx = -1;
foreach ($ordersData['orders'] as $i => $o) {
    if (strtolower($o['name']) === $nameNorm) { $existingIdx = $i; break; }
}

if ($existingIdx >= 0) {
    $order['id'] = $ordersData['orders'][$existingIdx]['id'];
    $ordersData['orders'][$existingIdx] = $order;
} else {
    $ordersData['orders'][] = $order;
}

writeJSON(ORDERS_PATH, $ordersData);
appendLog(ORDERS_LOG, [
    'event'     => 'order_submitted',
    'weekId'    => $menu['weekId'],
    'timestamp' => $now,
    'order'     => $order,
]);

jsonOut(['ok' => true, 'message' => 'Bestelling opgeslagen!']);
