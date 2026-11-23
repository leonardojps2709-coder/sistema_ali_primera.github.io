<?php
/**
 * lib/db.php
 * CONFIGURACIÓN DE BASE DE DATOS
 * 
 * Este archivo gestiona la conexión a la base de datos MySQL y proporciona
 * una función de envoltura (`ejecutarConsulta`) para realizar operaciones SQL
 * de forma segura utilizando sentencias preparadas (Prepared Statements).
 */

// PHP 8: desactivar excepciones automáticas de mysqli (usar el modo clásico de errores)
mysqli_report(MYSQLI_REPORT_OFF);

$host = "localhost";
$user = "root";     // Usuario por defecto en XAMPP/WAMP
$pass = "12345678";         // Contraseña por defecto en XAMPP/WAMP (vacía)
$db   = "sistema_ali";

// Crear conexión con las credenciales
$conexion = mysqli_connect($host, $user, $pass, $db);

// Verificar si la conexión fue exitosa
if (!$conexion) {
    header('Content-Type: application/json');
    die(json_encode(['success' => false, 'error' => 'Error de conexión: ' . mysqli_connect_error()]));
}

// Configurar charset a utf8mb4 para evitar problemas con acentos y ñ
mysqli_set_charset($conexion, "utf8mb4");

/**
 * ejecutarConsulta
 * 
 * Ejecuta una consulta SQL de forma segura contra la base de datos.
 * Esta función es la única forma recomendada de interactuar con MySQL en la app.
 *
 * @param string $sql La sentencia SQL a ejecutar (usar '?' para los parámetros).
 * @param array $params Arreglo indexado con los valores de los parámetros a sustituir.
 * @param string $types Cadena que indica los tipos de datos (e.g. 's' para string, 'i' para int).
 * 
 * @return array|bool Retorna un arreglo asociativo si es SELECT, o un arreglo `['success'=>true]` si es INSERT/UPDATE/DELETE. Falso en caso de error crítico.
 */
function ejecutarConsulta($sql, $params = [], $types = "") {
    global $conexion;
    $stmt = mysqli_prepare($conexion, $sql);
    
    if ($stmt === false) {
        return false;
    }

    if (!empty($params)) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }

    if (!mysqli_stmt_execute($stmt)) {
        $error = mysqli_stmt_error($stmt);
        error_log("[" . date('Y-m-d H:i:s') . "] SQL Error: $error | SQL: $sql\n", 3, __DIR__ . "/../error_log.txt");
        return ["error" => $error];
    }
    
    $resultado = mysqli_stmt_get_result($stmt);
    
    // Si es un INSERT, UPDATE o DELETE, el resultado es booleano
    if ($resultado === false) {
        return ["success" => true]; 
    }

    return mysqli_fetch_all($resultado, MYSQLI_ASSOC);
}

/**
 * Transacciones
 *
 * Permiten agrupar varias escrituras para que se apliquen todas o ninguna.
 * Se usan, por ejemplo, al cerrar un período: si falla el guardado de las
 * calificaciones finales, el período no debe quedar cerrado a medias.
 */
function iniciarTransaccion() {
    global $conexion;
    return mysqli_begin_transaction($conexion);
}

function confirmarTransaccion() {
    global $conexion;
    return mysqli_commit($conexion);
}

function revertirTransaccion() {
    global $conexion;
    return mysqli_rollback($conexion);
}

/** Id generado por el último INSERT de la conexión. */
function ultimoIdInsertado() {
    global $conexion;
    return (int)mysqli_insert_id($conexion);
}
?>
