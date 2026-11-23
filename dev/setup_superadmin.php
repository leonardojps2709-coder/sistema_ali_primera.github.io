<?php
/**
 * superadmin/setup.php
 * SCRIPT DE INSTALACIÓN / CONFIGURACIÓN INICIAL DEL SUPERADMIN
 * 
 * Este archivo debe ejecutarse una única vez al configurar el sistema. 
 * Su función es parchear la tabla 'usuarios' para admitir el rol 'superadmin' 
 * e insertar el usuario maestro (Super Administrador) por defecto si aún no existe.
 */
require_once __DIR__ . '/../lib/db.php';

// 1. Modificar el ENUM del campo 'rol' para incluir 'superadmin'
$sql = "ALTER TABLE usuarios MODIFY COLUMN rol ENUM('admin', 'teacher', 'superadmin') NOT NULL DEFAULT 'teacher'";
$result1 = ejecutarConsulta($sql);

// 2. Insertar o actualizar el superadmin por defecto
$check = ejecutarConsulta("SELECT id FROM usuarios WHERE rol = 'superadmin' LIMIT 1");
$created = false;
if (empty($check) || isset($check['error'])) {
    $insertSql = "INSERT INTO usuarios (cedula, nombre, apellido, email, telefono, rol, password) VALUES (?, ?, ?, ?, ?, 'superadmin', ?)";
    $insertResult = ejecutarConsulta($insertSql, ['superadmin', 'Super', 'Administrador', 'superadmin@aliprimera.edu.ve', '', 'superadmin123'], 'ssssss');
    $created = true;
} else {
    $updateSql = "UPDATE usuarios SET cedula = ?, password = ? WHERE rol = 'superadmin'";
    ejecutarConsulta($updateSql, ['superadmin', 'superadmin123'], 'ss');
}

header('Content-Type: application/json');
echo json_encode([
    'enum_update' => $result1,
    'superadmin_created' => $created,
    'message' => 'SuperAdmin configurado. Usuario: superadmin | Contraseña: superadmin123'
]);
