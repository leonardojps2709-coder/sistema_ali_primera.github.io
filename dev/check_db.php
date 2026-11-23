<?php
require_once __DIR__ . '/../lib/db.php';
$res = ejecutarConsulta("DESCRIBE estudiantes");
echo json_encode($res);
?>
