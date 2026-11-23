-- MySQL dump 10.13  Distrib 8.0.17, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_ali
-- ------------------------------------------------------
-- Server version	8.0.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `sistema_ali`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sistema_ali` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `sistema_ali`;

--
-- Table structure for table `asignaturas`
--

DROP TABLE IF EXISTS `asignaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaturas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mencion_id` int(11) NOT NULL,
  `anio` tinyint(4) NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `area` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mencion_anio` (`mencion_id`,`anio`)
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaturas`
--

LOCK TABLES `asignaturas` WRITE;
/*!40000 ALTER TABLE `asignaturas` DISABLE KEYS */;
INSERT INTO `asignaturas` VALUES (2,7,1,'Caballito','cientifica','2026-11-07 23:04:23'),(3,7,2,'Caballito 2','general','2026-11-07 23:04:52'),(4,7,3,'Caballito 3','practica','2026-11-07 23:05:01'),(5,1,1,'Lengua y Literatura','general','2026-11-07 23:09:36'),(6,1,1,'Matemática','general','2026-11-07 23:09:36'),(7,1,1,'Idiomas','general','2026-11-07 23:09:36'),(8,1,1,'Educación Física','general','2026-11-07 23:09:36'),(9,1,1,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:36'),(10,1,1,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:36'),(11,1,2,'Lengua y Literatura','general','2026-11-07 23:09:36'),(12,1,2,'Matemática','general','2026-11-07 23:09:36'),(13,1,2,'Idiomas','general','2026-11-07 23:09:36'),(14,1,2,'Educación Física','general','2026-11-07 23:09:36'),(15,1,2,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:36'),(16,1,2,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:36'),(17,1,3,'Lengua y Literatura','general','2026-11-07 23:09:36'),(18,1,3,'Matemática','general','2026-11-07 23:09:36'),(19,1,3,'Idiomas','general','2026-11-07 23:09:36'),(20,1,3,'Educación Física','general','2026-11-07 23:09:36'),(21,1,3,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:36'),(22,1,3,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:36'),(23,1,4,'Lengua y Literatura','general','2026-11-07 23:09:36'),(24,1,4,'Matemática','general','2026-11-07 23:09:36'),(25,1,4,'Idiomas','general','2026-11-07 23:09:36'),(26,1,4,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:36'),(27,1,4,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:36'),(28,1,5,'Lengua y Literatura','general','2026-11-07 23:09:36'),(29,1,5,'Matemática','general','2026-11-07 23:09:36'),(30,1,5,'Idiomas','general','2026-11-07 23:09:36'),(31,1,5,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:36'),(32,1,5,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:36'),(33,1,1,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:36'),(34,1,1,'Máquina, Distribución y Control','cientifica','2026-11-07 23:09:36'),(35,1,2,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:36'),(36,1,2,'Máquina, Distribución y Control','cientifica','2026-11-07 23:09:36'),(37,1,3,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(38,1,3,'Máquina, Distribución y Control','cientifica','2026-11-07 23:09:37'),(39,1,4,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(40,1,4,'Máquina, Distribución y Control','cientifica','2026-11-07 23:09:37'),(41,1,5,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(42,1,5,'Máquina, Distribución y Control','cientifica','2026-11-07 23:09:37'),(43,1,1,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(44,1,2,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(45,1,3,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(46,1,4,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(47,1,5,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(48,1,6,'Práctica Profesional','practica','2026-11-07 23:09:37'),(49,2,1,'Lengua y Literatura','general','2026-11-07 23:09:37'),(50,2,1,'Matemática','general','2026-11-07 23:09:37'),(51,2,1,'Idiomas','general','2026-11-07 23:09:37'),(52,2,1,'Educación Física','general','2026-11-07 23:09:37'),(53,2,1,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(54,2,1,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(55,2,2,'Lengua y Literatura','general','2026-11-07 23:09:37'),(56,2,2,'Matemática','general','2026-11-07 23:09:37'),(57,2,2,'Idiomas','general','2026-11-07 23:09:37'),(58,2,2,'Educación Física','general','2026-11-07 23:09:37'),(59,2,2,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(60,2,2,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(61,2,3,'Lengua y Literatura','general','2026-11-07 23:09:37'),(62,2,3,'Matemática','general','2026-11-07 23:09:37'),(63,2,3,'Idiomas','general','2026-11-07 23:09:37'),(64,2,3,'Educación Física','general','2026-11-07 23:09:37'),(65,2,3,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(66,2,3,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(67,2,4,'Lengua y Literatura','general','2026-11-07 23:09:37'),(68,2,4,'Matemática','general','2026-11-07 23:09:37'),(69,2,4,'Idiomas','general','2026-11-07 23:09:37'),(70,2,4,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(71,2,4,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(72,2,5,'Lengua y Literatura','general','2026-11-07 23:09:37'),(73,2,5,'Matemática','general','2026-11-07 23:09:37'),(74,2,5,'Idiomas','general','2026-11-07 23:09:37'),(75,2,5,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(76,2,5,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(77,2,1,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(78,2,1,'Mantenimiento, Máquinas y Herramientas','cientifica','2026-11-07 23:09:37'),(79,2,2,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(80,2,2,'Mantenimiento, Máquinas y Herramientas','cientifica','2026-11-07 23:09:37'),(81,2,3,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(82,2,3,'Mantenimiento, Máquinas y Herramientas','cientifica','2026-11-07 23:09:37'),(83,2,4,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(84,2,4,'Mantenimiento, Máquinas y Herramientas','cientifica','2026-11-07 23:09:37'),(85,2,5,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(86,2,5,'Mantenimiento, Máquinas y Herramientas','cientifica','2026-11-07 23:09:37'),(87,2,1,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(88,2,2,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(89,2,3,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(90,2,4,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(91,2,5,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(92,2,6,'Práctica Profesional','practica','2026-11-07 23:09:37'),(93,3,1,'Lengua y Literatura','general','2026-11-07 23:09:37'),(94,3,1,'Matemática','general','2026-11-07 23:09:37'),(95,3,1,'Idiomas','general','2026-11-07 23:09:37'),(96,3,1,'Educación Física','general','2026-11-07 23:09:37'),(97,3,1,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(98,3,1,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(99,3,2,'Lengua y Literatura','general','2026-11-07 23:09:37'),(100,3,2,'Matemática','general','2026-11-07 23:09:37'),(101,3,2,'Idiomas','general','2026-11-07 23:09:37'),(102,3,2,'Educación Física','general','2026-11-07 23:09:37'),(103,3,2,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(104,3,2,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(105,3,3,'Lengua y Literatura','general','2026-11-07 23:09:37'),(106,3,3,'Matemática','general','2026-11-07 23:09:37'),(107,3,3,'Idiomas','general','2026-11-07 23:09:37'),(108,3,3,'Educación Física','general','2026-11-07 23:09:37'),(109,3,3,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(110,3,3,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(111,3,4,'Lengua y Literatura','general','2026-11-07 23:09:37'),(112,3,4,'Matemática','general','2026-11-07 23:09:37'),(113,3,4,'Idiomas','general','2026-11-07 23:09:37'),(114,3,4,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(115,3,4,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(116,3,5,'Lengua y Literatura','general','2026-11-07 23:09:37'),(117,3,5,'Matemática','general','2026-11-07 23:09:37'),(118,3,5,'Idiomas','general','2026-11-07 23:09:37'),(119,3,5,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(120,3,5,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(121,3,1,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(122,3,1,'Producción Petroquímica','cientifica','2026-11-07 23:09:37'),(123,3,2,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(124,3,2,'Producción Petroquímica','cientifica','2026-11-07 23:09:37'),(125,3,3,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(126,3,3,'Producción Petroquímica','cientifica','2026-11-07 23:09:37'),(127,3,4,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(128,3,4,'Producción Petroquímica','cientifica','2026-11-07 23:09:37'),(129,3,5,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(130,3,5,'Producción Petroquímica','cientifica','2026-11-07 23:09:37'),(131,3,1,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(132,3,2,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(133,3,3,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(134,3,4,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(135,3,5,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(136,3,6,'Práctica Profesional','practica','2026-11-07 23:09:37'),(137,4,1,'Lengua y Literatura','general','2026-11-07 23:09:37'),(138,4,1,'Matemática','general','2026-11-07 23:09:37'),(139,4,1,'Idiomas','general','2026-11-07 23:09:37'),(140,4,1,'Educación Física','general','2026-11-07 23:09:37'),(141,4,1,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(142,4,1,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(143,4,2,'Lengua y Literatura','general','2026-11-07 23:09:37'),(144,4,2,'Matemática','general','2026-11-07 23:09:37'),(145,4,2,'Idiomas','general','2026-11-07 23:09:37'),(146,4,2,'Educación Física','general','2026-11-07 23:09:37'),(147,4,2,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(148,4,2,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(149,4,3,'Lengua y Literatura','general','2026-11-07 23:09:37'),(150,4,3,'Matemática','general','2026-11-07 23:09:37'),(151,4,3,'Idiomas','general','2026-11-07 23:09:37'),(152,4,3,'Educación Física','general','2026-11-07 23:09:37'),(153,4,3,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(154,4,3,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(155,4,4,'Lengua y Literatura','general','2026-11-07 23:09:37'),(156,4,4,'Matemática','general','2026-11-07 23:09:37'),(157,4,4,'Idiomas','general','2026-11-07 23:09:37'),(158,4,4,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(159,4,4,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(160,4,5,'Lengua y Literatura','general','2026-11-07 23:09:37'),(161,4,5,'Matemática','general','2026-11-07 23:09:37'),(162,4,5,'Idiomas','general','2026-11-07 23:09:37'),(163,4,5,'Biología, Ambiente y Tecnología','general','2026-11-07 23:09:37'),(164,4,5,'Geografía, Historia y Soberanía Nacional','general','2026-11-07 23:09:37'),(165,4,1,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(166,4,1,'Riesgos, Emergencias y Desastres','cientifica','2026-11-07 23:09:37'),(167,4,2,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(168,4,2,'Riesgos, Emergencias y Desastres','cientifica','2026-11-07 23:09:37'),(169,4,3,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(170,4,3,'Riesgos, Emergencias y Desastres','cientifica','2026-11-07 23:09:37'),(171,4,4,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(172,4,4,'Riesgos, Emergencias y Desastres','cientifica','2026-11-07 23:09:37'),(173,4,5,'Proyecto de Economía Socioproductiva y Tecnología','cientifica','2026-11-07 23:09:37'),(174,4,5,'Riesgos, Emergencias y Desastres','cientifica','2026-11-07 23:09:37'),(175,4,1,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(176,4,2,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(177,4,3,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(178,4,4,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(179,4,5,'Orientación y Vinculación Sociolaboral','practica','2026-11-07 23:09:37'),(180,4,6,'Práctica Profesional','practica','2026-11-07 23:09:37');
/*!40000 ALTER TABLE `asignaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calificaciones_finales`
--

DROP TABLE IF EXISTS `calificaciones_finales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones_finales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `materia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mp1` decimal(4,2) DEFAULT NULL,
  `mp2` decimal(4,2) DEFAULT NULL,
  `mp3` decimal(4,2) DEFAULT NULL,
  `definitiva` decimal(4,2) DEFAULT NULL,
  `estado` enum('aprobado','reprobado','sin_calificar') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sin_calificar',
  `cerrado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_final` (`periodo_id`,`estudiante_id`,`seccion_id`,`materia`(80)),
  KEY `idx_final_periodo` (`periodo_id`),
  KEY `estudiante_id` (`estudiante_id`),
  KEY `seccion_id` (`seccion_id`),
  CONSTRAINT `calificaciones_finales_ibfk_1` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_finales_ibfk_2` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_finales_ibfk_3` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=492 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones_finales`
--

LOCK TABLES `calificaciones_finales` WRITE;
/*!40000 ALTER TABLE `calificaciones_finales` DISABLE KEYS */;
INSERT INTO `calificaciones_finales` VALUES (8,2,5,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(9,2,2,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(10,2,6,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(11,2,7,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(12,2,3,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(13,2,4,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(14,2,9,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(15,2,11,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(16,2,10,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(17,2,8,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(18,2,12,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(19,2,13,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(20,2,14,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(21,2,15,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(22,2,16,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(23,2,17,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(24,2,18,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(25,2,19,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(26,2,20,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(27,2,21,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(28,2,22,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(29,2,23,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(30,2,24,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(31,2,25,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(32,2,26,13,'Idiomas',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(33,2,29,12,'Lengua y Literatura',10.00,20.00,20.00,16.67,'aprobado','2026-11-14 00:13:57'),(34,2,30,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(35,2,31,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(36,2,33,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(37,2,35,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(38,2,32,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(39,2,37,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(40,2,34,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(41,2,38,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(42,2,36,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(43,2,39,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(44,2,40,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(45,2,41,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(46,2,42,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(47,2,43,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(48,2,44,12,'Lengua y Literatura',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(49,2,2,13,'Biología, Ambiente y Tecnología',10.00,10.00,10.00,10.00,'aprobado','2026-11-14 00:13:57'),(50,2,4,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(51,2,8,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(52,2,6,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(53,2,5,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(54,2,7,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(55,2,9,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(56,2,3,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(57,2,10,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(58,2,16,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(59,2,15,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(60,2,12,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(61,2,14,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(62,2,13,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(63,2,11,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(64,2,20,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(65,2,19,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(66,2,17,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(67,2,18,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(68,2,21,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(69,2,22,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(70,2,23,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(71,2,25,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(72,2,24,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(73,2,26,13,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(74,2,46,17,'Caballito',10.00,10.00,10.00,10.00,'aprobado','2026-11-14 00:13:57'),(75,2,29,12,'Biología, Ambiente y Tecnología',19.90,11.00,10.00,13.63,'aprobado','2026-11-14 00:13:57'),(144,2,32,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(145,2,31,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(146,2,30,12,'Biología, Ambiente y Tecnología',10.00,15.00,10.00,11.67,'aprobado','2026-11-14 00:13:57'),(147,2,33,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(148,2,35,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(149,2,34,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(150,2,38,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(151,2,37,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(152,2,36,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(153,2,40,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(154,2,41,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(155,2,39,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(156,2,43,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(157,2,42,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(158,2,44,12,'Biología, Ambiente y Tecnología',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57'),(491,2,61,17,'Caballito',NULL,NULL,NULL,NULL,'sin_calificar','2026-11-14 00:13:57');
/*!40000 ALTER TABLE `calificaciones_finales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes`
--

DROP TABLE IF EXISTS `estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cedula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`),
  KEY `seccion_id` (`seccion_id`),
  CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes`
--

LOCK TABLES `estudiantes` WRITE;
/*!40000 ALTER TABLE `estudiantes` DISABLE KEYS */;
INSERT INTO `estudiantes` VALUES (2,'V-34131306','MARIO JOSE','SECO TARAZONA',NULL,NULL,13),(3,'V-34551405','ALEXANDER JOSE','PAREJO ACOSTA',NULL,NULL,13),(4,'V-34586483','JONDER JOEL','VASQUEZ SERVEN',NULL,NULL,13),(5,'V-34640077','DANIELYS ALEJANDRA','LEAL IBARRA',NULL,NULL,13),(6,'V-34662868','RANDHY JOSUE','QUEVEDO PEREZ',NULL,NULL,13),(7,'V-34662960','MIGUEL ANDRES','RUMBOS LUQUES',NULL,NULL,13),(8,'V-34864526','ALINGER CRISTINA','RAMOS GONZALEZ',NULL,NULL,13),(9,'V-34907456','YOELMARY MILAGRO','SECO OLLARVIRES',NULL,NULL,13),(10,'V-35061564','CERGEO ABRAHAM','ESPINOZA LUGO',NULL,NULL,13),(11,'V-35099501','YORKARLITH ALEJANDRA','GARCÍA ACOSTA',NULL,NULL,13),(12,'V-36095381','LUZMARY DANIELA','CHIRINOS LUGO',NULL,NULL,13),(13,'V-36211317','ALEJANDRO GABRIEL','MUÑOZ ROMERO',NULL,NULL,13),(14,'V-36264414','JEAN PAUL','ROSENDO FLORES',NULL,NULL,13),(15,'V-36382592','SOFIA VALENTINA','CASTAÑEDA POLANCO',NULL,NULL,13),(16,'V-36546554','CESAR JOSE','TORREALBA SUAREZ',NULL,NULL,13),(17,'V-36562078','JOSE ANDRES','RODRIGUEZ MATA',NULL,NULL,13),(18,'V-36608289','ALEXIS ESTEBAN','CAZORLA MONTAÑA',NULL,NULL,13),(19,'V-36818842','FRANTHONY YICENI','AGUINAGALDE ZAPATA',NULL,NULL,13),(20,'V-37258650','LUIS JAVIER','OJEDA RODRIGUEZ',NULL,NULL,13),(21,'V-37400611','MARIA DE LOS ANGELES','HIDALGO VARGAS',NULL,NULL,13),(22,'RIF-11019196896','NORKELIS YAMILE','SECO TARAZONA','','',13),(23,'RIF-11117517434','DANIEL DAVID','GONZALEZ CASTILLO','','',13),(24,'RIF-11124498398','ANGEL JOSE','NARANJO MENDOZA','','',13),(25,'RIF-11224303406','MARIELWYNS SARAY','MEZA VALBUENA','','',13),(26,'RIF-11324498398','VICTORIA SOFIA','NARANJO MENDOZA','','',13),(29,'V-34418128','MIGUEL ÁNGEL','CHIRIONOS DE GOUVEIA','MiguelÁngel@gmail.com','041234418128',12),(30,'V-35178064','DYLIANNYS ANDRISMAR','ZAMBRANO QUIROGA','','',12),(31,'V-36084936','DARIANNIS ALEJANDRA','VILLORIA PÉREZ','','',12),(32,'V-36168709','MOISÉS  ELIAS','MOLINA LARA','','',12),(33,'V-36200551','YORXELIS DAXIMAR','MEDINA TOVAR','','Medina Tovar',12),(34,'V-36201037','BRAINER RENÉ','HUERTA RONDÓN','','',12),(35,'V-36245875','MAYERLIN NAZARETH','CASTILLO SÁNCHEZ','','',12),(36,'V-36305726','YEROMI JOSUÉ','SEQUERA MIRELES','','',12),(37,'V-36326361','YEFERSON MIGUEL','BRACHO ACOSTA','','',12),(38,'V-36395151','KEYLIVER ROXANA','MENDOZA RIERA','','',12),(39,'V-36422849','JHOANDRY JOSÉ','VILERA HERNÁNDEZ','','',12),(40,'V-36527786','MAIKOL ABRAHAM','CHACÍN HERNÁNDEZ','','',12),(41,'V-36670165','YELEANNYS SARAY','TORIBE SABARIEGO','','',12),(42,'V-36882648','RONIEL DAVID','ESCALONA ESCALONA','','',12),(43,'V-37374060','EMANUEL ALEXANDER','ARTEAGA RINCÓN','','',12),(44,'RIF-11226392261','JAIDEN MATIAS','GUTIÉRREZ ALCALÁ','','',12),(45,'V-88888888','PRUEBA','MECANICA','','041234418128',16),(46,'V-31070800','YONKLEINVERSON','GONZALES','','041612345678',33),(61,'V-10000000001','YONKLAIVERSON','PIRUETA','','041234418666',33);
/*!40000 ALTER TABLE `estudiantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes_respaldo_mayusculas`
--

DROP TABLE IF EXISTS `estudiantes_respaldo_mayusculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes_respaldo_mayusculas` (
  `id` int(11) NOT NULL DEFAULT '0',
  `cedula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `respaldado_en` datetime NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_respaldo_mayusculas`
--

LOCK TABLES `estudiantes_respaldo_mayusculas` WRITE;
/*!40000 ALTER TABLE `estudiantes_respaldo_mayusculas` DISABLE KEYS */;
INSERT INTO `estudiantes_respaldo_mayusculas` VALUES (2,'V-34131306','MARIO JOSE','SECO TARAZONA','2026-11-08 01:24:16'),(3,'V-34551405','ALEXANDER JOSE','PAREJO ACOSTA','2026-11-08 01:24:16'),(4,'V-34586483','JONDER JOEL','VASQUEZ SERVEN','2026-11-08 01:24:16'),(5,'V-34640077','DANIELYS ALEJANDRA','LEAL IBARRA','2026-11-08 01:24:16'),(6,'V-34662868','RANDHY JOSUE','QUEVEDO PEREZ','2026-11-08 01:24:16'),(7,'V-34662960','MIGUEL ANDRES','RUMBOS LUQUES','2026-11-08 01:24:16'),(8,'V-34864526','ALINGER CRISTINA','RAMOS GONZALEZ','2026-11-08 01:24:16'),(9,'V-34907456','YOELMARY MILAGRO','SECO OLLARVIRES','2026-11-08 01:24:16'),(10,'V-35061564','CERGEO ABRAHAM','ESPINOZA LUGO','2026-11-08 01:24:16'),(11,'V-35099501','YORKARLITH ALEJANDRA','GARCÍA ACOSTA','2026-11-08 01:24:16'),(12,'V-36095381','LUZMARY DANIELA','CHIRINOS LUGO','2026-11-08 01:24:16'),(13,'V-36211317','ALEJANDRO GABRIEL','MUÑOZ ROMERO','2026-11-08 01:24:16'),(14,'V-36264414','JEAN PAUL','ROSENDO FLORES','2026-11-08 01:24:16'),(15,'V-36382592','SOFIA VALENTINA','CASTAÑEDA POLANCO','2026-11-08 01:24:16'),(16,'V-36546554','CESAR JOSE','TORREALBA SUAREZ','2026-11-08 01:24:16'),(17,'V-36562078','JOSE ANDRES','RODRIGUEZ MATA','2026-11-08 01:24:16'),(18,'V-36608289','ALEXIS ESTEBAN','CAZORLA MONTAÑA','2026-11-08 01:24:16'),(19,'V-36818842','FRANTHONY YICENI','AGUINAGALDE ZAPATA','2026-11-08 01:24:16'),(20,'V-37258650','LUIS JAVIER','OJEDA RODRIGUEZ','2026-11-08 01:24:16'),(21,'V-37400611','MARIA DE LOS ANGELES','HIDALGO VARGAS','2026-11-08 01:24:16'),(22,'RIF-11019196896','NORKELIS YAMILE','SECO TARAZONA','2026-11-08 01:24:16'),(23,'RIF-11117517434','DANIEL DAVID','GONZALEZ CASTILLO','2026-11-08 01:24:16'),(24,'RIF-11124498398','ANGEL JOSE','NARANJO MENDOZA','2026-11-08 01:24:16'),(25,'RIF-11224303406','MARIELWYNS SARAY','MEZA VALBUENA','2026-11-08 01:24:16'),(26,'RIF-11324498398','VICTORIA SOFIA','NARANJO MENDOZA','2026-11-08 01:24:16'),(29,'V-34418128','Miguel Ángel','Chirionos De Gouveia','2026-11-08 01:24:16'),(30,'V-35178064','Dyliannys Andrismar','Zambrano Quiroga','2026-11-08 01:24:16'),(31,'V-36084936','Dariannis Alejandra','Villoria Pérez','2026-11-08 01:24:16'),(32,'V-36168709','Moisés  Elias','Molina Lara','2026-11-08 01:24:16'),(33,'V-36200551','Yorxelis Daximar','Medina Tovar','2026-11-08 01:24:16'),(34,'V-36201037','Brainer René','Huerta Rondón','2026-11-08 01:24:16'),(35,'V-36245875','Mayerlin Nazareth','Castillo Sánchez','2026-11-08 01:24:16'),(36,'V-36305726','Yeromi Josué','Sequera Mireles','2026-11-08 01:24:16'),(37,'V-36326361','Yeferson Miguel','Bracho Acosta','2026-11-08 01:24:16'),(38,'V-36395151','Keyliver Roxana','Mendoza Riera','2026-11-08 01:24:16'),(39,'V-36422849','Jhoandry José','Vilera Hernández','2026-11-08 01:24:16'),(40,'V-36527786','Maikol Abraham','Chacín Hernández','2026-11-08 01:24:16'),(41,'V-36670165','Yeleannys Saray','Toribe Sabariego','2026-11-08 01:24:16'),(42,'V-36882648','Roniel David','Escalona Escalona','2026-11-08 01:24:16'),(43,'V-37374060','Emanuel Alexander','Arteaga Rincón','2026-11-08 01:24:16'),(44,'RIF-11226392261','Jaiden Matias','Gutiérrez Alcalá','2026-11-08 01:24:16'),(45,'V-88888888','Prueba','Mecanica','2026-11-08 01:24:16'),(46,'V-31070800','YONKLEINVERSON','GONZALES','2026-11-08 01:24:16');
/*!40000 ALTER TABLE `estudiantes_respaldo_mayusculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluaciones_config`
--

DROP TABLE IF EXISTS `evaluaciones_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `materia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `momento` tinyint(4) NOT NULL COMMENT '1=MP1, 2=MP2, 3=MP3',
  `num_evaluaciones` tinyint(4) NOT NULL DEFAULT '1',
  `porcentajes` json NOT NULL COMMENT 'Array JSON de porcentajes, ej: [40,30,30]',
  `nombres` json DEFAULT NULL COMMENT 'Array JSON de nombres, ej: ["Parcial","Taller","Proyecto"]',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_eval_config` (`teacher_id`,`seccion_id`,`materia`(80),`periodo_id`,`momento`),
  KEY `seccion_id` (`seccion_id`),
  KEY `periodo_id` (`periodo_id`),
  CONSTRAINT `evaluaciones_config_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_config_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_config_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_config`
--

LOCK TABLES `evaluaciones_config` WRITE;
/*!40000 ALTER TABLE `evaluaciones_config` DISABLE KEYS */;
INSERT INTO `evaluaciones_config` VALUES (3,15,12,'Educación Física',2,3,7,'[14.2, 14.2, 14.2, 14.2, 14.2, 14.2, 14.8]','[\"Evaluación 1\", \"Evaluación 2\", \"Evaluación 3\", \"Evaluación 4\", \"Evaluación 5\", \"Evaluación 6\", \"Evaluación 7\"]','2026-11-07 17:15:41'),(4,15,12,'Educación Física',2,1,3,'[33.3, 33.3, 33.4]','[\"Evaluación 1\", \"Evaluación 2\", \"Evaluación 3\"]','2026-11-07 17:15:41'),(6,14,12,'Idiomas',2,1,3,'[33.3, 33.3, 33.4]','[\"Evaluación 1\", \"Evaluación 2\", \"Evaluación 3\"]','2026-11-07 17:14:00'),(8,15,12,'Educación Física',2,2,3,'[33.3, 33.3, 33.4]','[\"Evaluación 1\", \"Evaluación 2\", \"Evaluación 3\"]','2026-11-07 17:15:41'),(10,16,12,'Biología, Ambiente y Tecnología',2,1,4,'[25, 25, 25, 25]','[\"Evaluación 1\", \"Evaluación 2\", \"Evaluación 3\", \"Evaluación 4\"]','2026-11-08 16:09:41'),(13,16,12,'Biología, Ambiente y Tecnología',2,3,3,'[33.3, 33.3, 33.4]','[\"Evaluación 1\", \"Evaluación 2\", \"Evaluación 3\"]','2026-11-08 16:09:41');
/*!40000 ALTER TABLE `evaluaciones_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluaciones_notas`
--

DROP TABLE IF EXISTS `evaluaciones_notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_notas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `estudiante_id` int(11) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `materia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `momento` tinyint(4) NOT NULL COMMENT '1=MP1, 2=MP2, 3=MP3',
  `notas_eval` json NOT NULL COMMENT 'Array JSON con las notas de cada evaluación sobre 20',
  `nota_momento` decimal(4,2) NOT NULL COMMENT 'Nota definitiva del momento sobre 20 puntos',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_eval_nota` (`estudiante_id`,`seccion_id`,`materia`(80),`periodo_id`,`momento`),
  KEY `seccion_id` (`seccion_id`),
  KEY `periodo_id` (`periodo_id`),
  CONSTRAINT `evaluaciones_notas_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_notas_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_notas_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_notas`
--

LOCK TABLES `evaluaciones_notas` WRITE;
/*!40000 ALTER TABLE `evaluaciones_notas` DISABLE KEYS */;
INSERT INTO `evaluaciones_notas` VALUES (1,29,12,'Biología, Ambiente y Tecnología',2,1,'[20, 20, 20, 20]',20.00,'2026-11-08 01:01:22'),(2,30,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(3,31,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(4,32,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(5,33,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(6,34,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(7,35,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(8,36,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(9,37,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:22'),(10,38,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:23'),(11,39,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:23'),(12,40,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:23'),(13,41,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:23'),(14,42,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:23'),(15,43,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:23'),(16,44,12,'Biología, Ambiente y Tecnología',2,1,'[null, null, null, null]',0.00,'2026-11-08 01:01:23');
/*!40000 ALTER TABLE `evaluaciones_notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menciones`
--

DROP TABLE IF EXISTS `menciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `color` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icono` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menciones`
--

LOCK TABLES `menciones` WRITE;
/*!40000 ALTER TABLE `menciones` DISABLE KEYS */;
INSERT INTO `menciones` VALUES (1,'Electricidad','#b45309','bx bx-bolt-circle'),(2,'Metalmecánica','#4338ca','bx bx-cog'),(3,'Refinación y Petroquímica','#047857','bx bx-test-tube'),(4,'Gestión Integral de Riesgo','#b91c1c','bx bx-shield-quarter'),(7,'Motopierueta','#334155','bx bx-car'),(8,'Artes','#047857','bx bx-palette');
/*!40000 ALTER TABLE `menciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas`
--

DROP TABLE IF EXISTS `notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `definitiva` decimal(4,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nota` (`estudiante_id`,`seccion_id`,`materia`,`periodo_id`),
  KEY `estudiante_id` (`estudiante_id`),
  KEY `seccion_id` (`seccion_id`),
  KEY `periodo_id` (`periodo_id`),
  KEY `idx_notas_materia` (`materia`),
  CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notas_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notas_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas`
--

LOCK TABLES `notas` WRITE;
/*!40000 ALTER TABLE `notas` DISABLE KEYS */;
INSERT INTO `notas` VALUES (5,5,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(6,2,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(7,6,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(8,7,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(9,3,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(10,4,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(11,9,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(12,11,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(13,10,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(14,8,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(15,12,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(16,13,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(17,14,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(18,15,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(19,16,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(20,17,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(21,18,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(22,19,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(23,20,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(24,21,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(25,22,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(26,23,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(27,24,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(28,25,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(29,26,13,'Idiomas',2,NULL,0,NULL,0,NULL,0,0.00),(30,29,12,'Lengua y Literatura',2,10.00,5,20.00,5,20.00,5,16.67),(31,30,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(32,31,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(33,33,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(34,35,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(35,32,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(36,37,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(37,34,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(38,38,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(39,36,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(40,39,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(41,40,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(42,41,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(43,42,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(44,43,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(45,44,12,'Lengua y Literatura',2,NULL,0,NULL,0,NULL,0,0.00),(46,2,13,'Biología, Ambiente y Tecnología',2,10.00,0,10.00,0,10.00,0,10.00),(47,4,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(48,8,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(49,6,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(50,5,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(51,7,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(52,9,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(53,3,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(54,10,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(55,16,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(56,15,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(57,12,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(58,14,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(59,13,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(60,11,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(61,20,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(62,19,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(63,17,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(64,18,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(65,21,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(66,22,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(67,23,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(68,25,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(69,24,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(70,26,13,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(71,46,17,'Caballito',2,10.00,0,10.00,0,10.00,0,10.00),(72,29,12,'Biología, Ambiente y Tecnología',2,19.90,0,11.00,0,10.00,0,13.63),(80,32,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(81,31,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(82,30,12,'Biología, Ambiente y Tecnología',2,10.00,0,15.00,0,10.00,0,11.67),(83,33,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(84,35,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(85,34,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(86,38,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(87,37,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(88,36,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(89,40,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(90,41,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(91,39,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(92,43,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(93,42,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(94,44,12,'Biología, Ambiente y Tecnología',2,NULL,0,NULL,0,NULL,0,0.00),(104,61,17,'Caballito',2,NULL,0,NULL,0,NULL,0,0.00);
/*!40000 ALTER TABLE `notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos`
--

DROP TABLE IF EXISTS `periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_mp1` date DEFAULT NULL,
  `fecha_mp2` date DEFAULT NULL,
  `fecha_mp3` date DEFAULT NULL,
  `estado` enum('activo','cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'activo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos`
--

LOCK TABLES `periodos` WRITE;
/*!40000 ALTER TABLE `periodos` DISABLE KEYS */;
INSERT INTO `periodos` VALUES (2,'2026-2027','2026-02-01','2028-06-30','2026-07-08','2026-11-03','2026-11-12','cerrado');
/*!40000 ALTER TABLE `periodos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secciones`
--

DROP TABLE IF EXISTS `secciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mencion_id` int(11) DEFAULT NULL,
  `profesor_guia_id` int(11) DEFAULT NULL,
  `profesor_guia_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mencion_id` (`mencion_id`),
  KEY `profesor_guia_id` (`profesor_guia_id`),
  CONSTRAINT `secciones_ibfk_1` FOREIGN KEY (`mencion_id`) REFERENCES `menciones` (`id`),
  CONSTRAINT `secciones_ibfk_2` FOREIGN KEY (`profesor_guia_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secciones`
--

LOCK TABLES `secciones` WRITE;
/*!40000 ALTER TABLE `secciones` DISABLE KEYS */;
INSERT INTO `secciones` VALUES (12,'1ro Año A',1,30,'Carmen Ramirez'),(13,'2do Año A',1,NULL,'Daysi Siritt'),(16,'1ro Año A',2,NULL,'Profe prueba'),(17,'1ro Año D',7,31,'Guia prueba'),(33,'2do Año D',7,31,'Guia prueba');
/*!40000 ALTER TABLE `secciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_assignments`
--

DROP TABLE IF EXISTS `teacher_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `materia_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seccion_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_assignments_ibfk_1` (`teacher_id`),
  KEY `teacher_assignments_ibfk_2` (`seccion_id`),
  CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_assignments`
--

LOCK TABLES `teacher_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_assignments` DISABLE KEYS */;
INSERT INTO `teacher_assignments` VALUES (50,17,'Geografía, Historia y Soberanía Nacional',12),(56,16,'Biología, Ambiente y Tecnología',12);
/*!40000 ALTER TABLE `teacher_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `tipo_docente` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'docente',
  `solicitud_reset` tinyint(1) DEFAULT '0',
  `reset_fecha` datetime DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (3,'V-31072861','Leonardo','Perez','leonardojose2706@gmail.com','04126797303','admin','leonardo27',NULL,'','','docente',0,NULL,1),(14,'V-10000003','Nairin','Briseño','nairin@gmail.com','0412-3333333','teacher','123456',NULL,'Idiomas','12','docente',0,NULL,1),(15,'V-10000004','Andrés','Méndez','andres@gmail.com','0412-4444444','teacher','12345678',NULL,'Educación Física','12','docente',0,NULL,1),(16,'V-10000005','Deibis','García','deibis@gmail.com','0412-5555555','teacher','123456',NULL,'Biología, Ambiente y Tecnología','12','docente',0,NULL,1),(17,'V-10000006','Ángelo','Velásquez','angelo@gmail.com','0412-6666666','teacher','docente123',NULL,'Geografía, Historia y Soberanía Nacional','12','docente',0,NULL,1),(19,'V-000000','Admin','Sistema',NULL,NULL,'admin','admin123','super-admin',NULL,NULL,'docente',0,NULL,1),(29,'superadmin','Super','Administrador','superadmin@aliprimera.edu.ve','','superadmin','superadmin123',NULL,NULL,NULL,'docente',0,NULL,1),(30,'V-20000001','Carmen','Ramirez','carmen.ramirez@aliprimera.edu.ve','0414-1112233','teacher','123456',NULL,NULL,NULL,'docente_guia',0,NULL,1),(31,'V-12345678','Guia','prueba','','0412444444444','teacher','123456',NULL,NULL,NULL,'solo_guia',0,NULL,1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sistema_ali'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-14  0:40:00
