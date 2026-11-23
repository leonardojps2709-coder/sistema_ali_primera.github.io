<?php
require 'lib/db.php';
global $conexion;
$res = mysqli_query($conexion, "SELECT id, cedula, nombre, apellido FROM estudiantes_respaldo_mayusculas WHERE nombre REGEXP '[a-z]' OR apellido REGEXP '[a-z]'");
echo "Registros que estaban en minusculas originalmente:\n";
while ($r = mysqli_fetch_assoc($res)) {
    echo "- ID {$r['id']}: {$r['nombre']} {$r['apellido']} (CI: {$r['cedula']})\n";
}

