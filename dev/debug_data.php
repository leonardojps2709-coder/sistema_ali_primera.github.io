<?php
require_once __DIR__ . '/../lib/db.php';
echo "--- NOTAS ---\n";
$notas = ejecutarConsulta("SELECT * FROM notas");
print_r($notas);
echo "\n--- ESTUDIANTES ---\n";
$estudiantes = ejecutarConsulta("SELECT id, nombre, seccion_id FROM estudiantes LIMIT 5");
print_r($estudiantes);
echo "\n--- SECCIONES ---\n";
$secciones = ejecutarConsulta("SELECT id, nombre FROM secciones LIMIT 5");
print_r($secciones);
?>
