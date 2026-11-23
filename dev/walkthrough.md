# Recorrido de la Migración a MySQL

Hemos transformado el sistema escolar de un almacenamiento local (`localStorage`) a una base de datos profesional utilizando **MySQL** y **PHP**. Esto permite que los datos sean permanentes y accesibles desde cualquier navegador.

## 🗄️ Base de Datos e Infraestructura

1.  **Esquema SQL (`database/schema.sql`)**: Se definió toda la estructura de tablas con relaciones (Foreign Keys) para asegurar la integridad de los datos.
2.  **Conexión Centralizada (`lib/db.php`)**: Gestiona el enlace con MySQL usando **consultas preparadas** para máxima seguridad contra inyecciones SQL.
3.  **Controlador Maestro (`api/main.php`)**: Un solo archivo PHP que recibe "acciones" desde el navegador y realiza las operaciones CRUD (Crear, Leer, Actualizar, Borrar).

## 🌐 Integración con el Front-end

1.  **Refactorización de `data.js`**:
    - Se eliminó la dependencia de `localStorage`.
    - Todas las funciones (`addUser`, `addStudent`, etc.) ahora son **asíncronas** y se comunican con el servidor mediante `fetch()`.
    - Se implementó `initData()` para cargar el estado inicial del sistema en una sola petición.

2.  **Sincronización de la Interfaz**:
    - Se actualizaron `render.js` y `grados-maestros-prof.js` para que la aplicación espere a que los datos lleguen del servidor antes de intentar mostrar las tablas.
    - El sistema de login ahora valida las credenciales directamente contra la base de datos MySQL.

---

## 🚀 Pasos para completar la instalación

> [!IMPORTANT]
> Para que el sistema funcione ahora, debes realizar estos dos pasos en tu servidor local (XAMPP/WAMP):

1.  **Importar la Base de Datos**:
    - Abre `phpMyAdmin`.
    - Crea una base de datos llamada `sistema_escolar`.
    - Importa el archivo [schema.sql](file:///c:/Users/leo/Desktop/pagina%202/database/schema.sql).

2.  **Configuración de Conexión**:
    - Si tu usuario de MySQL no es `root` o tienes contraseña, edita el archivo [db.php](file:///c:/Users/leo/Desktop/pagina%202/lib/db.php).

## ✅ Verificación Realizada

- [x] Creamos el Master Controller PHP con soporte para Usuarios, Estudiantes, Menciones, Secciones, Períodos y Notas.
- [x] Sincronizamos el arranque de la app con la carga de datos asíncrona.
- [x] Limpiamos archivos PHP obsoletos para mantener el proyecto organizado.
