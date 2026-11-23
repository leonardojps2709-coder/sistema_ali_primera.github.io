-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: proyecto_ali
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `proyecto_ali` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `proyecto_ali`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `estudiantes`
--

DROP TABLE IF EXISTS `estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`),
  KEY `seccion_id` (`seccion_id`),
  CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes`
--

LOCK TABLES `estudiantes` WRITE;
/*!40000 ALTER TABLE `estudiantes` DISABLE KEYS */;
INSERT INTO `estudiantes` VALUES (2,'V-34131306','MARIO JOSE','SECO TARAZONA',NULL,NULL,13),(3,'V-34551405','ALEXANDER JOSE','PAREJO ACOSTA',NULL,NULL,13),(4,'V-34586483','JONDER JOEL','VASQUEZ SERVEN',NULL,NULL,13),(5,'V-34640077','DANIELYS ALEJANDRA','LEAL IBARRA',NULL,NULL,13),(6,'V-34662868','RANDHY JOSUE','QUEVEDO PEREZ',NULL,NULL,13),(7,'V-34662960','MIGUEL ANDRES','RUMBOS LUQUES',NULL,NULL,13),(8,'V-34864526','ALINGER CRISTINA','RAMOS GONZALEZ',NULL,NULL,13),(9,'V-34907456','YOELMARY MILAGRO','SECO OLLARVIRES',NULL,NULL,13),(10,'V-35061564','CERGEO ABRAHAM','ESPINOZA LUGO',NULL,NULL,13),(11,'V-35099501','YORKARLITH ALEJANDRA','GARCÍA ACOSTA',NULL,NULL,13),(12,'V-36095381','LUZMARY DANIELA','CHIRINOS LUGO',NULL,NULL,13),(13,'V-36211317','ALEJANDRO GABRIEL','MUÑOZ ROMERO',NULL,NULL,13),(14,'V-36264414','JEAN PAUL','ROSENDO FLORES',NULL,NULL,13),(15,'V-36382592','SOFIA VALENTINA','CASTAÑEDA POLANCO',NULL,NULL,13),(16,'V-36546554','CESAR JOSE','TORREALBA SUAREZ',NULL,NULL,13),(17,'V-36562078','JOSE ANDRES','RODRIGUEZ MATA',NULL,NULL,13),(18,'V-36608289','ALEXIS ESTEBAN','CAZORLA MONTAÑA',NULL,NULL,13),(19,'V-36818842','FRANTHONY YICENI','AGUINAGALDE ZAPATA',NULL,NULL,13),(20,'V-37258650','LUIS JAVIER','OJEDA RODRIGUEZ',NULL,NULL,13),(21,'V-37400611','MARIA DE LOS ANGELES','HIDALGO VARGAS',NULL,NULL,13),(22,'V-11019196896','NORKELIS YAMILE','SECO TARAZONA',NULL,NULL,13),(23,'V-11117517434','DANIEL DAVID','GONZALEZ CASTILLO',NULL,NULL,13),(24,'V-11124498398','ANGEL JOSE','NARANJO MENDOZA',NULL,NULL,13),(25,'V-11224303406','MARIELWYNS SARAY','MEZA VALBUENA',NULL,NULL,13),(26,'V-11324498398','VICTORIA SOFIA','NARANJO MENDOZA',NULL,NULL,13);
/*!40000 ALTER TABLE `estudiantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menciones`
--

DROP TABLE IF EXISTS `menciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menciones`
--

LOCK TABLES `menciones` WRITE;
/*!40000 ALTER TABLE `menciones` DISABLE KEYS */;
INSERT INTO `menciones` VALUES (1,'Electricidad'),(2,'Metalmecánica'),(3,'Refinación y Petroquímica'),(4,'Gestión Integral de Riesgo');
/*!40000 ALTER TABLE `menciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas`
--

DROP TABLE IF EXISTS `notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `estudiante_id` int(11) DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL,
  `materia` varchar(100) NOT NULL,
  `periodo_id` int(11) DEFAULT NULL,
  `mp1` decimal(4,2) DEFAULT NULL,
  `inas1` int(11) DEFAULT 0,
  `mp2` decimal(4,2) DEFAULT NULL,
  `inas2` int(11) DEFAULT 0,
  `mp3` decimal(4,2) DEFAULT NULL,
  `inas3` int(11) DEFAULT 0,
  `definitiva` decimal(4,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `estudiante_id` (`estudiante_id`),
  KEY `seccion_id` (`seccion_id`),
  KEY `periodo_id` (`periodo_id`),
  CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notas_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notas_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas`
--

LOCK TABLES `notas` WRITE;
/*!40000 ALTER TABLE `notas` DISABLE KEYS */;
/*!40000 ALTER TABLE `notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos`
--

DROP TABLE IF EXISTS `periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `periodos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_mp1` date DEFAULT NULL,
  `fecha_mp2` date DEFAULT NULL,
  `fecha_mp3` date DEFAULT NULL,
  `estado` enum('activo','cerrado') DEFAULT 'activo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos`
--

LOCK TABLES `periodos` WRITE;
/*!40000 ALTER TABLE `periodos` DISABLE KEYS */;
INSERT INTO `periodos` VALUES (1,'2026-2027','2026-04-08','2027-06-15','2026-04-08','2026-04-15','2026-04-16',NULL);
/*!40000 ALTER TABLE `periodos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secciones`
--

DROP TABLE IF EXISTS `secciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `secciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `mencion_id` int(11) DEFAULT NULL,
  `profesor_guia_id` int(11) DEFAULT NULL,
  `profesor_guia_nombre` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mencion_id` (`mencion_id`),
  KEY `profesor_guia_id` (`profesor_guia_id`),
  CONSTRAINT `secciones_ibfk_1` FOREIGN KEY (`mencion_id`) REFERENCES `menciones` (`id`),
  CONSTRAINT `secciones_ibfk_2` FOREIGN KEY (`profesor_guia_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secciones`
--

LOCK TABLES `secciones` WRITE;
/*!40000 ALTER TABLE `secciones` DISABLE KEYS */;
INSERT INTO `secciones` VALUES (12,'1ro Año A',1,NULL,NULL),(13,'2do Año A',1,NULL,'Daysi Siritt'),(15,'1ro Año B',2,NULL,'asdas');
/*!40000 ALTER TABLE `secciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_assignments`
--

DROP TABLE IF EXISTS `teacher_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `materia_nombre` varchar(100) DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_assignments_ibfk_1` (`teacher_id`),
  KEY `teacher_assignments_ibfk_2` (`seccion_id`),
  CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_assignments`
--

LOCK TABLES `teacher_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_assignments` DISABLE KEYS */;
INSERT INTO `teacher_assignments` VALUES (3,14,'Idiomas',12),(15,15,'Educación Física',12),(16,16,'Biología, Ambiente y Tecnología',12),(17,17,'Geografía, Historia y Soberanía Nacional',12),(25,12,'Lengua y Literatura',12);
/*!40000 ALTER TABLE `teacher_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('admin','teacher') NOT NULL,
  `password` varchar(255) NOT NULL,
  `nivel_acceso` varchar(50) DEFAULT NULL,
  `materias` text DEFAULT NULL,
  `secciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (3,'V-31072861','Leonardo','Perez','leonardojose2706@gmail.com','04126797303','admin','leonardo27',NULL,'',''),(12,'V-10000001','Alaska','Hernández','alaska@gmail.com','0412-1111111','teacher','docente123',NULL,'Lengua y Literatura','12'),(14,'V-10000003','Nairin','Briseño','nairin@gmail.com','0412-3333333','teacher','docente123',NULL,'Idiomas','12'),(15,'V-10000004','Andrés','Méndez','andres@gmail.com','0412-4444444','teacher','docente123',NULL,'Educación Física','12'),(16,'V-10000005','Deibis','García','deibis@gmail.com','0412-5555555','teacher','docente123',NULL,'Biología, Ambiente y Tecnología','12'),(17,'V-10000006','Ángelo','Velásquez','angelo@gmail.com','0412-6666666','teacher','docente123',NULL,'Geografía, Historia y Soberanía Nacional','12'),(19,'V-000000','Admin','Sistema',NULL,NULL,'admin','admin123','super-admin',NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 19:35:59
