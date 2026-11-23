<?php
/**
 * api/main.php
 * CONTROLADOR MAESTRO (API)
 * 
 * Este archivo funciona como el enrutador y controlador principal de la aplicación.
 * Recibe peticiones HTTP, determina la acción a realizar mediante el parámetro $_GET['action'],
 * interactúa con la base de datos a través de 'lib/db.php' y devuelve las respuestas en formato JSON.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/backup_helper.php';

// Migraciones de columnas: se ejecutan solo si la columna aún no existe.
// Esto es seguro por el IF NOT EXISTS, pero se puede mover a setup.php
// para no tener overhead en cada request.
static $migracionesEjecutadas = false;
if (!$migracionesEjecutadas) {
    $colReset = ejecutarConsulta("SHOW COLUMNS FROM usuarios LIKE 'solicitud_reset'");
    if (empty($colReset)) {
        ejecutarConsulta("ALTER TABLE usuarios ADD COLUMN solicitud_reset TINYINT(1) DEFAULT 0");
    }
    $colResetF = ejecutarConsulta("SHOW COLUMNS FROM usuarios LIKE 'reset_fecha'");
    if (empty($colResetF)) {
        ejecutarConsulta("ALTER TABLE usuarios ADD COLUMN reset_fecha DATETIME DEFAULT NULL");
    }
    $colTipoDocente = ejecutarConsulta("SHOW COLUMNS FROM usuarios LIKE 'tipo_docente'");
    if (empty($colTipoDocente)) {
        ejecutarConsulta("ALTER TABLE usuarios ADD COLUMN tipo_docente VARCHAR(30) DEFAULT 'docente'");
    }
    $colActivo = ejecutarConsulta("SHOW COLUMNS FROM usuarios LIKE 'activo'");
    if (empty($colActivo)) {
        ejecutarConsulta("ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) DEFAULT 1");
    }
    $colEstActivo = ejecutarConsulta("SHOW COLUMNS FROM estudiantes LIKE 'activo'");
    if (empty($colEstActivo)) {
        ejecutarConsulta("ALTER TABLE estudiantes ADD COLUMN activo TINYINT(1) DEFAULT 1");
    }
    $colGuiaNombre = ejecutarConsulta("SHOW COLUMNS FROM secciones LIKE 'profesor_guia_nombre'");
    if (empty($colGuiaNombre)) {
        ejecutarConsulta("ALTER TABLE secciones ADD COLUMN profesor_guia_nombre VARCHAR(200) DEFAULT NULL");
    }
    $colGuiaId = ejecutarConsulta("SHOW COLUMNS FROM secciones LIKE 'profesor_guia_id'");
    if (empty($colGuiaId)) {
        ejecutarConsulta("ALTER TABLE secciones ADD COLUMN profesor_guia_id INT(11) DEFAULT NULL");
    }

    // Columnas para color e ícono de menciones
    $colMencionColor = ejecutarConsulta("SHOW COLUMNS FROM menciones LIKE 'color'");
    if (empty($colMencionColor)) {
        ejecutarConsulta("ALTER TABLE menciones ADD COLUMN color VARCHAR(30) DEFAULT NULL");
    }
    $colMencionIcono = ejecutarConsulta("SHOW COLUMNS FROM menciones LIKE 'icono'");
    if (empty($colMencionIcono)) {
        ejecutarConsulta("ALTER TABLE menciones ADD COLUMN icono VARCHAR(50) DEFAULT NULL");
    }

    // Asegurar valores por defecto para menciones existentes
    ejecutarConsulta("UPDATE menciones SET color = '#b45309', icono = 'bx bx-bolt-circle' WHERE id = 1 AND (color IS NULL OR color = '')");
    ejecutarConsulta("UPDATE menciones SET color = '#4338ca', icono = 'bx bx-cog' WHERE id = 2 AND (color IS NULL OR color = '')");
    ejecutarConsulta("UPDATE menciones SET color = '#047857', icono = 'bx bx-test-tube' WHERE id = 3 AND (color IS NULL OR color = '')");
    ejecutarConsulta("UPDATE menciones SET color = '#b91c1c', icono = 'bx bx-shield-quarter' WHERE id = 4 AND (color IS NULL OR color = '')");

    // Tabla de asignaturas vinculadas a menciones
    ejecutarConsulta("CREATE TABLE IF NOT EXISTS asignaturas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mencion_id INT NOT NULL,
        anio TINYINT NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        area VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_mencion_anio (mencion_id, anio)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

    // Tabla de configuración de evaluaciones por momento
    ejecutarConsulta("CREATE TABLE IF NOT EXISTS evaluaciones_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        seccion_id INT NOT NULL,
        materia VARCHAR(100) NOT NULL,
        periodo_id INT NOT NULL,
        momento TINYINT NOT NULL COMMENT '1=MP1, 2=MP2, 3=MP3',
        num_evaluaciones TINYINT NOT NULL DEFAULT 1,
        porcentajes JSON NOT NULL COMMENT 'Array JSON de porcentajes, ej: [40,30,30]',
        nombres JSON DEFAULT NULL COMMENT 'Array JSON de nombres, ej: [\"Parcial\",\"Taller\",\"Proyecto\"]',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_eval_config (teacher_id, seccion_id, materia(80), periodo_id, momento),
        FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE,
        FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Tabla de calificaciones detalladas por evaluación
    ejecutarConsulta("CREATE TABLE IF NOT EXISTS evaluaciones_notas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id INT NOT NULL,
        seccion_id INT NOT NULL,
        materia VARCHAR(100) NOT NULL,
        periodo_id INT NOT NULL,
        momento TINYINT NOT NULL COMMENT '1=MP1, 2=MP2, 3=MP3',
        notas_eval JSON NOT NULL COMMENT 'Array JSON con las notas de cada evaluación sobre 20',
        nota_momento DECIMAL(4,2) NOT NULL COMMENT 'Nota definitiva del momento sobre 20 puntos',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_eval_nota (estudiante_id, seccion_id, materia(80), periodo_id, momento),
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE,
        FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Tabla de auditoría y control de actividades de usuarios
    ejecutarConsulta("CREATE TABLE IF NOT EXISTS log_actividad (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL DEFAULT 0,
        usuario_nombre VARCHAR(200) NOT NULL,
        usuario_rol VARCHAR(50) NOT NULL,
        accion VARCHAR(50) NOT NULL,
        entidad VARCHAR(50) NOT NULL,
        entidad_id INT DEFAULT NULL,
        entidad_nombre VARCHAR(200) DEFAULT NULL,
        detalles TEXT DEFAULT NULL,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_fecha (fecha),
        KEY idx_entidad_accion (entidad, accion)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $migracionesEjecutadas = true;
}

/**
 * Obtiene los datos del usuario que está realizando la acción actual.
 */
function obtenerActor() {
    global $input;
    $usuario_id = 0;
    $usuario_nombre = 'Superadmin / Sistema';
    $usuario_rol = 'superadmin';

    if (isset($input['actor_user_id']) && !empty($input['actor_user_id'])) {
        $usuario_id = (int)$input['actor_user_id'];
    }
    if (isset($input['actor_nombre']) && !empty($input['actor_nombre'])) {
        $usuario_nombre = trim($input['actor_nombre']);
    }
    if (isset($input['actor_rol']) && !empty($input['actor_rol'])) {
        $usuario_rol = trim($input['actor_rol']);
    }

    if ($usuario_id === 0 && isset($_SERVER['HTTP_X_ACTOR_ID'])) {
        $usuario_id = (int)$_SERVER['HTTP_X_ACTOR_ID'];
        if (isset($_SERVER['HTTP_X_ACTOR_NAME'])) $usuario_nombre = urldecode($_SERVER['HTTP_X_ACTOR_NAME']);
        if (isset($_SERVER['HTTP_X_ACTOR_ROLE'])) $usuario_rol = urldecode($_SERVER['HTTP_X_ACTOR_ROLE']);
    }

    return [
        'id' => $usuario_id,
        'nombre' => $usuario_nombre,
        'rol' => $usuario_rol
    ];
}

/**
 * Registra un evento en la tabla log_actividad.
 */
function registrarLogActividad($accion, $entidad, $entidad_id = null, $entidad_nombre = null, $detalles = null, $actorPersonalizado = null) {
    try {
        $actor = $actorPersonalizado ?: obtenerActor();
        $sql = "INSERT INTO log_actividad (usuario_id, usuario_nombre, usuario_rol, accion, entidad, entidad_id, entidad_nombre, detalles, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        ejecutarConsulta($sql, [
            $actor['id'],
            $actor['nombre'],
            $actor['rol'],
            $accion,
            $entidad,
            $entidad_id,
            $entidad_nombre,
            $detalles
        ], "isssisss");
    } catch (\Throwable $e) {
        error_log("Error al registrar log_actividad: " . $e->getMessage());
    }
}


// ========== CIERRE DE PERÍODO Y CALIFICACIONES FINALES ==========

/**
 * Crea la tabla de calificaciones finales si todavía no existe.
 * Se invoca solo desde las acciones que la usan, para no sumar otra consulta
 * a todas las peticiones.
 */
function asegurarTablaCalificacionesFinales() {
    static $creada = false;
    if ($creada) return;

    ejecutarConsulta("CREATE TABLE IF NOT EXISTS calificaciones_finales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        periodo_id INT NOT NULL,
        estudiante_id INT NOT NULL,
        seccion_id INT NOT NULL,
        materia VARCHAR(100) NOT NULL,
        mp1 DECIMAL(4,2) DEFAULT NULL,
        mp2 DECIMAL(4,2) DEFAULT NULL,
        mp3 DECIMAL(4,2) DEFAULT NULL,
        definitiva DECIMAL(4,2) DEFAULT NULL,
        estado ENUM('aprobado','reprobado','sin_calificar') NOT NULL DEFAULT 'sin_calificar',
        cerrado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_final (periodo_id, estudiante_id, seccion_id, materia(80)),
        KEY idx_final_periodo (periodo_id),
        FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $creada = true;
}

/** Indica si el período indicado está cerrado. */
function periodoEstaCerrado($periodo_id) {
    $periodo_id = (int)$periodo_id;
    if ($periodo_id <= 0) return false;

    $res = ejecutarConsulta("SELECT estado FROM periodos WHERE id = ?", [$periodo_id], "i");
    if (!is_array($res) || isset($res['error']) || empty($res)) return false;

    return $res[0]['estado'] === 'cerrado';
}

/** Resuelve el id de un período a partir de su nombre (los formularios envían el nombre). */
function idPeriodoPorNombre($nombre) {
    if (!$nombre) return null;

    $res = ejecutarConsulta("SELECT id FROM periodos WHERE nombre = ? LIMIT 1", [$nombre], "s");
    if (!is_array($res) || isset($res['error']) || empty($res)) return null;

    return (int)$res[0]['id'];
}

/** Devuelve el error estándar cuando se intenta escribir en un período cerrado. */
function responderPeriodoCerrado() {
    echo json_encode([
        'success' => false,
        'codigo'  => 'periodo_cerrado',
        'error'   => 'El período está cerrado y no admite cambios en las calificaciones. Solicite al administrador que lo reabra desde Períodos.'
    ]);
}

/** Devuelve el texto en mayúsculas (respetando acentos y ñ). */
function textoMayusculas($texto) {
    $texto = trim((string)$texto);
    return function_exists('mb_strtoupper') ? mb_strtoupper($texto, 'UTF-8') : strtoupper($texto);
}

/** Cuenta filas de una consulta que devuelve una columna `total`. */
function contarRegistros($sql, $params = [], $types = "") {
    $res = ejecutarConsulta($sql, $params, $types);
    if (!is_array($res) || isset($res['error']) || empty($res)) return 0;
    return (int)$res[0]['total'];
}

// ========== PROMOCIÓN DE SECCIONES ==========

/** Año (1-6) a partir del nombre de una sección: "2do Año A" -> 2. */
function anioDeSeccionNombre($nombre) {
    if (preg_match('/(\d+)/', (string)$nombre, $coincidencia)) {
        return (int)$coincidencia[1];
    }
    return null;
}

/**
 * Nombre de la sección del año siguiente conservando el resto:
 * "1ro Año A" -> "2do Año A". Devuelve null si no se puede calcular.
 */
function nombreSeccionSiguiente($nombre) {
    $ordinales = [1 => '1ro', 2 => '2do', 3 => '3ro', 4 => '4to', 5 => '5to', 6 => '6to'];

    if (!preg_match('/^\s*(\d+)\s*(?:ro|do|to|er|º|°)?\s*(.*)$/iu', (string)$nombre, $partes)) {
        return null;
    }

    $siguiente = ((int)$partes[1]) + 1;
    if ($siguiente > 6) {
        return null;
    }

    $resto = trim($partes[2]);
    return $resto === '' ? $ordinales[$siguiente] : $ordinales[$siguiente] . ' ' . $resto;
}


// Detectar la acción solicitada
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Para peticiones POST, obtenemos el cuerpo JSON
$input = json_decode(file_get_contents('php://input'), true);

try {
switch ($action) {
    
    // ========== SOLICITUDES DE RESET DE CONTRASEÑA ==========
    /**
     * case 'request_reset':
     * Permite a un administrador solicitar el restablecimiento de su contraseña
     * verificando su cédula o email.
     */
    case 'request_reset':
        $cedula = isset($input['cedula']) ? trim($input['cedula']) : '';
        $email  = isset($input['email'])  ? trim($input['email'])  : '';
        $rol    = isset($input['rol']) && in_array($input['rol'], ['admin','teacher']) ? $input['rol'] : 'admin';
        if (!$cedula && !$email) {
            echo json_encode(['success' => false, 'error' => 'Debes ingresar tu cédula o email']);
            break;
        }
        if ($cedula) {
            $res = ejecutarConsulta("SELECT id, nombre, apellido FROM usuarios WHERE cedula = ? AND rol = ? LIMIT 1", [$cedula, $rol], "ss");
        } else {
            $res = ejecutarConsulta("SELECT id, nombre, apellido FROM usuarios WHERE email = ? AND rol = ? LIMIT 1", [$email, $rol], "ss");
        }
        if (empty($res) || isset($res['error'])) {
            $rolLabel = $rol === 'teacher' ? 'profesor' : 'administrador';
            echo json_encode(['success' => false, 'error' => "No se encontró un {$rolLabel} con esos datos"]);
            break;
        }
        $uid = $res[0]['id'];
        ejecutarConsulta("UPDATE usuarios SET solicitud_reset = 1, reset_fecha = NOW() WHERE id = ?", [$uid], "i");
        echo json_encode(['success' => true, 'nombre' => $res[0]['nombre'] . ' ' . $res[0]['apellido']]);
        break;

    case 'get_reset_requests':
        $rows = ejecutarConsulta("SELECT id, cedula, nombre, apellido, email, telefono, reset_fecha FROM usuarios WHERE solicitud_reset = 1 AND rol = 'admin' ORDER BY reset_fecha DESC");
        echo json_encode($rows ?: []);
        break;

    case 'clear_reset':
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) { echo json_encode(['success' => false, 'error' => 'ID inválido']); break; }
        $uInfo = ejecutarConsulta("SELECT nombre, apellido, cedula, rol FROM usuarios WHERE id = ?", [$id], "i");
        $uNom = !empty($uInfo) ? $uInfo[0]['nombre'].' '.$uInfo[0]['apellido'].' ('.$uInfo[0]['cedula'].')' : "Usuario #$id";
        ejecutarConsulta("UPDATE usuarios SET solicitud_reset = 0, reset_fecha = NULL WHERE id = ?", [$id], "i");
        registrarLogActividad('resolver_reset', 'administrador', $id, $uNom, 'Solicitud de reseteo de clave de administrador atendida');
        echo json_encode(['success' => true]);
        break;

    case 'get_teacher_reset_requests':
        $rows = ejecutarConsulta("SELECT id, cedula, nombre, apellido, email, telefono, reset_fecha FROM usuarios WHERE solicitud_reset = 1 AND rol = 'teacher' ORDER BY reset_fecha DESC");
        echo json_encode($rows ?: []);
        break;

    case 'clear_teacher_reset':
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) { echo json_encode(['success' => false, 'error' => 'ID inválido']); break; }
        $uInfo = ejecutarConsulta("SELECT nombre, apellido, cedula, rol FROM usuarios WHERE id = ?", [$id], "i");
        $uNom = !empty($uInfo) ? $uInfo[0]['nombre'].' '.$uInfo[0]['apellido'].' ('.$uInfo[0]['cedula'].')' : "Profesor #$id";
        ejecutarConsulta("UPDATE usuarios SET solicitud_reset = 0, reset_fecha = NULL WHERE id = ? AND rol = 'teacher'", [$id], "i");
        registrarLogActividad('resolver_reset', 'profesor', $id, $uNom, 'Solicitud de reseteo de clave de profesor atendida');
        echo json_encode(['success' => true]);
        break;

    // ========== USUARIOS (ADMINS Y PROFESORES) ==========

    /**
     * case 'get_users':
     * Retorna la lista de todos los usuarios registrados. Si el usuario es un profesor,
     * también adjunta sus materias y secciones asignadas.
     */
    case 'get_users':
        $sql = "SELECT * FROM usuarios ORDER BY id DESC";
        $users = ejecutarConsulta($sql);
        
        $asignaciones = ejecutarConsulta("SELECT * FROM teacher_assignments");
        $asig_by_teacher = [];
        if (is_array($asignaciones) && !isset($asignaciones['error'])) {
            foreach ($asignaciones as $asig) {
                $asig_by_teacher[$asig['teacher_id']][] = $asig;
            }
        }
        
        if (is_array($users) && !isset($users['error'])) {
            foreach ($users as &$user) {
                if ($user['rol'] === 'teacher') {
                    $user['asignaciones'] = isset($asig_by_teacher[$user['id']]) ? json_encode($asig_by_teacher[$user['id']]) : '[]';
                }
            }
        }
        echo json_encode($users);
        break;

    case 'save_user':
        $id = isset($input['id']) ? $input['id'] : null;
        $cedula = $input['cedula'];
        $nombre = $input['nombre'];
        $apellido = $input['apellido'];
        $email = isset($input['email']) ? $input['email'] : '';
        $telefono = isset($input['telefono']) ? $input['telefono'] : '';
        $rol = $input['rol'];
        $tipo_docente = isset($input['tipo_docente']) && in_array($input['tipo_docente'], ['docente', 'docente_guia', 'solo_guia']) 
            ? $input['tipo_docente'] 
            : 'docente';
        $activo = isset($input['activo']) ? (int)$input['activo'] : 1;
        
        $asignaciones = isset($input['asignaciones']) ? json_decode($input['asignaciones'], true) : [];
        $cambioClave = false;

        if ($id) {
            if (isset($input['password']) && !empty($input['password'])) {
                $pass = $input['password'];
                $sql = "UPDATE usuarios SET cedula=?, nombre=?, apellido=?, email=?, telefono=?, rol=?, tipo_docente=?, activo=?, password=? WHERE id=?";
                $result = ejecutarConsulta($sql, [$cedula, $nombre, $apellido, $email, $telefono, $rol, $tipo_docente, $activo, $pass, $id], "sssssssisi");
                $cambioClave = true;
            } else {
                $sql = "UPDATE usuarios SET cedula=?, nombre=?, apellido=?, email=?, telefono=?, rol=?, tipo_docente=?, activo=? WHERE id=?";
                $result = ejecutarConsulta($sql, [$cedula, $nombre, $apellido, $email, $telefono, $rol, $tipo_docente, $activo, $id], "sssssssii");
            }
            $teacher_id = $id;

            // Si el nombre o apellido cambió, actualizar profesor_guia_nombre en las secciones que guía
            if ($rol === 'teacher') {
                $nombreCompleto = trim($nombre . ' ' . $apellido);
                ejecutarConsulta("UPDATE secciones SET profesor_guia_nombre = ? WHERE profesor_guia_id = ?", [$nombreCompleto, $id], "si");
            }
        } else {
            $pass = isset($input['password']) ? $input['password'] : '123456';
            $sql = "INSERT INTO usuarios (cedula, nombre, apellido, email, telefono, rol, tipo_docente, activo, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $result = ejecutarConsulta($sql, [$cedula, $nombre, $apellido, $email, $telefono, $rol, $tipo_docente, $activo, $pass], "sssssssis");
            
            $res = ejecutarConsulta("SELECT id FROM usuarios WHERE cedula = ?", [$cedula], "s");
            if (is_array($res) && !empty($res) && !isset($res['error'])) {
                $teacher_id = $res[0]['id'];
            }
        }
        
        if ($result === false || (is_array($result) && isset($result['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($result) ? $result['error'] : 'Error al ejecutar la consulta']);
        } else {
            if ($rol === 'teacher' && isset($teacher_id)) {
                ejecutarConsulta("DELETE FROM teacher_assignments WHERE teacher_id = ?", [$teacher_id], "i");
                if (is_array($asignaciones)) {
                    foreach ($asignaciones as $asig) {
                        if (isset($asig['materia']) && isset($asig['seccion_id'])) {
                            ejecutarConsulta("INSERT INTO teacher_assignments (teacher_id, materia_nombre, seccion_id) VALUES (?, ?, ?)", [$teacher_id, $asig['materia'], $asig['seccion_id']], "isi");
                        }
                    }
                }
            }

            // Auditoría
            $entidad = ($rol === 'teacher') ? 'profesor' : 'administrador';
            $uNom = "{$nombre} {$apellido} ({$cedula})";
            if ($id) {
                if ($cambioClave) {
                    registrarLogActividad('cambio_clave', $entidad, $id, $uNom, "Modificación de contraseña y datos de {$entidad}");
                } else {
                    registrarLogActividad('modificar', $entidad, $id, $uNom, "Actualización de datos de perfil ({$email})");
                }
            } else {
                registrarLogActividad('crear', $entidad, $teacher_id ?? null, $uNom, "Registro de nuevo {$entidad} en el sistema");
            }

            echo json_encode(['success' => true]);
        }
        break;

    case 'toggle_user_status':
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $activo = isset($input['activo']) ? (int)$input['activo'] : 0;
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID de usuario no proporcionado']);
            break;
        }

        $u = ejecutarConsulta("SELECT nombre, apellido, cedula, rol FROM usuarios WHERE id = ?", [$id], "i");
        $uNom = !empty($u) ? $u[0]['nombre'].' '.$u[0]['apellido'].' ('.$u[0]['cedula'].')' : "Usuario #$id";
        $entidad = (!empty($u) && $u[0]['rol'] === 'admin') ? 'administrador' : 'profesor';

        $res = ejecutarConsulta("UPDATE usuarios SET activo = ? WHERE id = ?", [$activo, $id], "ii");
        if ($res === false || (is_array($res) && isset($res['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($res) ? $res['error'] : 'Error al actualizar estado del usuario']);
        } else {
            $accion = ($activo == 1) ? 'habilitar' : 'inhabilitar';
            $det = ($activo == 1) ? 'Habilitación de acceso al sistema' : 'Inhabilitación de acceso (bloqueo)';
            registrarLogActividad($accion, $entidad, $id, $uNom, $det);
            echo json_encode(['success' => true, 'activo' => $activo]);
        }
        break;

    case 'toggle_student_status':
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $activo = isset($input['activo']) ? (int)$input['activo'] : 0;
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID de estudiante no proporcionado']);
            break;
        }

        $s = ejecutarConsulta("SELECT nombre, apellido, cedula FROM estudiantes WHERE id = ?", [$id], "i");
        $sNom = !empty($s) ? $s[0]['apellido'].', '.$s[0]['nombre'].' ('.$s[0]['cedula'].')' : "Estudiante #$id";

        $res = ejecutarConsulta("UPDATE estudiantes SET activo = ? WHERE id = ?", [$activo, $id], "ii");
        if ($res === false || (is_array($res) && isset($res['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($res) ? $res['error'] : 'Error al actualizar estado del estudiante']);
        } else {
            $accion = ($activo == 1) ? 'habilitar' : 'inhabilitar';
            $det = ($activo == 1) ? 'Habilitación de matrícula activa' : 'Inhabilitación temporal de matrícula';
            registrarLogActividad($accion, 'estudiante', $id, $sNom, $det);
            echo json_encode(['success' => true, 'activo' => $activo]);
        }
        break;

    // ========== ESTUDIANTES ==========
    
    /**
     * case 'get_students':
     * Obtiene la lista completa de estudiantes junto con el nombre de la sección a la que pertenecen.
     */
    case 'get_students':
        $sql = "SELECT s.*, sec.nombre as seccion_nombre FROM estudiantes s LEFT JOIN secciones sec ON s.seccion_id = sec.id ORDER BY s.id DESC";
        echo json_encode(ejecutarConsulta($sql));
        break;

    case 'save_student':
        $id = isset($input['id']) ? $input['id'] : null;
        $cedula = $input['cedula'];
        // Los nombres de estudiantes se guardan siempre en mayúsculas, aunque el
        // dato llegue de un formulario o de una llamada directa a la API.
        $nombre = isset($input['nombre']) ? textoMayusculas($input['nombre']) : '';
        $apellido = isset($input['apellido']) ? textoMayusculas($input['apellido']) : '';
        $email = isset($input['email']) ? $input['email'] : '';
        $telefono = isset($input['telefono']) ? $input['telefono'] : '';
        $seccion_id = $input['seccion'];

        if ($id) {
            $sql = "UPDATE estudiantes SET cedula=?, nombre=?, apellido=?, email=?, telefono=?, seccion_id=? WHERE id=?";
            ejecutarConsulta($sql, [$cedula, $nombre, $apellido, $email, $telefono, $seccion_id, $id], "sssssii");
            registrarLogActividad('modificar', 'estudiante', $id, "{$apellido}, {$nombre} ({$cedula})", "Actualización de expediente académico");
        } else {
            $sql = "INSERT INTO estudiantes (cedula, nombre, apellido, email, telefono, seccion_id) VALUES (?, ?, ?, ?, ?, ?)";
            ejecutarConsulta($sql, [$cedula, $nombre, $apellido, $email, $telefono, $seccion_id], "sssssi");
            $sIns = ejecutarConsulta("SELECT id FROM estudiantes WHERE cedula = ?", [$cedula], "s");
            $sInsId = !empty($sIns) ? $sIns[0]['id'] : null;
            registrarLogActividad('crear', 'estudiante', $sInsId, "{$apellido}, {$nombre} ({$cedula})", "Inscripción en la matrícula oficial");
        }
        echo json_encode(['success' => true]);
        break;

    // ========== DATOS GLOBALES (SECCIONES Y MENCIONES) ==========
    
    /**
     * case 'get_all_data':
     * Endpoint crítico para la carga inicial de la aplicación en el Frontend.
     * Devuelve en una sola petición (JSON) todas las tablas maestras: 
     * usuarios, estudiantes, menciones, secciones, periodos y notas.
     */
    case 'get_all_data':
        $users = ejecutarConsulta("SELECT * FROM usuarios");
        $asignaciones = ejecutarConsulta("SELECT * FROM teacher_assignments");
        $asig_by_teacher = [];
        if (is_array($asignaciones) && !isset($asignaciones['error'])) {
            foreach ($asignaciones as $asig) {
                $asig_by_teacher[$asig['teacher_id']][] = $asig;
            }
        }
        
        if (is_array($users) && !isset($users['error'])) {
            foreach ($users as &$user) {
                if ($user['rol'] === 'teacher') {
                    $user['asignaciones'] = isset($asig_by_teacher[$user['id']]) ? json_encode($asig_by_teacher[$user['id']]) : '[]';
                }
            }
        }

        $data = [
            'users' => $users,
            'students' => ejecutarConsulta("SELECT * FROM estudiantes"),
            'mentions' => ejecutarConsulta("SELECT * FROM menciones"),
            'sections' => ejecutarConsulta("SELECT * FROM secciones"),
            'periods' => ejecutarConsulta("SELECT * FROM periodos"),
            'subjects' => ejecutarConsulta("SELECT * FROM asignaturas ORDER BY mencion_id ASC, anio ASC, nombre ASC"),
            'grades' => ejecutarConsulta("SELECT n.*, p.nombre AS nombre_periodo FROM notas n LEFT JOIN periodos p ON n.periodo_id = p.id")
        ];
        echo json_encode($data);
        break;

    case 'delete_user':
        $id = $input['id'];
        $u = ejecutarConsulta("SELECT nombre, apellido, cedula, rol FROM usuarios WHERE id = ?", [$id], "i");
        $uNom = !empty($u) ? $u[0]['nombre'].' '.$u[0]['apellido'].' ('.$u[0]['cedula'].')' : "Usuario #$id";
        $entidad = (!empty($u) && $u[0]['rol'] === 'admin') ? 'administrador' : 'profesor';

        ejecutarConsulta("UPDATE secciones SET profesor_guia_id = NULL, profesor_guia_nombre = NULL WHERE profesor_guia_id = ?", [$id], "i");
        $sql = "DELETE FROM usuarios WHERE id = ?";
        $res = ejecutarConsulta($sql, [$id], "i");
        if (is_array($res) && isset($res['error'])) {
            echo json_encode(['success' => false, 'error' => $res['error']]);
        } else {
            registrarLogActividad('eliminar', $entidad, $id, $uNom, "Eliminación permanente del usuario del sistema");
            echo json_encode(['success' => true]);
        }
        break;

    case 'delete_student':
        $id = $input['id'];
        $s = ejecutarConsulta("SELECT nombre, apellido, cedula FROM estudiantes WHERE id = ?", [$id], "i");
        $sNom = !empty($s) ? $s[0]['apellido'].', '.$s[0]['nombre'].' ('.$s[0]['cedula'].')' : "Estudiante #$id";

        $sql = "DELETE FROM estudiantes WHERE id = ?";
        ejecutarConsulta($sql, [$id], "i");
        registrarLogActividad('eliminar', 'estudiante', $id, $sNom, "Eliminación permanente del estudiante y sus calificaciones");
        echo json_encode(['success' => true]);
        break;

    // ========== MENCIONES ==========
    case 'save_mention':
        $id = isset($input['id']) && !empty($input['id']) ? intval($input['id']) : null;
        $nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
        $color = isset($input['color']) && !empty($input['color']) ? trim($input['color']) : '#4a151b';
        $icono = isset($input['icono']) && !empty($input['icono']) ? trim($input['icono']) : 'bx bx-category';

        if ($nombre === '') {
            echo json_encode(['success' => false, 'error' => 'El nombre de la mención es obligatorio']);
            break;
        }

        // Validar duplicados (insensible a mayúsculas/minúsculas)
        if ($id) {
            $dup = ejecutarConsulta("SELECT id FROM menciones WHERE LOWER(TRIM(nombre)) = LOWER(?) AND id != ?", [$nombre, $id], "si");
        } else {
            $dup = ejecutarConsulta("SELECT id FROM menciones WHERE LOWER(TRIM(nombre)) = LOWER(?)", [$nombre], "s");
        }

        if (!empty($dup)) {
            echo json_encode(['success' => false, 'error' => 'Ya existe una mención registrada con el nombre "' . $nombre . '"']);
            break;
        }

        if ($id) {
            $result = ejecutarConsulta("UPDATE menciones SET nombre=?, color=?, icono=? WHERE id=?", [$nombre, $color, $icono, $id], "sssi");
        } else {
            $result = ejecutarConsulta("INSERT INTO menciones (nombre, color, icono) VALUES (?, ?, ?)", [$nombre, $color, $icono], "sss");
        }

        if ($result === false || (is_array($result) && isset($result['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($result) ? $result['error'] : 'Error al guardar la mención']);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    case 'delete_mention':
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'ID de mención inválido']);
            break;
        }

        // Verificar si la mención tiene secciones asociadas
        $check = ejecutarConsulta("SELECT COUNT(*) as total FROM secciones WHERE mencion_id = ?", [$id], "i");
        if ($check && isset($check[0]['total']) && intval($check[0]['total']) > 0) {
            $total = $check[0]['total'];
            echo json_encode([
                'success' => false, 
                'error' => "No se puede eliminar la mención porque tiene {$total} sección(es) asociada(s). Debe reasignar o eliminar dichas secciones primero."
            ]);
            break;
        }

        $delResult = ejecutarConsulta("DELETE FROM menciones WHERE id=?", [$id], "i");
        if (is_array($delResult) && isset($delResult['error'])) {
            echo json_encode(['success' => false, 'error' => $delResult['error']]);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    // ========== SECCIONES ==========
    case 'save_section':
        $id = isset($input['id']) ? $input['id'] : null;
        $nombre = $input['nombre'];
        $mencion_id = $input['mencionId'];
        $profesor_guia_id = isset($input['profesorGuiaId']) && !empty($input['profesorGuiaId']) 
            ? intval($input['profesorGuiaId']) 
            : null;
        $profesor_guia_nombre = isset($input['profesorGuiaNombre']) && trim($input['profesorGuiaNombre']) !== '' 
            ? trim($input['profesorGuiaNombre']) 
            : null;

        // Si viene profesor_guia_id, asegurar el nombre actualizado desde usuarios
        if ($profesor_guia_id) {
            $profRes = ejecutarConsulta("SELECT nombre, apellido FROM usuarios WHERE id = ?", [$profesor_guia_id], "i");
            if (!empty($profRes) && !isset($profRes['error'])) {
                $profesor_guia_nombre = trim($profRes[0]['nombre'] . ' ' . $profRes[0]['apellido']);
            }
        }
        
        // Verificar duplicados
        $checkSql = "SELECT id FROM secciones WHERE nombre = ? AND mencion_id = ?";
        $params = [$nombre, $mencion_id];
        if ($id) {
            $checkSql .= " AND id != ?";
            $params[] = $id;
        }
        $existente = ejecutarConsulta($checkSql, $params, $id ? "sii" : "si");
        
        if (!empty($existente)) {
            echo json_encode(['success' => false, 'error' => 'Ya existe esta sección en esta mención']);
            break;
        }

        if ($id) {
            $result = ejecutarConsulta(
                "UPDATE secciones SET nombre=?, mencion_id=?, profesor_guia_id=?, profesor_guia_nombre=? WHERE id=?",
                [$nombre, $mencion_id, $profesor_guia_id, $profesor_guia_nombre, $id], "siisi"
            );
        } else {
            $result = ejecutarConsulta(
                "INSERT INTO secciones (nombre, mencion_id, profesor_guia_id, profesor_guia_nombre) VALUES (?, ?, ?, ?)",
                [$nombre, $mencion_id, $profesor_guia_id, $profesor_guia_nombre], "siis"
            );
        }
        if ($result === false || (is_array($result) && isset($result['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($result) ? $result['error'] : 'Error al ejecutar la consulta']);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    case 'delete_section':
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'ID de sección inválido']);
            break;
        }

        // 1. Verificar si la sección existe
        $sec = ejecutarConsulta("SELECT nombre FROM secciones WHERE id = ?", [$id], "i");
        if (empty($sec) || isset($sec['error'])) {
            echo json_encode(['success' => false, 'error' => 'La sección que intentas eliminar no existe']);
            break;
        }
        $nombreSeccion = $sec[0]['nombre'];

        // 2. Validar si tiene estudiantes inscritos
        $checkEst = ejecutarConsulta("SELECT COUNT(*) as total FROM estudiantes WHERE seccion_id = ?", [$id], "i");
        if ($checkEst && isset($checkEst[0]['total']) && intval($checkEst[0]['total']) > 0) {
            $totalEst = $checkEst[0]['total'];
            echo json_encode([
                'success' => false, 
                'error' => "No se puede eliminar la sección \"{$nombreSeccion}\" porque tiene {$totalEst} estudiante(s) inscrito(s). Debe reasignar o retirar a los estudiantes primero."
            ]);
            break;
        }

        // 3. Validar si tiene calificaciones / notas registradas en el historial
        $checkNotas = ejecutarConsulta("SELECT COUNT(*) as total FROM notas WHERE seccion_id = ?", [$id], "i");
        if ($checkNotas && isset($checkNotas[0]['total']) && intval($checkNotas[0]['total']) > 0) {
            $totalNotas = $checkNotas[0]['total'];
            echo json_encode([
                'success' => false, 
                'error' => "No se puede eliminar la sección \"{$nombreSeccion}\" porque tiene {$totalNotas} registro(s) de calificaciones académicas asociadas."
            ]);
            break;
        }

        // 4. Limpiar asignaciones docentes y evaluaciones asociadas de forma segura
        ejecutarConsulta("DELETE FROM teacher_assignments WHERE seccion_id = ?", [$id], "i");
        ejecutarConsulta("DELETE FROM evaluaciones_config WHERE seccion_id = ?", [$id], "i");

        // 5. Eliminar la sección
        $res = ejecutarConsulta("DELETE FROM secciones WHERE id=?", [$id], "i");
        if (is_array($res) && isset($res['error'])) {
            echo json_encode(['success' => false, 'error' => $res['error']]);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    // ========== PROMOCIÓN DE SECCIONES ==========

    /**
     * case 'promover_seccion':
     * Mueve uno o varios estudiantes de una sección a la del año siguiente.
     *
     * Reglas:
     *  - Solo con el período escolar cerrado (no debe haber ninguno activo).
     *  - No se promueve 6to año: los estudiantes egresan.
     *  - La sección destino debe ser del año inmediatamente siguiente y de la misma mención.
     *  - Si la sección destino no existe, se crea con la misma mención y profesor guía.
     *  - Todo se ejecuta en una transacción.
     */
    case 'promover_seccion':
        $origen_id  = isset($input['origen_id']) ? (int)$input['origen_id'] : 0;
        $destino_id = isset($input['destino_id']) ? (int)$input['destino_id'] : 0;
        $ids        = isset($input['estudiantes']) && is_array($input['estudiantes']) ? $input['estudiantes'] : [];

        if (!$origen_id) {
            echo json_encode(['success' => false, 'error' => 'No se indicó la sección de origen']);
            break;
        }

        $ids = array_values(array_unique(array_filter(array_map('intval', $ids), function ($v) { return $v > 0; })));
        if (count($ids) === 0) {
            echo json_encode(['success' => false, 'error' => 'Selecciona al menos un estudiante para promover']);
            break;
        }

        // 1. Solo con el año escolar cerrado
        $periodosAbiertos = contarRegistros("SELECT COUNT(*) AS total FROM periodos WHERE estado <> 'cerrado'");
        if ($periodosAbiertos > 0) {
            echo json_encode([
                'success' => false,
                'codigo'  => 'periodo_abierto',
                'error'   => 'Cierra el período escolar antes de promover secciones.'
            ]);
            break;
        }

        // 2. Sección de origen
        $origenRes = ejecutarConsulta("SELECT * FROM secciones WHERE id = ?", [$origen_id], "i");
        if (empty($origenRes) || isset($origenRes['error'])) {
            echo json_encode(['success' => false, 'error' => 'La sección de origen no existe']);
            break;
        }
        $origen = $origenRes[0];

        $anioOrigen = anioDeSeccionNombre($origen['nombre']);
        if ($anioOrigen === null) {
            echo json_encode(['success' => false, 'error' => 'No se pudo determinar el año de la sección "' . $origen['nombre'] . '"']);
            break;
        }
        if ($anioOrigen >= 6) {
            echo json_encode([
                'success' => false,
                'codigo'  => 'sexto_anio',
                'error'   => 'Los estudiantes de 6to año no se promueven: al terminar egresan del plantel.'
            ]);
            break;
        }

        // 3. Los estudiantes deben pertenecer a la sección de origen
        $marcas = implode(',', array_fill(0, count($ids), '?'));
        $tiposIds = str_repeat('i', count($ids));
        $pertenecen = ejecutarConsulta(
            "SELECT id FROM estudiantes WHERE seccion_id = ? AND id IN ($marcas)",
            array_merge([$origen_id], $ids),
            "i" . $tiposIds
        );
        if (!is_array($pertenecen) || isset($pertenecen['error']) || count($pertenecen) !== count($ids)) {
            echo json_encode([
                'success' => false,
                'error'   => 'Algunos de los estudiantes seleccionados ya no pertenecen a la sección "' . $origen['nombre'] . '". Recarga la página e inténtalo de nuevo.'
            ]);
            break;
        }

        // 4. Sección destino (existente o por crear)
        $creada = false;
        $destino_nombre = isset($input['destino_nombre']) ? trim($input['destino_nombre']) : '';
        $nombreDestino = null;

        if ($destino_id) {
            $destinoRes = ejecutarConsulta("SELECT * FROM secciones WHERE id = ?", [$destino_id], "i");
            if (empty($destinoRes) || isset($destinoRes['error'])) {
                echo json_encode(['success' => false, 'error' => 'La sección de destino no existe']);
                break;
            }
            $destino = $destinoRes[0];

            if ((int)$destino['id'] === (int)$origen['id']) {
                echo json_encode(['success' => false, 'error' => 'La sección de destino no puede ser la misma que la de origen']);
                break;
            }
            if ((string)$destino['mencion_id'] !== (string)$origen['mencion_id']) {
                echo json_encode(['success' => false, 'error' => 'La sección de destino debe ser de la misma mención']);
                break;
            }
            if (anioDeSeccionNombre($destino['nombre']) !== $anioOrigen + 1) {
                echo json_encode([
                    'success' => false,
                    'error'   => 'La sección de destino debe ser del año siguiente (año ' . ($anioOrigen + 1) . ')'
                ]);
                break;
            }
        } else {
            $ordinalesSiguiente = [2 => '2do', 3 => '3ro', 4 => '4to', 5 => '5to', 6 => '6to'];
            $ejemploSiguiente = isset($ordinalesSiguiente[$anioOrigen + 1]) ? $ordinalesSiguiente[$anioOrigen + 1] : '2do';

            if ($destino_nombre !== '') {
                // La sección nueva la nombró el usuario (por ejemplo "2do Año B")
                $longitudNombre = function_exists('mb_strlen') ? mb_strlen($destino_nombre, 'UTF-8') : strlen($destino_nombre);
                if ($longitudNombre > 50) {
                    echo json_encode(['success' => false, 'error' => 'El nombre de la sección no puede superar los 50 caracteres']);
                    break;
                }
                if (anioDeSeccionNombre($destino_nombre) !== $anioOrigen + 1) {
                    echo json_encode([
                        'success' => false,
                        'error'   => 'El nombre de la sección nueva debe indicar el año siguiente (por ejemplo: ' . $ejemploSiguiente . ' Año B)'
                    ]);
                    break;
                }
                $nombreDestino = $destino_nombre;
            } else {
                $nombreDestino = nombreSeccionSiguiente($origen['nombre']);
                if ($nombreDestino === null) {
                    echo json_encode(['success' => false, 'error' => 'No se pudo calcular la sección del año siguiente']);
                    break;
                }
            }

            // ¿Ya existe una sección con ese nombre en la misma mención?
            $existente = ejecutarConsulta(
                "SELECT * FROM secciones WHERE LOWER(TRIM(nombre)) = LOWER(?) AND mencion_id = ? LIMIT 1",
                [$nombreDestino, $origen['mencion_id']],
                "si"
            );
            if (!empty($existente) && !isset($existente['error'])) {
                if ($destino_nombre !== '') {
                    echo json_encode([
                        'success' => false,
                        'error'   => 'Ya existe la sección "' . $nombreDestino . '" en esta mención. Selecciónala en la lista de destinos.'
                    ]);
                    break;
                }
                // El nombre se calculó automáticamente: se reutiliza la sección existente
                $destino = $existente[0];
                $destino_id = (int)$destino['id'];
            }
        }

        // 5. Ejecutar en una transacción
        iniciarTransaccion();
        $fallo = null;

        if (!$destino_id) {
            $res = ejecutarConsulta(
                "INSERT INTO secciones (nombre, mencion_id, profesor_guia_id, profesor_guia_nombre) VALUES (?, ?, ?, ?)",
                [$nombreDestino, $origen['mencion_id'], $origen['profesor_guia_id'], $origen['profesor_guia_nombre']],
                "siss"
            );
            if ($res === false || (is_array($res) && isset($res['error']))) {
                $fallo = 'No se pudo crear la sección de destino';
            } else {
                $destino_id = ultimoIdInsertado();
                $creada = true;
            }
        }

        if ($fallo === null) {
            $res = ejecutarConsulta(
                "UPDATE estudiantes SET seccion_id = ? WHERE id IN ($marcas)",
                array_merge([$destino_id], $ids),
                "i" . $tiposIds
            );
            if ($res === false || (is_array($res) && isset($res['error']))) {
                $fallo = 'No se pudieron mover los estudiantes';
            }
        }

        if ($fallo !== null) {
            revertirTransaccion();
            echo json_encode(['success' => false, 'error' => $fallo]);
            break;
        }

        confirmarTransaccion();

        $destinoFinal = ejecutarConsulta("SELECT id, nombre FROM secciones WHERE id = ?", [$destino_id], "i");
        $totalDestino = contarRegistros("SELECT COUNT(*) AS total FROM estudiantes WHERE seccion_id = ?", [(int)$destino_id], "i");

        echo json_encode([
            'success'  => true,
            'movidos'  => count($ids),
            'origen'   => ['id' => (int)$origen['id'], 'nombre' => $origen['nombre']],
            'destino'  => [
                'id'     => (int)$destino_id,
                'nombre' => (!empty($destinoFinal) && !isset($destinoFinal['error'])) ? $destinoFinal[0]['nombre'] : $nombreDestino,
                'creada' => $creada,
                'total'  => $totalDestino
            ]
        ]);
        break;

    // ========== ASIGNATURAS POR MENCIÓN ==========
    case 'get_subjects':
        $mencion_id = isset($_GET['mencion_id']) ? intval($_GET['mencion_id']) : 0;
        if ($mencion_id > 0) {
            $sql = "SELECT a.*, m.nombre as mencion_nombre FROM asignaturas a LEFT JOIN menciones m ON a.mencion_id = m.id WHERE a.mencion_id = ? ORDER BY a.anio ASC, a.nombre ASC";
            echo json_encode(ejecutarConsulta($sql, [$mencion_id], "i"));
        } else {
            $sql = "SELECT a.*, m.nombre as mencion_nombre FROM asignaturas a LEFT JOIN menciones m ON a.mencion_id = m.id ORDER BY a.mencion_id ASC, a.anio ASC, a.nombre ASC";
            echo json_encode(ejecutarConsulta($sql));
        }
        break;

    case 'save_subject':
        $id = isset($input['id']) && !empty($input['id']) ? intval($input['id']) : null;
        $mencion_id = isset($input['mencion_id']) ? intval($input['mencion_id']) : 0;
        $anio = isset($input['anio']) ? intval($input['anio']) : 0;
        $nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
        $area = isset($input['area']) && !empty($input['area']) ? trim($input['area']) : 'general';

        if (!$mencion_id) {
            echo json_encode(['success' => false, 'error' => 'Debes seleccionar una mención válida']);
            break;
        }
        if ($anio < 1 || $anio > 6) {
            echo json_encode(['success' => false, 'error' => 'El año escolar debe estar entre 1ro y 6to año']);
            break;
        }
        if (empty($nombre)) {
            echo json_encode(['success' => false, 'error' => 'El nombre de la asignatura es obligatorio']);
            break;
        }

        // Verificar existencia de la mención
        $mCheck = ejecutarConsulta("SELECT id, nombre FROM menciones WHERE id = ?", [$mencion_id], "i");
        if (empty($mCheck) || isset($mCheck['error'])) {
            echo json_encode(['success' => false, 'error' => 'La mención seleccionada no existe']);
            break;
        }

        // Validar duplicado en la misma mención y año
        $checkDupSql = "SELECT id FROM asignaturas WHERE LOWER(TRIM(nombre)) = LOWER(?) AND mencion_id = ? AND anio = ?";
        $params = [$nombre, $mencion_id, $anio];
        $types = "sii";
        if ($id) {
            $checkDupSql .= " AND id != ?";
            $params[] = $id;
            $types .= "i";
        }
        $dup = ejecutarConsulta($checkDupSql, $params, $types);
        if (!empty($dup)) {
            echo json_encode(['success' => false, 'error' => "La asignatura \"{$nombre}\" ya está registrada en {$anio}° Año para esta mención"]);
            break;
        }

        if ($id) {
            // Obtener datos previos de la asignatura para detectar si cambió de nombre
            $oldSub = ejecutarConsulta("SELECT nombre, mencion_id, anio, area FROM asignaturas WHERE id = ?", [$id], "i");
            $oldNombre = (!empty($oldSub) && isset($oldSub[0]['nombre'])) ? $oldSub[0]['nombre'] : null;

            $sql = "UPDATE asignaturas SET mencion_id=?, anio=?, nombre=?, area=? WHERE id=?";
            $res = ejecutarConsulta($sql, [$mencion_id, $anio, $nombre, $area, $id], "iissi");

            // Si el nombre cambió, propagar en cascada a notas, asignaciones y evaluaciones
            if ($oldNombre && $oldNombre !== $nombre) {
                ejecutarConsulta("UPDATE notas SET materia = ? WHERE materia = ?", [$nombre, $oldNombre], "ss");
                ejecutarConsulta("UPDATE teacher_assignments SET materia_nombre = ? WHERE materia_nombre = ?", [$nombre, $oldNombre], "ss");
                ejecutarConsulta("UPDATE evaluaciones_config SET materia = ? WHERE materia = ?", [$nombre, $oldNombre], "ss");

                $teachers = ejecutarConsulta("SELECT id, asignaciones FROM usuarios WHERE rol = 'teacher' AND asignaciones LIKE ?", ['%' . $oldNombre . '%'], "s");
                if (!empty($teachers)) {
                    foreach ($teachers as $t) {
                        $asigs = json_decode($t['asignaciones'], true);
                        if (is_array($asigs)) {
                            $mod = false;
                            foreach ($asigs as &$a) {
                                if (isset($a['materia']) && $a['materia'] === $oldNombre) {
                                    $a['materia'] = $nombre;
                                    $mod = true;
                                }
                            }
                            if ($mod) {
                                ejecutarConsulta("UPDATE usuarios SET asignaciones = ? WHERE id = ?", [json_encode($asigs), $t['id']], "si");
                            }
                        }
                    }
                }
            }
        } else {
            $sql = "INSERT INTO asignaturas (mencion_id, anio, nombre, area) VALUES (?, ?, ?, ?)";
            $res = ejecutarConsulta($sql, [$mencion_id, $anio, $nombre, $area], "iiss");
        }

        if ($res === false || (is_array($res) && isset($res['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($res) ? $res['error'] : 'Error al guardar la asignatura']);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    case 'delete_subject':
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'ID de asignatura inválido']);
            break;
        }

        $sub = ejecutarConsulta("SELECT nombre FROM asignaturas WHERE id = ?", [$id], "i");
        if (empty($sub) || isset($sub['error'])) {
            echo json_encode(['success' => false, 'error' => 'La asignatura no existe']);
            break;
        }
        $matNombre = $sub[0]['nombre'];

        // Verificar si tiene notas asociadas
        $checkNotas = ejecutarConsulta("SELECT COUNT(*) as total FROM notas WHERE materia = ?", [$matNombre], "s");
        if ($checkNotas && isset($checkNotas[0]['total']) && intval($checkNotas[0]['total']) > 0) {
            $tot = $checkNotas[0]['total'];
            echo json_encode(['success' => false, 'error' => "No se puede eliminar la asignatura \"{$matNombre}\" porque tiene {$tot} calificación(es) registrada(s)."]);
            break;
        }

        $res = ejecutarConsulta("DELETE FROM asignaturas WHERE id = ?", [$id], "i");
        if (is_array($res) && isset($res['error'])) {
            echo json_encode(['success' => false, 'error' => $res['error']]);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    // ========== PERÍODOS ==========
    case 'save_period':
        $id = isset($input['id']) ? $input['id'] : null;

        // El nombre es libre (no se exige el formato AAAA-AAAA), pero debe existir,
        // caber en la columna y no repetirse: hay acciones que resuelven el período por nombre.
        $n = isset($input['nombre']) ? trim($input['nombre']) : '';
        if ($n === '') {
            echo json_encode(['success' => false, 'error' => 'El nombre del período es obligatorio']);
            break;
        }
        $longitud = function_exists('mb_strlen') ? mb_strlen($n, 'UTF-8') : strlen($n);
        if ($longitud > 50) {
            echo json_encode(['success' => false, 'error' => 'El nombre del período no puede superar los 50 caracteres']);
            break;
        }

        $dupParams = [$n];
        $dupTypes = "s";
        $dupSql = "SELECT id FROM periodos WHERE LOWER(TRIM(nombre)) = LOWER(?)";
        if ($id) {
            $dupSql .= " AND id != ?";
            $dupParams[] = (int)$id;
            $dupTypes .= "i";
        }
        $duplicado = ejecutarConsulta($dupSql, $dupParams, $dupTypes);
        if (!empty($duplicado) && !isset($duplicado['error'])) {
            echo json_encode(['success' => false, 'error' => 'Ya existe un período con el nombre "' . $n . '"']);
            break;
        }

        $fi = $input['fechaInicio'];
        $ff = $input['fechaFin'];
        $m1 = $input['fechaMP1'];
        $m2 = $input['fechaMP2'];
        $m3 = $input['fechaMP3'];
        $est = $input['estado'];

        // El cierre debe pasar por 'close_active_period': es la única acción que
        // congela las calificaciones finales. Si no, se cerraría sin dejar el acta.
        if ($id) {
            $actual = ejecutarConsulta("SELECT estado FROM periodos WHERE id = ?", [(int)$id], "i");
            if ($est === 'cerrado' && is_array($actual) && !empty($actual) && $actual[0]['estado'] !== 'cerrado') {
                echo json_encode([
                    'success' => false,
                    'codigo'  => 'usar_cierre',
                    'error'   => 'Para cerrar un período use la opción de cierre: además de bloquear las notas, congela las calificaciones finales.'
                ]);
                break;
            }
        }

        if ($id) {
            $sql = "UPDATE periodos SET nombre=?, fecha_inicio=?, fecha_fin=?, fecha_mp1=?, fecha_mp2=?, fecha_mp3=?, estado=? WHERE id=?";
            $result = ejecutarConsulta($sql, [$n, $fi, $ff, $m1, $m2, $m3, $est, $id], "sssssssi");
        } else {
            $sql = "INSERT INTO periodos (nombre, fecha_inicio, fecha_fin, fecha_mp1, fecha_mp2, fecha_mp3, estado) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $result = ejecutarConsulta($sql, [$n, $fi, $ff, $m1, $m2, $m3, $est], "sssssss");
        }
        if ($result === false || (is_array($result) && isset($result['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($result) ? $result['error'] : 'Error al ejecutar la consulta']);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    case 'delete_period':
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'ID del período no proporcionado']);
            break;
        }

        $periodo = ejecutarConsulta("SELECT id, nombre, estado FROM periodos WHERE id = ?", [$id], "i");
        if (empty($periodo) || isset($periodo['error'])) {
            echo json_encode(['success' => false, 'error' => 'El período indicado no existe']);
            break;
        }

        // Un período activo no se elimina: primero debe cerrarse.
        if ($periodo[0]['estado'] !== 'cerrado') {
            echo json_encode([
                'success' => false,
                'error' => 'No se puede eliminar un período activo. Ciérrelo primero si realmente desea eliminarlo.'
            ]);
            break;
        }

        // Las notas se borran en cascada, así que se bloquea el borrado si hay
        // calificaciones registradas: eliminar un período no debe destruir un año escolar.
        asegurarTablaCalificacionesFinales();

        $totalNotas   = contarRegistros("SELECT COUNT(*) AS total FROM notas WHERE periodo_id = ?", [$id], "i");
        $totalFinales = contarRegistros("SELECT COUNT(*) AS total FROM calificaciones_finales WHERE periodo_id = ?", [$id], "i");
        $totalEval    = contarRegistros("SELECT COUNT(*) AS total FROM evaluaciones_config WHERE periodo_id = ?", [$id], "i");
        $totalEvalNot = contarRegistros("SELECT COUNT(*) AS total FROM evaluaciones_notas WHERE periodo_id = ?", [$id], "i");

        if ($totalNotas > 0 || $totalFinales > 0 || $totalEval > 0 || $totalEvalNot > 0) {
            $detalle = [];
            if ($totalNotas > 0)   $detalle[] = "{$totalNotas} calificación(es)";
            if ($totalFinales > 0) $detalle[] = "{$totalFinales} calificación(es) final(es)";
            if ($totalEval > 0)    $detalle[] = "{$totalEval} configuración(es) de evaluación";
            if ($totalEvalNot > 0) $detalle[] = "{$totalEvalNot} nota(s) de evaluación";

            echo json_encode([
                'success' => false,
                'codigo'  => 'periodo_con_datos',
                'error'   => "No se puede eliminar el período \"{$periodo[0]['nombre']}\" porque contiene "
                             . implode(', ', $detalle)
                             . '. Los períodos con calificaciones deben conservarse como historial académico.'
            ]);
            break;
        }

        $result = ejecutarConsulta("DELETE FROM periodos WHERE id = ?", [$id], "i");
        if ($result === false || (is_array($result) && isset($result['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($result) ? $result['error'] : 'Error al ejecutar la consulta']);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    /**
     * case 'close_active_period':
     * Cierra un período y congela su resultado definitivo.
     *
     * Antes solo cambiaba el estado, de modo que las notas podían seguir editándose.
     * Ahora: consolida las notas (una por estudiante, sección y materia), calcula la
     * definitiva final de cada materia a partir de los momentos realmente cargados,
     * la guarda en `calificaciones_finales` —de forma inmutable— y por último marca
     * el período como cerrado. Todo ocurre en una transacción: si algo falla, el
     * período no queda cerrado a medias.
     */
    case 'close_active_period':
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'ID del período no proporcionado']);
            break;
        }

        $periodo = ejecutarConsulta("SELECT id, nombre, estado FROM periodos WHERE id = ?", [$id], "i");
        if (empty($periodo) || isset($periodo['error'])) {
            echo json_encode(['success' => false, 'error' => 'El período indicado no existe']);
            break;
        }
        if ($periodo[0]['estado'] === 'cerrado') {
            echo json_encode(['success' => false, 'error' => 'El período "' . $periodo[0]['nombre'] . '" ya está cerrado']);
            break;
        }

        // 1. Leer las notas del período. Se ordenan por id ascendente para que,
        //    si existieran duplicados, se conserve la última registrada.
        $notas = ejecutarConsulta("SELECT * FROM notas WHERE periodo_id = ? ORDER BY id ASC", [$id], "i");
        if ($notas === false) {
            echo json_encode(['success' => false, 'error' => 'No se pudieron leer las calificaciones del período']);
            break;
        }

        $consolidadas = [];
        if (is_array($notas) && !isset($notas['error'])) {
            foreach ($notas as $nota) {
                $clave = $nota['estudiante_id'] . '|' . $nota['seccion_id'] . '|' . $nota['materia'];
                $consolidadas[$clave] = $nota;
            }
        }

        asegurarTablaCalificacionesFinales();
        iniciarTransaccion();

        $resumen = ['materias' => 0, 'aprobadas' => 0, 'reprobadas' => 0, 'sin_calificar' => 0];
        $fallo = null;

        foreach ($consolidadas as $nota) {
            $mp1 = ($nota['mp1'] === null || $nota['mp1'] === '') ? null : (float)$nota['mp1'];
            $mp2 = ($nota['mp2'] === null || $nota['mp2'] === '') ? null : (float)$nota['mp2'];
            $mp3 = ($nota['mp3'] === null || $nota['mp3'] === '') ? null : (float)$nota['mp3'];

            // La definitiva final es el promedio de los momentos efectivamente cargados
            $momentos = array_values(array_filter([$mp1, $mp2, $mp3], function ($v) { return $v !== null; }));
            $definitiva = count($momentos) > 0
                ? round(array_sum($momentos) / count($momentos), 2)
                : null;

            if ($definitiva === null) {
                $estadoFinal = 'sin_calificar';
            } elseif ($definitiva >= 10) {
                $estadoFinal = 'aprobado';
            } else {
                $estadoFinal = 'reprobado';
            }

            $res = ejecutarConsulta(
                "INSERT INTO calificaciones_finales
                     (periodo_id, estudiante_id, seccion_id, materia, mp1, mp2, mp3, definitiva, estado, cerrado_en)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                     mp1 = VALUES(mp1), mp2 = VALUES(mp2), mp3 = VALUES(mp3),
                     definitiva = VALUES(definitiva), estado = VALUES(estado), cerrado_en = NOW()",
                [
                    $id,
                    (int)$nota['estudiante_id'],
                    (int)$nota['seccion_id'],
                    $nota['materia'],
                    $mp1, $mp2, $mp3, $definitiva, $estadoFinal
                ],
                "iiisdddds"
            );

            if ($res === false || (is_array($res) && isset($res['error']))) {
                $fallo = 'No se pudieron guardar las calificaciones finales: ' . (is_array($res) ? $res['error'] : 'error desconocido');
                break;
            }

            // Reflejar la definitiva consolidada en la tabla de notas
            if ($definitiva !== null && (float)$nota['definitiva'] !== (float)$definitiva) {
                ejecutarConsulta("UPDATE notas SET definitiva = ? WHERE id = ?", [$definitiva, (int)$nota['id']], "di");
            }

            $resumen['materias']++;
            if ($estadoFinal === 'aprobado')      $resumen['aprobadas']++;
            elseif ($estadoFinal === 'reprobado') $resumen['reprobadas']++;
            else                                  $resumen['sin_calificar']++;
        }

        // 2. Cerrar el período solo si todo se guardó correctamente
        if ($fallo === null) {
            $res = ejecutarConsulta("UPDATE periodos SET estado = 'cerrado' WHERE id = ?", [$id], "i");
            if ($res === false || (is_array($res) && isset($res['error']))) {
                $fallo = 'No se pudo marcar el período como cerrado';
            }
        }

        if ($fallo !== null) {
            revertirTransaccion();
            echo json_encode(['success' => false, 'error' => $fallo]);
            break;
        }

        confirmarTransaccion();
        echo json_encode([
            'success' => true,
            'periodo' => $periodo[0]['nombre'],
            'resumen' => $resumen,
            'mensaje' => 'Período cerrado. Se congelaron las calificaciones finales de '
                         . $resumen['materias'] . ' materia(s) por estudiante.'
        ]);
        break;

    /**
     * case 'get_calificaciones_finales':
     * Consulta el resultado congelado de un período cerrado.
     * Filtros opcionales: periodo_id, estudiante_id.
     */
    case 'get_calificaciones_finales':
        $periodo_id    = isset($_GET['periodo_id']) ? (int)$_GET['periodo_id'] : 0;
        $estudiante_id = isset($_GET['estudiante_id']) ? (int)$_GET['estudiante_id'] : 0;

        asegurarTablaCalificacionesFinales();

        $sql = "SELECT cf.*, e.cedula, CONCAT(e.apellido, ', ', e.nombre) AS estudiante_nombre,
                       s.nombre AS seccion_nombre, p.nombre AS periodo_nombre
                FROM calificaciones_finales cf
                LEFT JOIN estudiantes e ON cf.estudiante_id = e.id
                LEFT JOIN secciones s ON cf.seccion_id = s.id
                LEFT JOIN periodos p ON cf.periodo_id = p.id";

        $condiciones = [];
        $params = [];
        $types = "";

        if ($periodo_id > 0) {
            $condiciones[] = "cf.periodo_id = ?";
            $params[] = $periodo_id;
            $types .= "i";
        }
        if ($estudiante_id > 0) {
            $condiciones[] = "cf.estudiante_id = ?";
            $params[] = $estudiante_id;
            $types .= "i";
        }
        if (count($condiciones) > 0) {
            $sql .= " WHERE " . implode(" AND ", $condiciones);
        }
        $sql .= " ORDER BY s.nombre ASC, e.apellido ASC, e.nombre ASC, cf.materia ASC";

        $rows = ejecutarConsulta($sql, $params, $types);
        echo json_encode(is_array($rows) ? $rows : []);
        break;

    // ========== CONFIGURACIÓN DE EVALUACIONES ==========

    /**
     * case 'get_evaluaciones':
     * Obtiene la configuración de evaluaciones para un teacher_id dado.
     * Si se pasan filtros (seccion_id, materia, periodo_id), filtra adicionalmente.
     */
    case 'get_evaluaciones':
        $teacher_id = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : 0;
        if ($teacher_id > 0) {
            $sql = "SELECT ec.*, p.nombre AS periodo_nombre, s.nombre AS seccion_nombre,
                           CONCAT(u.nombre, ' ', u.apellido) AS teacher_nombre
                    FROM evaluaciones_config ec
                    LEFT JOIN usuarios u ON ec.teacher_id = u.id
                    LEFT JOIN periodos p ON ec.periodo_id = p.id
                    LEFT JOIN secciones s ON ec.seccion_id = s.id
                    WHERE ec.teacher_id = ?
                    ORDER BY ec.seccion_id, ec.materia, ec.periodo_id, ec.momento";
            $rows = ejecutarConsulta($sql, [$teacher_id], "i");
        } else {
            // Sin filtro de profesor (vista admin general): devuelve todas las evaluaciones
            $sql = "SELECT ec.*, p.nombre AS periodo_nombre, s.nombre AS seccion_nombre,
                           CONCAT(u.nombre, ' ', u.apellido) AS teacher_nombre
                    FROM evaluaciones_config ec
                    LEFT JOIN usuarios u ON ec.teacher_id = u.id
                    LEFT JOIN periodos p ON ec.periodo_id = p.id
                    LEFT JOIN secciones s ON ec.seccion_id = s.id
                    ORDER BY ec.teacher_id, ec.seccion_id, ec.materia, ec.periodo_id, ec.momento";
            $rows = ejecutarConsulta($sql);
        }
        echo json_encode(is_array($rows) ? $rows : []);
        break;

    /**
     * case 'get_evaluaciones_detalle':
     * Devuelve, en una sola llamada, la configuración de evaluaciones y las notas
     * cargadas de una sección en un período. Lo usa el boletín de evaluaciones.
     *
     * Parámetros: seccion_id, periodo_id (obligatorios) y estudiante_id (opcional).
     */
    case 'get_evaluaciones_detalle':
        $seccion_id    = isset($_GET['seccion_id']) ? (int)$_GET['seccion_id'] : 0;
        $periodo_id    = isset($_GET['periodo_id']) ? (int)$_GET['periodo_id'] : 0;
        $estudiante_id = isset($_GET['estudiante_id']) ? (int)$_GET['estudiante_id'] : 0;

        if (!$seccion_id || !$periodo_id) {
            echo json_encode(['config' => [], 'notas' => []]);
            break;
        }

        $config = ejecutarConsulta(
            "SELECT ec.*, CONCAT(u.nombre, ' ', u.apellido) AS teacher_nombre
             FROM evaluaciones_config ec
             LEFT JOIN usuarios u ON ec.teacher_id = u.id
             WHERE ec.seccion_id = ? AND ec.periodo_id = ?
             ORDER BY ec.materia ASC, ec.momento ASC, ec.id ASC",
            [$seccion_id, $periodo_id],
            "ii"
        );

        $sqlNotas = "SELECT en.*, CONCAT(e.apellido, ', ', e.nombre) AS estudiante_nombre
                     FROM evaluaciones_notas en
                     LEFT JOIN estudiantes e ON en.estudiante_id = e.id
                     WHERE en.seccion_id = ? AND en.periodo_id = ?";
        $paramsNotas = [$seccion_id, $periodo_id];
        $tiposNotas = "ii";

        if ($estudiante_id > 0) {
            $sqlNotas .= " AND en.estudiante_id = ?";
            $paramsNotas[] = $estudiante_id;
            $tiposNotas .= "i";
        }

        $sqlNotas .= " ORDER BY en.materia ASC, en.momento ASC";
        $notas = ejecutarConsulta($sqlNotas, $paramsNotas, $tiposNotas);

        echo json_encode([
            'config' => is_array($config) ? $config : [],
            'notas'  => is_array($notas) ? $notas : []
        ]);
        break;

    /**
     * case 'save_evaluaciones':
     * Guarda (INSERT o UPDATE) la configuración de evaluaciones para un momento específico.
     * Recibe: teacher_id, seccion_id, materia, periodo_id, momento, num_evaluaciones, porcentajes[], nombres[]
     */
    case 'save_evaluaciones':
        $teacher_id     = isset($input['teacher_id'])      ? (int)$input['teacher_id']      : 0;
        $seccion_id     = isset($input['seccion_id'])      ? (int)$input['seccion_id']       : 0;
        $materia        = isset($input['materia'])         ? trim($input['materia'])          : '';
        $periodo_id     = isset($input['periodo_id'])      ? (int)$input['periodo_id']       : 0;
        $momento        = isset($input['momento'])         ? (int)$input['momento']          : 0;
        $num_eval       = isset($input['num_evaluaciones']) ? (int)$input['num_evaluaciones'] : 1;
        $porcentajes    = isset($input['porcentajes'])     ? $input['porcentajes']            : [];
        $nombres        = isset($input['nombres'])         ? $input['nombres']               : [];

        if (!$teacher_id || !$seccion_id || !$materia || !$periodo_id || !$momento) {
            echo json_encode(['success' => false, 'error' => 'Faltan campos obligatorios']);
            break;
        }
        if ($momento < 1 || $momento > 3) {
            echo json_encode(['success' => false, 'error' => 'Momento inválido (debe ser 1, 2 o 3)']);
            break;
        }
        if ($num_eval < 1 || $num_eval > 7) {
            echo json_encode(['success' => false, 'error' => 'Número de evaluaciones inválido (1-7)']);
            break;
        }

        // Un período cerrado no admite cambios en la configuración de evaluaciones
        if (periodoEstaCerrado($periodo_id)) {
            responderPeriodoCerrado();
            break;
        }

        $total = array_sum(array_map('floatval', $porcentajes));
        if (abs($total - 100) > 0.01) {
            echo json_encode(['success' => false, 'error' => "Los porcentajes deben sumar 100% (suma actual: {$total}%)"]);
            break;
        }

        $porcentajes_json = json_encode(array_map('floatval', $porcentajes));
        $nombres_json     = json_encode(array_map('strval',   $nombres));

        $sql = "INSERT INTO evaluaciones_config
                    (teacher_id, seccion_id, materia, periodo_id, momento, num_evaluaciones, porcentajes, nombres)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    num_evaluaciones = VALUES(num_evaluaciones),
                    porcentajes      = VALUES(porcentajes),
                    nombres          = VALUES(nombres),
                    updated_at       = CURRENT_TIMESTAMP";

        $result = ejecutarConsulta($sql,
            [$teacher_id, $seccion_id, $materia, $periodo_id, $momento, $num_eval, $porcentajes_json, $nombres_json],
            "iisiisss"
        );

        if ($result === false || (is_array($result) && isset($result['error']))) {
            echo json_encode(['success' => false, 'error' => is_array($result) ? $result['error'] : 'Error al guardar la configuración']);
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    case 'get_evaluaciones_notas':
        $seccion_id = isset($_GET['seccion_id']) ? (int)$_GET['seccion_id'] : 0;
        $materia    = isset($_GET['materia']) ? trim($_GET['materia']) : '';
        $periodo_id = isset($_GET['periodo_id']) ? (int)$_GET['periodo_id'] : 0;
        $momento    = isset($_GET['momento']) ? (int)$_GET['momento'] : 0;

        if (!$seccion_id || !$materia || !$periodo_id || !$momento) {
            echo json_encode([]);
            break;
        }

        $sql = "SELECT en.*, e.cedula, CONCAT(e.nombre, ' ', e.apellido) as estudiante_nombre
                FROM evaluaciones_notas en
                JOIN estudiantes e ON en.estudiante_id = e.id
                WHERE en.seccion_id = ? AND en.materia = ? AND en.periodo_id = ? AND en.momento = ?
                ORDER BY e.apellido, e.nombre";
        $rows = ejecutarConsulta($sql, [$seccion_id, $materia, $periodo_id, $momento], "isii");
        echo json_encode(is_array($rows) ? $rows : []);
        break;

    case 'save_evaluaciones_notas':
        $seccion_id     = isset($input['seccion_id']) ? (int)$input['seccion_id'] : 0;
        $materia        = isset($input['materia']) ? trim($input['materia']) : '';
        $periodo_id     = isset($input['periodo_id']) ? (int)$input['periodo_id'] : 0;
        $momento        = isset($input['momento']) ? (int)$input['momento'] : 0;
        $calificaciones = isset($input['calificaciones']) && is_array($input['calificaciones']) ? $input['calificaciones'] : [];

        if (!$seccion_id || !$materia || !$periodo_id || !$momento) {
            echo json_encode(['success' => false, 'error' => 'Datos incompletos para guardar calificaciones de evaluaciones']);
            break;
        }

        // Un período cerrado no admite cambios de notas (bloqueo real, no solo visual)
        if (periodoEstaCerrado($periodo_id)) {
            responderPeriodoCerrado();
            break;
        }

        $momentoCol = "mp" . $momento; // mp1, mp2, mp3

        foreach ($calificaciones as $c) {
            $estudiante_id = isset($c['estudiante_id']) ? (int)$c['estudiante_id'] : 0;
            if (!$estudiante_id) continue;

            $notas_eval_json = json_encode(isset($c['notas_eval']) ? $c['notas_eval'] : []);
            $nota_momento = isset($c['nota_momento']) && $c['nota_momento'] !== null && $c['nota_momento'] !== '' ? floatval($c['nota_momento']) : null;

            if ($nota_momento !== null) {
                if ($nota_momento > 20) $nota_momento = 20;
                if ($nota_momento < 0) $nota_momento = 0;
            }

            // 1. Guardar o actualizar en evaluaciones_notas
            $sqlEn = "INSERT INTO evaluaciones_notas (estudiante_id, seccion_id, materia, periodo_id, momento, notas_eval, nota_momento)
                      VALUES (?, ?, ?, ?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE
                          notas_eval = VALUES(notas_eval),
                          nota_momento = VALUES(nota_momento),
                          updated_at = CURRENT_TIMESTAMP";
            ejecutarConsulta($sqlEn, [$estudiante_id, $seccion_id, $materia, $periodo_id, $momento, $notas_eval_json, $nota_momento !== null ? $nota_momento : 0], "iisiisd");

            // 2. Sincronizar automáticamente con la tabla notas
            if ($nota_momento !== null) {
                $checkNota = ejecutarConsulta("SELECT id, mp1, mp2, mp3, inas1, inas2, inas3 FROM notas WHERE estudiante_id = ? AND seccion_id = ? AND materia = ? AND periodo_id = ?",
                    [$estudiante_id, $seccion_id, $materia, $periodo_id], "iisi");

                if (!empty($checkNota) && !isset($checkNota['error'])) {
                    $currentNota = $checkNota[0];
                    $notaId = $currentNota['id'];

                    $m1 = ($momento === 1) ? $nota_momento : $currentNota['mp1'];
                    $m2 = ($momento === 2) ? $nota_momento : $currentNota['mp2'];
                    $m3 = ($momento === 3) ? $nota_momento : $currentNota['mp3'];

                    $validMps = [];
                    if ($m1 !== null && $m1 !== '') $validMps[] = floatval($m1);
                    if ($m2 !== null && $m2 !== '') $validMps[] = floatval($m2);
                    if ($m3 !== null && $m3 !== '') $validMps[] = floatval($m3);

                    $definitiva = !empty($validMps) ? round(array_sum($validMps) / count($validMps), 2) : null;

                    $sqlUpNota = "UPDATE notas SET {$momentoCol} = ?, definitiva = ? WHERE id = ?";
                    ejecutarConsulta($sqlUpNota, [$nota_momento, $definitiva, $notaId], "ddi");
                } else {
                    $m1 = ($momento === 1) ? $nota_momento : null;
                    $m2 = ($momento === 2) ? $nota_momento : null;
                    $m3 = ($momento === 3) ? $nota_momento : null;
                    $definitiva = $nota_momento;

                    $sqlInsNota = "INSERT INTO notas (estudiante_id, seccion_id, materia, periodo_id, mp1, inas1, mp2, inas2, mp3, inas3, definitiva)
                                   VALUES (?, ?, ?, ?, ?, 0, ?, 0, ?, 0, ?)";
                    ejecutarConsulta($sqlInsNota, [$estudiante_id, $seccion_id, $materia, $periodo_id, $m1, $m2, $m3, $definitiva], "iisidddd");
                }
            }
        }

        echo json_encode(['success' => true]);
        break;



    // ========== NOTAS ==========
    case 'save_grade':
        $id = isset($input['id']) ? $input['id'] : null;
        $sid = $input['studentId'];
        $secid = $input['sectionId'];
        $sub = $input['subject'];
        $per_name = $input['periodo'];
        $res_per = ejecutarConsulta("SELECT id FROM periodos WHERE nombre = ?", [$per_name], "s");
        $per = !empty($res_per) ? $res_per[0]['id'] : null;

        // Un período cerrado no admite cambios de notas (bloqueo real, no solo visual)
        if (periodoEstaCerrado($per)) {
            responderPeriodoCerrado();
            break;
        }
        
        $m1 = $input['mp1']; $i1 = $input['inas1'];
        $m2 = $input['mp2']; $i2 = $input['inas2'];
        $m3 = $input['mp3']; $i3 = $input['inas3'];
        $def = $input['definitiva'];
        
        if ($id) {
            $sql = "UPDATE notas SET estudiante_id=?, seccion_id=?, materia=?, periodo_id=?, mp1=?, inas1=?, mp2=?, inas2=?, mp3=?, inas3=?, definitiva=? WHERE id=?";
            echo json_encode(ejecutarConsulta($sql, [$sid, $secid, $sub, $per, $m1, $i1, $m2, $i2, $m3, $i3, $def, $id], "iissdidididi"));
        } else {
            // La tabla tiene clave única (estudiante, sección, materia, período):
            // si la nota ya existe, se actualiza en lugar de duplicarse o fallar.
            $sql = "INSERT INTO notas (estudiante_id, seccion_id, materia, periodo_id, mp1, inas1, mp2, inas2, mp3, inas3, definitiva)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        mp1 = VALUES(mp1), inas1 = VALUES(inas1),
                        mp2 = VALUES(mp2), inas2 = VALUES(inas2),
                        mp3 = VALUES(mp3), inas3 = VALUES(inas3),
                        definitiva = VALUES(definitiva)";
            echo json_encode(ejecutarConsulta($sql, [$sid, $secid, $sub, $per, $m1, $i1, $m2, $i2, $m3, $i3, $def], "iissdididid"));
        }
        break;

    // ========== RESPALDOS, RESTAURACIÓN E INDEXADO (BASE DE DATOS) ==========
    case 'db_stats':
        echo json_encode(DatabaseMaintenance::getDatabaseStats());
        break;

    case 'backup_db':
        $res = DatabaseMaintenance::createBackup();
        if (isset($res['success']) && $res['success']) {
            $fName = $res['filename'] ?? 'Respaldo';
            $size = $res['size'] ?? '';
            registrarLogActividad('backup', 'base_datos', null, $fName, "Generación manual de respaldo .SQL ({$size})");
        }
        echo json_encode($res);
        break;

    case 'list_backups':
        echo json_encode(['success' => true, 'data' => DatabaseMaintenance::listBackups()]);
        break;

    case 'download_backup':
        $file = basename($_GET['file'] ?? '');
        $path = DatabaseMaintenance::getBackupDir() . $file;
        if ($file && substr($file, -4) === '.sql' && file_exists($path)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . $file . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($path));
            readfile($path);
            exit;
        } else {
            echo json_encode(['success' => false, 'error' => 'Archivo no encontrado']);
        }
        break;

    case 'restore_backup':
        $file = $input['file'] ?? $_POST['file'] ?? '';
        $res = DatabaseMaintenance::restoreBackup($file);
        if (isset($res['success']) && $res['success']) {
            registrarLogActividad('restaurar', 'base_datos', null, $file, "Restauración de toda la base de datos MySQL desde respaldo");
        }
        echo json_encode($res);
        break;

    case 'delete_backup':
        $file = $input['file'] ?? $_POST['file'] ?? '';
        $res = DatabaseMaintenance::deleteBackup($file);
        if (isset($res['success']) && $res['success']) {
            registrarLogActividad('eliminar_backup', 'base_datos', null, $file, "Eliminación de archivo de copia de seguridad");
        }
        echo json_encode($res);
        break;

    case 'optimize_and_index_db':
        $res = DatabaseMaintenance::optimizeAndIndex();
        if (isset($res['success']) && $res['success']) {
            $tablasCount = isset($res['tablas']) && is_array($res['tablas']) ? count($res['tablas']) : 0;
            $idxCount = isset($res['indices_creados']) && is_array($res['indices_creados']) ? count($res['indices_creados']) : 0;
            registrarLogActividad('optimizar', 'base_datos', null, "Motor InnoDB ({$tablasCount} tablas)", "Optimización, desfragmentación y validación de {$idxCount} índices creados/verificados");
        }
        echo json_encode($res);
        break;

    // ========== AUDITORÍA Y CONTROL DE USUARIOS ==========
    case 'get_activity_logs':
        $entidad = isset($_GET['entidad']) ? trim($_GET['entidad']) : '';
        $accion  = isset($_GET['accion'])  ? trim($_GET['accion'])  : '';
        $search  = isset($_GET['search'])  ? trim($_GET['search'])  : '';
        $desde   = isset($_GET['desde'])   ? trim($_GET['desde'])   : '';
        $hasta   = isset($_GET['hasta'])   ? trim($_GET['hasta'])   : '';
        $limit   = isset($_GET['limit'])   ? min(1000, max(1, (int)$_GET['limit'])) : 250;

        $where = [];
        $params = [];
        $types = "";

        if ($entidad !== '') {
            $where[] = "entidad = ?";
            $params[] = $entidad;
            $types .= "s";
        }
        if ($accion !== '') {
            $where[] = "accion = ?";
            $params[] = $accion;
            $types .= "s";
        }
        if ($desde !== '') {
            $where[] = "fecha >= ?";
            $params[] = $desde . " 00:00:00";
            $types .= "s";
        }
        if ($hasta !== '') {
            $where[] = "fecha <= ?";
            $params[] = $hasta . " 23:59:59";
            $types .= "s";
        }
        if ($search !== '') {
            $where[] = "(usuario_nombre LIKE ? OR entidad_nombre LIKE ? OR detalles LIKE ?)";
            $sParam = "%" . $search . "%";
            $params[] = $sParam;
            $params[] = $sParam;
            $params[] = $sParam;
            $types .= "sss";
        }

        $sql = "SELECT * FROM log_actividad";
        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY id DESC LIMIT " . $limit;

        if (!empty($params)) {
            $rows = ejecutarConsulta($sql, $params, $types);
        } else {
            $rows = ejecutarConsulta($sql);
        }

        echo json_encode(['success' => true, 'data' => is_array($rows) ? $rows : []]);
        break;

    default:
        echo json_encode(['error' => 'Acción no válida o no especificada']);
        break;
}
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
