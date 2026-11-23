<?php
require_once __DIR__ . '/../lib/db.php';
$tables = ['usuarios', 'estudiantes', 'secciones', 'menciones', 'periodos', 'notas'];
foreach ($tables as $table) {
    echo "\n--- $table ---\n";
    $res = ejecutarConsulta("DESCRIBE $table");
    echo json_encode($res);
}
?>
