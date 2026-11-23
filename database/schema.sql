-- schema.sql
-- Estructura completa para el Sistema Escolar E.T. "Ali Primera"

CREATE DATABASE IF NOT EXISTS sistema_ali CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_ali;

-- 1. ÁREAS TÉCNICAS (MENCIONES)
CREATE TABLE IF NOT EXISTS menciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE = InnoDB;

-- 2. SECCIONES Y AÑOS
CREATE TABLE IF NOT EXISTS secciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Ejemplo: "1ro A", "4to B"
    mencion_id INT,
    profesor_guia_id INT NULL,
    FOREIGN KEY (mencion_id) REFERENCES menciones(id) ON DELETE SET NULL,
    FOREIGN KEY (profesor_guia_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE = InnoDB;

-- 3. USUARIOS (ADMINS Y PROFESORES)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    rol ENUM('admin', 'teacher', 'superadmin') NOT NULL DEFAULT 'teacher',
    password VARCHAR(255) NOT NULL,
    nivel_acceso VARCHAR(50), -- Para admins: 'super-admin', 'admin'
    permisos TEXT, -- String separado por comas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- 4. ESTUDIANTES
CREATE TABLE IF NOT EXISTS estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    seccion_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL
) ENGINE = InnoDB;

-- 5. PERÍODOS ACADÉMICOS
CREATE TABLE IF NOT EXISTS periodos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_mp1 DATE,
    fecha_mp2 DATE,
    fecha_mp3 DATE,
    estado ENUM('activo', 'cerrado') DEFAULT 'activo'
) ENGINE = InnoDB;

-- 6. CALIFICACIONES
CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT,
    seccion_id INT,
    materia VARCHAR(100) NOT NULL,
    periodo_id INT,
    mp1 DECIMAL(4,2),
    inas1 INT DEFAULT 0,
    mp2 DECIMAL(4,2),
    inas2 INT DEFAULT 0,
    mp3 DECIMAL(4,2),
    inas3 INT DEFAULT 0,
    definitiva DECIMAL(4,2),
    -- Evita notas duplicadas de la misma materia en el mismo período
    UNIQUE KEY uq_nota (estudiante_id, seccion_id, materia, periodo_id),
    -- Acelera la búsqueda por materia (boletines y reportes)
    KEY idx_notas_materia (materia),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- 7. ASIGNACIONES DE PROFESORES (RELACIÓN FORMAL)
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    materia_nombre VARCHAR(100) NOT NULL,
    seccion_id INT,
    FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- DATOS INICIALES (Menciones por defecto)
INSERT INTO menciones (id, nombre) VALUES 
(1, 'Electricidad'),
(2, 'Metalmecánica'),
(3, 'Refinación y Petroquímica'),
(4, 'Gestión Integral de Riesgo')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- USUARIO ADMINISTRADOR POR DEFECTO (Password: admin123)
INSERT INTO usuarios (cedula, nombre, apellido, rol, password, nivel_acceso) 
VALUES ('V-000000', 'Admin', 'Sistema', 'admin', 'admin123', 'super-admin')
ON DUPLICATE KEY UPDATE cedula=cedula;

-- USUARIO SUPERADMINISTRADOR (Password: superadmin123)
INSERT INTO usuarios (cedula, nombre, apellido, email, rol, password)
VALUES ('superadmin', 'Super', 'Administrador', 'superadmin@aliprimera.edu.ve', 'superadmin', 'superadmin123')
ON DUPLICATE KEY UPDATE cedula=cedula;

-- PROFESORES POR DEFECTO (Contraseña: docente123)
INSERT INTO usuarios (cedula, nombre, apellido, email, telefono, rol, password) VALUES
('V-10000001', 'Alaska', 'Hernández', 'alaska@gmail.com', '0412-1111111', 'teacher', 'docente123'),
('V-10000002', 'Rorivet', 'Castillo', 'rorivet@gmail.com', '0412-2222222', 'teacher', 'docente123'),
('V-10000003', 'Nairin', 'Briseño', 'nairin@gmail.com', '0412-3333333', 'teacher', 'docente123'),
('V-10000004', 'Andrés', 'Méndez', 'andres@gmail.com', '0412-4444444', 'teacher', 'docente123'),
('V-10000005', 'Deibis', 'García', 'deibis@gmail.com', '0412-5555555', 'teacher', 'docente123'),
('V-10000006', 'Ángelo', 'Velásquez', 'angelo@gmail.com', '0412-6666666', 'teacher', 'docente123')
ON DUPLICATE KEY UPDATE cedula=cedula;

-- SECCIONES POR DEFECTO
INSERT INTO secciones (id, nombre, mencion_id) VALUES
(12, '1ro Año A', 1),
(13, '2do Año A', 1)
ON DUPLICATE KEY UPDATE nombre=nombre, mencion_id=mencion_id;

-- ASIGNACIONES DE PROFESORES POR DEFECTO
-- Asumiendo los IDs que se generan (Alaska=12, Rorivet=13, Nairin=14, Andres=15, Deibis=16, Angelo=17)
-- Pero es más seguro hacerlo usando subconsultas o conociendo los IDs. Ya que en la tabla usuarios de este sistema, 
-- los id podrían variar. Lo mejor es insertar si sabemos los id o dejarlos dinámicos. 
-- Podemos insertar las asignaciones para la sección 12
INSERT IGNORE INTO teacher_assignments (teacher_id, materia_nombre, seccion_id)
SELECT id, 'Lengua y Literatura', 12 FROM usuarios WHERE cedula = 'V-10000001';

INSERT IGNORE INTO teacher_assignments (teacher_id, materia_nombre, seccion_id)
SELECT id, 'Matemática', 12 FROM usuarios WHERE cedula = 'V-10000002';

INSERT IGNORE INTO teacher_assignments (teacher_id, materia_nombre, seccion_id)
SELECT id, 'Idiomas', 12 FROM usuarios WHERE cedula = 'V-10000003';

INSERT IGNORE INTO teacher_assignments (teacher_id, materia_nombre, seccion_id)
SELECT id, 'Educación Física', 12 FROM usuarios WHERE cedula = 'V-10000004';

INSERT IGNORE INTO teacher_assignments (teacher_id, materia_nombre, seccion_id)
SELECT id, 'Biología, Ambiente y Tecnología', 12 FROM usuarios WHERE cedula = 'V-10000005';

INSERT IGNORE INTO teacher_assignments (teacher_id, materia_nombre, seccion_id)
SELECT id, 'Geografía, Historia y Soberanía Nacional', 12 FROM usuarios WHERE cedula = 'V-10000006';

-- ESTUDIANTES POR DEFECTO (2do Año A de Electricidad)
INSERT INTO estudiantes (cedula, nombre, apellido, seccion_id) VALUES
('V-34131306', 'MARIO JOSE', 'SECO TARAZONA', 13),
('V-34551405', 'ALEXANDER JOSE', 'PAREJO ACOSTA', 13),
('V-34586483', 'JONDER JOEL', 'VASQUEZ SERVEN', 13),
('V-34640077', 'DANIELYS ALEJANDRA', 'LEAL IBARRA', 13),
('V-34662868', 'RANDHY JOSUE', 'QUEVEDO PEREZ', 13),
('V-34662960', 'MIGUEL ANDRES', 'RUMBOS LUQUES', 13),
('V-34864526', 'ALINGER CRISTINA', 'RAMOS GONZALEZ', 13),
('V-34907456', 'YOELMARY MILAGRO', 'SECO OLLARVIRES', 13),
('V-35061564', 'CERGEO ABRAHAM', 'ESPINOZA LUGO', 13),
('V-35099501', 'YORKARLITH ALEJANDRA', 'GARCÍA ACOSTA', 13),
('V-36095381', 'LUZMARY DANIELA', 'CHIRINOS LUGO', 13),
('V-36211317', 'ALEJANDRO GABRIEL', 'MUÑOZ ROMERO', 13),
('V-36264414', 'JEAN PAUL', 'ROSENDO FLORES', 13),
('V-36382592', 'SOFIA VALENTINA', 'CASTAÑEDA POLANCO', 13),
('V-36546554', 'CESAR JOSE', 'TORREALBA SUAREZ', 13),
('V-36562078', 'JOSE ANDRES', 'RODRIGUEZ MATA', 13),
('V-36608289', 'ALEXIS ESTEBAN', 'CAZORLA MONTAÑA', 13),
('V-36818842', 'FRANTHONY YICENI', 'AGUINAGALDE ZAPATA', 13),
('V-37258650', 'LUIS JAVIER', 'OJEDA RODRIGUEZ', 13),
('V-37400611', 'MARIA DE LOS ANGELES', 'HIDALGO VARGAS', 13),
('V-11019196896', 'NORKELIS YAMILE', 'SECO TARAZONA', 13),
('V-11117517434', 'DANIEL DAVID', 'GONZALEZ CASTILLO', 13),
('V-11124498398', 'ANGEL JOSE', 'NARANJO MENDOZA', 13),
('V-11224303406', 'MARIELWYNS SARAY', 'MEZA VALBUENA', 13),
('V-11324498398', 'VICTORIA SOFIA', 'NARANJO MENDOZA', 13)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), apellido=VALUES(apellido), seccion_id=VALUES(seccion_id);
