<?php
/**
 * lib/backup_helper.php
 * GESTOR DE RESPALDOS, RESTAURACIÓN E INDEXADO DE BASE DE DATOS
 * Compatible con AppServ, XAMPP y MySQL nativo en Windows/Linux.
 */

require_once __DIR__ . '/db.php';

class DatabaseMaintenance {

    public static function getBackupDir() {
        $dir = realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR . 'backups' . DIRECTORY_SEPARATOR;
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        return $dir;
    }

    /**
     * Localiza el binario de mysqldump
     */
    public static function getMysqldumpBinary() {
        $paths = [
            'C:\\AppServ\\MySQL\\bin\\mysqldump.exe',
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
            'mysqldump'
        ];
        foreach ($paths as $path) {
            if ($path === 'mysqldump' || file_exists($path)) {
                return $path;
            }
        }
        return 'mysqldump';
    }

    /**
     * Localiza el binario del cliente mysql
     */
    public static function getMysqlBinary() {
        $paths = [
            'C:\\AppServ\\MySQL\\bin\\mysql.exe',
            'C:\\xampp\\mysql\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
            'mysql'
        ];
        foreach ($paths as $path) {
            if ($path === 'mysql' || file_exists($path)) {
                return $path;
            }
        }
        return 'mysql';
    }

    /**
     * Genera un respaldo completo de la base de datos
     */
    public static function createBackup() {
        global $host, $user, $pass, $db;

        $dir = self::getBackupDir();
        $date = date('Y-m-d_H-i-s');
        $filename = "backup_{$db}_{$date}.sql";
        $targetFile = $dir . $filename;

        $dumpBin = self::getMysqldumpBinary();

        $passArg = ($pass !== '') ? '--password=' . escapeshellarg($pass) : '';
        $userArg = '--user=' . escapeshellarg($user);
        $hostArg = '--host=' . escapeshellarg($host);
        $fileArg = '--result-file=' . escapeshellarg($targetFile);

        // --no-defaults es fundamental en Windows/AppServ para evitar error de [client] no-beep
        $cmd = "\"$dumpBin\" --no-defaults $userArg $passArg $hostArg --databases " . escapeshellarg($db) . " --routines --triggers $fileArg";

        $output = [];
        $returnVar = 0;
        exec($cmd . ' 2>&1', $output, $returnVar);

        if ($returnVar === 0 && file_exists($targetFile) && filesize($targetFile) > 0) {
            return [
                'success' => true,
                'filename' => $filename,
                'size' => round(filesize($targetFile) / 1024, 2) . ' KB',
                'size_bytes' => filesize($targetFile),
                'date' => date('d/m/Y H:i:s')
            ];
        }

        return [
            'success' => false,
            'error' => 'No se pudo generar el respaldo: ' . implode(" ", $output)
        ];
    }

    /**
     * Lista todos los archivos de respaldo disponibles
     */
    public static function listBackups() {
        $dir = self::getBackupDir();
        $files = scandir($dir, SCANDIR_SORT_DESCENDING);
        $backups = [];

        foreach ($files as $f) {
            if ($f === '.' || $f === '..' || substr($f, -4) !== '.sql') {
                continue;
            }
            $filePath = $dir . $f;
            $backups[] = [
                'filename' => $f,
                'size' => round(filesize($filePath) / 1024, 2) . ' KB',
                'size_bytes' => filesize($filePath),
                'date' => date('d/m/Y H:i:s', filemtime($filePath)),
                'timestamp' => filemtime($filePath)
            ];
        }

        return $backups;
    }

    /**
     * Restaura un respaldo previamente creado
     */
    public static function restoreBackup($filename) {
        global $host, $user, $pass, $db;

        $cleanFile = basename($filename);
        if (substr($cleanFile, -4) !== '.sql') {
            return ['success' => false, 'error' => 'Archivo no válido. Solo se admiten archivos .sql'];
        }

        $dir = self::getBackupDir();
        $filePath = $dir . $cleanFile;

        if (!file_exists($filePath)) {
            return ['success' => false, 'error' => 'El archivo de respaldo seleccionado no existe'];
        }

        $mysqlBin = self::getMysqlBinary();
        $passArg = ($pass !== '') ? '--password=' . escapeshellarg($pass) : '';
        $userArg = '--user=' . escapeshellarg($user);
        $hostArg = '--host=' . escapeshellarg($host);

        // Usamos cmd.exe para redireccionar el archivo SQL a la entrada estándar de mysql
        $cmd = "cmd.exe /c \"\"$mysqlBin\" --no-defaults $userArg $passArg $hostArg " . escapeshellarg($db) . " < " . escapeshellarg($filePath) . "\"";

        $output = [];
        $returnVar = 0;
        exec($cmd . ' 2>&1', $output, $returnVar);

        if ($returnVar === 0) {
            return [
                'success' => true,
                'mensaje' => "Base de datos restaurada correctamente a partir de: $cleanFile"
            ];
        }

        return [
            'success' => false,
            'error' => 'Error al restaurar la base de datos: ' . implode(" ", $output)
        ];
    }

    /**
     * Elimina un archivo de respaldo
     */
    public static function deleteBackup($filename) {
        $cleanFile = basename($filename);
        if (substr($cleanFile, -4) !== '.sql') {
            return ['success' => false, 'error' => 'Nombre de archivo no válido'];
        }
        $dir = self::getBackupDir();
        $filePath = $dir . $cleanFile;
        if (!file_exists($filePath)) {
            return ['success' => false, 'error' => 'El archivo no existe'];
        }

        if (@unlink($filePath)) {
            return ['success' => true, 'mensaje' => 'Respaldo eliminado correctamente'];
        }
        return ['success' => false, 'error' => 'No se pudo eliminar el archivo del servidor'];
    }

    /**
     * Comprueba y crea índices de alto rendimiento si aún no existen
     */
    public static function ensurePerformanceIndexes() {
        $created = [];

        $indexesToEnsure = [
            [
                'table' => 'usuarios',
                'name'  => 'idx_usuarios_email',
                'sql'   => 'CREATE INDEX idx_usuarios_email ON usuarios(email)'
            ],
            [
                'table' => 'usuarios',
                'name'  => 'idx_usuarios_rol',
                'sql'   => 'CREATE INDEX idx_usuarios_rol ON usuarios(rol)'
            ],
            [
                'table' => 'estudiantes',
                'name'  => 'idx_estudiantes_ap_nom',
                'sql'   => 'CREATE INDEX idx_estudiantes_ap_nom ON estudiantes(apellido, nombre)'
            ],
            [
                'table' => 'secciones',
                'name'  => 'idx_secciones_guia',
                'sql'   => 'CREATE INDEX idx_secciones_guia ON secciones(profesor_guia_id)'
            ]
        ];

        foreach ($indexesToEnsure as $item) {
            $table = $item['table'];
            $indexName = $item['name'];
            $check = ejecutarConsulta("SHOW INDEX FROM `$table` WHERE Key_name = ?", [$indexName], "s");
            if (empty($check)) {
                $res = ejecutarConsulta($item['sql']);
                if ($res !== false) {
                    $created[] = "$table ($indexName)";
                }
            }
        }

        return $created;
    }

    /**
     * Ejecuta optimización, reconstrucción de índices y análisis de estadísticas
     */
    public static function optimizeAndIndex() {
        global $db;

        // 1. Asegurar la existencia de índices recomendados
        $indicesCreados = self::ensurePerformanceIndexes();

        // 2. Obtener lista de tablas
        $tablasRes = ejecutarConsulta("SHOW TABLES");
        if (empty($tablasRes) || isset($tablasRes['error'])) {
            return ['success' => false, 'error' => 'No se pudieron consultar las tablas del sistema'];
        }

        $report = [];

        foreach ($tablasRes as $fila) {
            $tabla = array_values($fila)[0];

            // A. CHECK TABLE
            $checkRes = ejecutarConsulta("CHECK TABLE `$tabla`");
            $checkStatus = !empty($checkRes) ? ($checkRes[count($checkRes)-1]['Msg_text'] ?? 'OK') : 'OK';

            // B. OPTIMIZE TABLE (Reconstruye tabla e índices)
            $optRes = ejecutarConsulta("OPTIMIZE TABLE `$tabla`");
            $optStatus = !empty($optRes) ? ($optRes[count($optRes)-1]['Msg_text'] ?? 'OK') : 'OK';

            // C. ANALYZE TABLE (Actualiza estadísticas del optimizador de consultas)
            $anaRes = ejecutarConsulta("ANALYZE TABLE `$tabla`");
            $anaStatus = !empty($anaRes) ? ($anaRes[count($anaRes)-1]['Msg_text'] ?? 'OK') : 'OK';

            // D. Obtener métricas de la tabla
            $info = ejecutarConsulta("SELECT table_rows, data_length, index_length, engine 
                                      FROM information_schema.tables 
                                      WHERE table_schema = ? AND table_name = ?", [$db, $tabla], "ss");

            $rows = $info[0]['table_rows'] ?? 0;
            $dataKb = round(($info[0]['data_length'] ?? 0) / 1024, 2);
            $indexKb = round(($info[0]['index_length'] ?? 0) / 1024, 2);

            $report[] = [
                'tabla'      => $tabla,
                'filas'      => (int)$rows,
                'data_kb'    => $dataKb . ' KB',
                'index_kb'   => $indexKb . ' KB',
                'total_kb'   => ($dataKb + $indexKb) . ' KB',
                'motor'      => $info[0]['engine'] ?? 'InnoDB',
                'check'      => $checkStatus,
                'optimize'   => $optStatus,
                'analyze'    => $anaStatus
            ];
        }

        return [
            'success' => true,
            'mensaje' => 'Mantenimiento, reindexado y optimización ejecutados exitosamente.',
            'indices_creados' => $indicesCreados,
            'tablas' => $report,
            'fecha' => date('d/m/Y H:i:s')
        ];
    }

    /**
     * Obtiene estadísticas generales del estado de la base de datos
     */
    public static function getDatabaseStats() {
        global $db;

        $verRes = ejecutarConsulta("SELECT VERSION() as version");
        $version = $verRes[0]['version'] ?? 'Desconocida';

        $tablesInfo = ejecutarConsulta("SELECT 
            COUNT(*) as total_tablas,
            SUM(table_rows) as total_filas,
            SUM(data_length) as total_data,
            SUM(index_length) as total_index
        FROM information_schema.tables
        WHERE table_schema = ?", [$db], "s");

        $totalTablas = $tablesInfo[0]['total_tablas'] ?? 0;
        $totalFilas  = $tablesInfo[0]['total_filas'] ?? 0;
        $totalDataMb = round(($tablesInfo[0]['total_data'] ?? 0) / (1024 * 1024), 2);
        $totalIndexMb = round(($tablesInfo[0]['total_index'] ?? 0) / (1024 * 1024), 2);
        $totalMb = round(($totalDataMb + $totalIndexMb), 2);

        $backups = self::listBackups();
        $totalBackups = count($backups);
        $ultimoBackup = $totalBackups > 0 ? $backups[0]['date'] : 'Ninguno';

        return [
            'success'       => true,
            'base_datos'    => $db,
            'motor_version' => $version,
            'total_tablas'  => (int)$totalTablas,
            'total_filas'   => (int)$totalFilas,
            'tamano_data'   => $totalDataMb . ' MB',
            'tamano_index'  => $totalIndexMb . ' MB',
            'tamano_total'  => $totalMb . ' MB',
            'total_backups' => $totalBackups,
            'ultimo_backup' => $ultimoBackup
        ];
    }
}

