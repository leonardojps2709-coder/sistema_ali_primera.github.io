<?php
require 'lib/db.php';
global $conexion;
$res = mysqli_query($conexion, "SELECT COUNT(*) FROM estudiantes_respaldo_mayusculas");
$count = mysqli_fetch_row($res)[0];
echo "Total registros: $count\n";

$res2 = mysqli_query($conexion, "SELECT id, cedula, nombre, apellido FROM estudiantes_respaldo_mayusculas LIMIT 5");
while ($r = mysqli_fetch_assoc($res2)) {
    echo "ID: {$r['id']} | Cedula: {$r['cedula']} | Nombre: {$r['nombre']} | Apellido: {$r['apellido']}\n";
}

