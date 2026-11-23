<?php
/**
 * exportar_bd.php
 * SCRIPT DE DESCARGA RÁPIDA DE RESPALDO DE BASE DE DATOS
 */
require_once __DIR__ . '/lib/backup_helper.php';

$res = DatabaseMaintenance::createBackup();

if ($res['success']) {
    $dir = DatabaseMaintenance::getBackupDir();
    $filePath = $dir . $res['filename'];

    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
} else {
    echo "<h3>Error al exportar la base de datos:</h3>";
    echo "<p>" . htmlspecialchars($res['error'] ?? 'Error desconocido') . "</p>";
}
?>