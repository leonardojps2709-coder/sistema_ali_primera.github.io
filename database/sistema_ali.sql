-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 22-10-2026 a las 03:18:40
-- Versión del servidor: 8.0.17
-- Versión de PHP: 7.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_ali`
--
CREATE DATABASE IF NOT EXISTS `sistema_ali` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sistema_ali`;

-- Desactivar temporalmente revisión de claves foráneas para importación limpia
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas en caso de existir previamente para evitar mezclas o duplicados
DROP TABLE IF EXISTS `notas`;
DROP TABLE IF EXISTS `evaluaciones_config`;
DROP TABLE IF EXISTS `teacher_assignments`;
DROP TABLE IF EXISTS `estudiantes`;
DROP TABLE IF EXISTS `secciones`;
DROP TABLE IF EXISTS `menciones`;
DROP TABLE IF EXISTS `periodos`;
DROP TABLE IF EXISTS `usuarios`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL,
  `cedula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id`, `cedula`, `nombre`, `apellido`, `email`, `telefono`, `seccion_id`) VALUES
(2, 'V-34131306', 'MARIO JOSE', 'SECO TARAZONA', NULL, NULL, 13),
(3, 'V-34551405', 'ALEXANDER JOSE', 'PAREJO ACOSTA', NULL, NULL, 13),
(4, 'V-34586483', 'JONDER JOEL', 'VASQUEZ SERVEN', NULL, NULL, 13),
(5, 'V-34640077', 'DANIELYS ALEJANDRA', 'LEAL IBARRA', NULL, NULL, 13),
(6, 'V-34662868', 'RANDHY JOSUE', 'QUEVEDO PEREZ', NULL, NULL, 13),
(7, 'V-34662960', 'MIGUEL ANDRES', 'RUMBOS LUQUES', NULL, NULL, 13),
(8, 'V-34864526', 'ALINGER CRISTINA', 'RAMOS GONZALEZ', NULL, NULL, 13),
(9, 'V-34907456', 'YOELMARY MILAGRO', 'SECO OLLARVIRES', NULL, NULL, 13),
(10, 'V-35061564', 'CERGEO ABRAHAM', 'ESPINOZA LUGO', NULL, NULL, 13),
(11, 'V-35099501', 'YORKARLITH ALEJANDRA', 'GARCÍA ACOSTA', NULL, NULL, 13),
(12, 'V-36095381', 'LUZMARY DANIELA', 'CHIRINOS LUGO', NULL, NULL, 13),
(13, 'V-36211317', 'ALEJANDRO GABRIEL', 'MUÑOZ ROMERO', NULL, NULL, 13),
(14, 'V-36264414', 'JEAN PAUL', 'ROSENDO FLORES', NULL, NULL, 13),
(15, 'V-36382592', 'SOFIA VALENTINA', 'CASTAÑEDA POLANCO', NULL, NULL, 13),
(16, 'V-36546554', 'CESAR JOSE', 'TORREALBA SUAREZ', NULL, NULL, 13),
(17, 'V-36562078', 'JOSE ANDRES', 'RODRIGUEZ MATA', NULL, NULL, 13),
(18, 'V-36608289', 'ALEXIS ESTEBAN', 'CAZORLA MONTAÑA', NULL, NULL, 13),
(19, 'V-36818842', 'FRANTHONY YICENI', 'AGUINAGALDE ZAPATA', NULL, NULL, 13),
(20, 'V-37258650', 'LUIS JAVIER', 'OJEDA RODRIGUEZ', NULL, NULL, 13),
(21, 'V-37400611', 'MARIA DE LOS ANGELES', 'HIDALGO VARGAS', NULL, NULL, 13),
(22, 'RIF-11019196896', 'NORKELIS YAMILE', 'SECO TARAZONA', '', '', 13),
(23, 'RIF-11117517434', 'DANIEL DAVID', 'GONZALEZ CASTILLO', '', '', 13),
(24, 'RIF-11124498398', 'ANGEL JOSE', 'NARANJO MENDOZA', '', '', 13),
(25, 'RIF-11224303406', 'MARIELWYNS SARAY', 'MEZA VALBUENA', '', '', 13),
(26, 'RIF-11324498398', 'VICTORIA SOFIA', 'NARANJO MENDOZA', '', '', 13),
(29, 'V-34418128', 'Miguel Ángel', 'Chirionos De Gouveia', 'MiguelÁngel@gmail.com', '041234418128', 12),
(30, 'V-35178064', 'Dyliannys Andrismar', 'Zambrano Quiroga', '', '', 12),
(31, 'V-36084936', 'Dariannis Alejandra', 'Villoria Pérez', '', '', 12),
(32, 'V-36168709', 'Moisés  Elias', 'Molina Lara', '', '', 12),
(33, 'V-36200551', 'Yorxelis Daximar', 'Medina Tovar', '', 'Medina Tovar', 12),
(34, 'V-36201037', 'Brainer René', 'Huerta Rondón', '', '', 12),
(35, 'V-36245875', 'Mayerlin Nazareth', 'Castillo Sánchez', '', '', 12),
(36, 'V-36305726', 'Yeromi Josué', 'Sequera Mireles', '', '', 12),
(37, 'V-36326361', 'Yeferson Miguel', 'Bracho Acosta', '', '', 12),
(38, 'V-36395151', 'Keyliver Roxana', 'Mendoza Riera', '', '', 12),
(39, 'V-36422849', 'Jhoandry José', 'Vilera Hernández', '', '', 12),
(40, 'V-36527786', 'Maikol Abraham', 'Chacín Hernández', '', '', 12),
(41, 'V-36670165', 'Yeleannys Saray', 'Toribe Sabariego', '', '', 12),
(42, 'V-36882648', 'Roniel David', 'Escalona Escalona', '', '', 12),
(43, 'V-37374060', 'Emanuel Alexander', 'Arteaga Rincón', '', '', 12),
(44, 'RIF-11226392261', 'Jaiden Matias', 'Gutiérrez Alcalá', '', '', 12),
(45, 'V-88888888', 'Prueba', 'Mecanica', '', '041234418128', 16);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluaciones_config`
--

CREATE TABLE `evaluaciones_config` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `materia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `momento` tinyint(4) NOT NULL COMMENT '1=MP1, 2=MP2, 3=MP3',
  `num_evaluaciones` tinyint(4) NOT NULL DEFAULT '1',
  `porcentajes` json NOT NULL COMMENT 'Array JSON de porcentajes, ej: [40,30,30]',
  `nombres` json DEFAULT NULL COMMENT 'Array JSON de nombres, ej: ["Parcial","Taller","Proyecto"]',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `evaluaciones_config`
--

INSERT INTO `evaluaciones_config` (`id`, `teacher_id`, `seccion_id`, `materia`, `periodo_id`, `momento`, `num_evaluaciones`, `porcentajes`, `nombres`) VALUES
(3, 15, 12, 'Educación Física', 2, 3, 7, '[14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.8]', '[\"Evaluación 1\", \"Evaluación 2\", \"Evaluación 3\", \"Evaluación 4\", \"Evaluación 5\", \"Evaluación 6\", \"Evaluación 7\"]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menciones`
--

CREATE TABLE `menciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `menciones`
--

INSERT INTO `menciones` (`id`, `nombre`) VALUES
(1, 'Electricidad'),
(2, 'Metalmecánica'),
(3, 'Refinación y Petroquímica'),
(4, 'Gestión Integral de Riesgo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notas`
--

CREATE TABLE `notas` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL,
  `materia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `periodo_id` int(11) DEFAULT NULL,
  `mp1` decimal(4,2) DEFAULT NULL,
  `inas1` int(11) DEFAULT '0',
  `mp2` decimal(4,2) DEFAULT NULL,
  `inas2` int(11) DEFAULT '0',
  `mp3` decimal(4,2) DEFAULT NULL,
  `inas3` int(11) DEFAULT '0',
  `definitiva` decimal(4,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notas`
--

INSERT INTO `notas` (`id`, `estudiante_id`, `seccion_id`, `materia`, `periodo_id`, `mp1`, `inas1`, `mp2`, `inas2`, `mp3`, `inas3`, `definitiva`) VALUES
(5, 5, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(6, 2, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(7, 6, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(8, 7, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(9, 3, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(10, 4, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(11, 9, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(12, 11, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(13, 10, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(14, 8, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(15, 12, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(16, 13, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(17, 14, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(18, 15, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(19, 16, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(20, 17, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(21, 18, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(22, 19, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(23, 20, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(24, 21, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(25, 22, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(26, 23, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(27, 24, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(28, 25, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(29, 26, 13, 'Idiomas', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(30, 29, 12, 'Lengua y Literatura', 2, '10.00', 5, '20.00', 5, '20.00', 5, '16.67'),
(31, 30, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(32, 31, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(33, 33, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(34, 35, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(35, 32, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(36, 37, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(37, 34, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(38, 38, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(39, 36, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(40, 39, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(41, 40, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(42, 41, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(43, 42, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(44, 43, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00'),
(45, 44, 12, 'Lengua y Literatura', 2, NULL, 0, NULL, 0, NULL, 0, '0.00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos`
--

CREATE TABLE `periodos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_mp1` date DEFAULT NULL,
  `fecha_mp2` date DEFAULT NULL,
  `fecha_mp3` date DEFAULT NULL,
  `estado` enum('activo','cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `periodos`
--

INSERT INTO `periodos` (`id`, `nombre`, `fecha_inicio`, `fecha_fin`, `fecha_mp1`, `fecha_mp2`, `fecha_mp3`, `estado`) VALUES
(2, '2026-2027', '2026-06-14', '2027-06-14', '2026-06-14', '2026-06-21', '2026-06-28', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secciones`
--

CREATE TABLE `secciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mencion_id` int(11) DEFAULT NULL,
  `profesor_guia_id` int(11) DEFAULT NULL,
  `profesor_guia_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `secciones`
--

INSERT INTO `secciones` (`id`, `nombre`, `mencion_id`, `profesor_guia_id`, `profesor_guia_nombre`) VALUES
(12, '1ro Año A', 1, NULL, NULL),
(13, '2do Año A', 1, NULL, 'Daysi Siritt'),
(16, '1ro Año A', 2, NULL, 'Profe prueba');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `teacher_assignments`
--

CREATE TABLE `teacher_assignments` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `materia_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `teacher_assignments`
--

INSERT INTO `teacher_assignments` (`id`, `teacher_id`, `materia_nombre`, `seccion_id`) VALUES
(15, 15, 'Educación Física', 12),
(16, 16, 'Biología, Ambiente y Tecnología', 12),
(50, 17, 'Geografía, Historia y Soberanía Nacional', 12),
(54, 14, 'Idiomas', 12),
(55, 14, 'Idiomas', 13);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `cedula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rol` enum('admin','teacher','superadmin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'teacher',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nivel_acceso` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `materias` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `secciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `tipo_docente` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'docente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `cedula`, `nombre`, `apellido`, `email`, `telefono`, `rol`, `password`, `nivel_acceso`, `materias`, `secciones`) VALUES
(3, 'V-31072861', 'Leonardo', 'Perez', 'leonardojose2706@gmail.com', '04126797303', 'admin', 'leonardo27', NULL, '', ''),
(14, 'V-10000003', 'Nairin', 'Briseño', 'nairin@gmail.com', '0412-3333333', 'teacher', 'docente123', NULL, 'Idiomas', '12'),
(15, 'V-10000004', 'Andrés', 'Méndez', 'andres@gmail.com', '0412-4444444', 'teacher', 'docente123', NULL, 'Educación Física', '12'),
(16, 'V-10000005', 'Deibis', 'García', 'deibis@gmail.com', '0412-5555555', 'teacher', 'docente123', NULL, 'Biología, Ambiente y Tecnología', '12'),
(17, 'V-10000006', 'Ángelo', 'Velásquez', 'angelo@gmail.com', '0412-6666666', 'teacher', 'docente123', NULL, 'Geografía, Historia y Soberanía Nacional', '12'),
(19, 'V-000000', 'Admin', 'Sistema', NULL, NULL, 'admin', 'admin123', 'super-admin', NULL, NULL),
(29, 'superadmin', 'Super', 'Administrador', 'superadmin@aliprimera.edu.ve', '', 'superadmin', 'superadmin123', NULL, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD KEY `seccion_id` (`seccion_id`);

--
-- Indices de la tabla `evaluaciones_config`
--
ALTER TABLE `evaluaciones_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_eval_config` (`teacher_id`,`seccion_id`,`materia`(80),`periodo_id`,`momento`),
  ADD KEY `seccion_id` (`seccion_id`),
  ADD KEY `periodo_id` (`periodo_id`);

--
-- Indices de la tabla `menciones`
--
ALTER TABLE `menciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `notas`
--
ALTER TABLE `notas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estudiante_id` (`estudiante_id`),
  ADD KEY `seccion_id` (`seccion_id`),
  ADD KEY `periodo_id` (`periodo_id`);

--
-- Indices de la tabla `periodos`
--
ALTER TABLE `periodos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `secciones`
--
ALTER TABLE `secciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mencion_id` (`mencion_id`),
  ADD KEY `profesor_guia_id` (`profesor_guia_id`);

--
-- Indices de la tabla `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_assignments_ibfk_1` (`teacher_id`),
  ADD KEY `teacher_assignments_ibfk_2` (`seccion_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `evaluaciones_config`
--
ALTER TABLE `evaluaciones_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `menciones`
--
ALTER TABLE `menciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `notas`
--
ALTER TABLE `notas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `periodos`
--
ALTER TABLE `periodos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `secciones`
--
ALTER TABLE `secciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`);

--
-- Filtros para la tabla `evaluaciones_config`
--
ALTER TABLE `evaluaciones_config`
  ADD CONSTRAINT `evaluaciones_config_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluaciones_config_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluaciones_config_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notas`
--
ALTER TABLE `notas`
  ADD CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notas_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notas_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `secciones`
--
ALTER TABLE `secciones`
  ADD CONSTRAINT `secciones_ibfk_1` FOREIGN KEY (`mencion_id`) REFERENCES `menciones` (`id`),
  ADD CONSTRAINT `secciones_ibfk_2` FOREIGN KEY (`profesor_guia_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE;

-- Reactivar revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
