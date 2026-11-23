<?php
require 'lib/db.php';
global $conexion;
$cols = mysqli_query($conexion, "DESCRIBE usuarios");
while ($c = mysqli_fetch_assoc($cols)) {
    echo $c['Field'] . " (" . $c['Type'] . ")\n";
}
echo "--- USERS ---\n";
$users = mysqli_query($conexion, "SELECT * FROM usuarios");
while ($u = mysqli_fetch_assoc($users)) {
    echo "ID: {$u['id']} | Cedula: {$u['cedula']} | Rol: {$u['rol']} | Email: {$u['email']} | Pass: {$u['password']}\n";
}
