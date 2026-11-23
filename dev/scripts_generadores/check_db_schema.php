<?php
require 'lib/db.php';
global $conexion;
$tables = ['usuarios', 'estudiantes', 'secciones', 'periodos', 'menciones', 'asignaturas', 'notas', 'evaluaciones_config', 'evaluaciones_notas', 'calificaciones_finales', 'teacher_assignments'];
foreach ($tables as $t) {
    echo "=== $t ===\n";
    $res = mysqli_query($conexion, "DESCRIBE $t");
    while ($r = mysqli_fetch_assoc($res)) {
        echo "  {$r['Field']} | {$r['Type']} | {$r['Null']} | {$r['Key']} | " . json_encode($r['Default']) . "\n";
    }
}

