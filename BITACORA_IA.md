# Bitácora de Uso y Auditoría de Inteligencia Artificial

**Asignatura:** Programación Back End (TI3041)  
**Estudiante:** Felipe Álvarez (Alumno INACAP)  
**Docente:** Helton Smith Bustos Sáez  
**Proyecto:** Sistema de Gestión de Inventario Desacoplado (Categoría, Proveedor, Producto)

---

## 1. Prompts Principales Formulados

* **Prompt 1 (Modelado de Datos Relacional):**
  > *"Genera 3 modelos relacionales para Django representando un sistema de inventario con integridad referencial 1:N (Categoría, Proveedor y Producto) con campos de auditoría y validaciones básicas."*
* **Prompt 2 (Serializadores y Relaciones):**
  > *"Escribe serializers en Django REST Framework para Producto que incluyan campos calculados o de solo lectura (ReadOnlyField) para mostrar el nombre legible de la categoría y del proveedor sin perder la clave foránea para inserciones."*
* **Prompt 3 (Contenedorización en Docker):**
  > *"Crea un Dockerfile ligero y optimizado basado en python:3.11-slim para Django con Gunicorn en el puerto 8000, compatible con PostgreSQL (psycopg2-binary) para ser desplegado como Web Service en Render.com."*
* **Prompt 4 (Poblado Semilla / Fixture):**
  > *"Diseña un comando personalizado de Django (manage.py seed_inventario) que inserte registros iniciales consistentes de categorías de tecnología, proveedores y productos tecnológicos con códigos SKU únicos."*

---

## 2. Errores, Alucinaciones y Depuración

* **Alucinación de Puerto y Host:**
  * *Problema detectado:* Inicialmente la IA sugirió realizar peticiones a `127.0.0.1` sin puerto explícito o asumiendo el puerto 3000/5000, provocando fallos de conexión `ECONNREFUSED`.
  * *Depuración y Corrección:* Se diagnosticó el proceso activo en terminal comprobando que Django/Gunicorn corre en el puerto `8000`. Se unificó la URL base del cliente y se documentó el puerto estándar `8000` en el `Dockerfile`.
* **Configuración Restrictiva de CORS:**
  * *Problema detectado:* La IA propuso una lista rígida en `CORS_ALLOWED_ORIGINS` con `localhost:3000`. Al correr React con Vite (que usa por defecto el puerto `5173`) y al desplegar posteriormente en la nube, el navegador bloqueaba las solicitudes `preflight OPTIONS`.
  * *Depuración y Corrección:* Se instaló `django-cors-headers`, se posicionó `corsheaders.middleware.CorsMiddleware` estrictamente en la primera línea de `MIDDLEWARE` en `settings.py`, y se configuró temporalmente `CORS_ALLOW_ALL_ORIGINS = True` para garantizar la interoperabilidad fluida tanto en local como en producción.
* **Ubicación del Dockerfile y Contexto de Construcción:**
  * *Problema detectado:* La IA inicialmente ubicó el `Dockerfile` dentro del paquete `core/`, lo que impedía que Docker encontrara `requirements.txt` ubicado en la raíz.
  * *Depuración y Corrección:* Se trasladó el `Dockerfile` a la raíz del repositorio y se creó un `.dockerignore` para omitir `env/`, `.env`, y directorios temporales, agilizando el despliegue en Render.

---

## 3. Justificación Arquitectónica

* **Uso de ModelViewSet y DefaultRouter (DRF):**
  * Se implementaron `ModelViewSet` en conjunto con `DefaultRouter` para asegurar el cumplimiento estricto de la semántica HTTP RESTful universal (`GET`, `POST`, `PUT`, `DELETE`), respondiendo con códigos de estado exactos (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).
* **Desacoplamiento Total Frontend / Backend:**
  * La capa de presentación (React SPA con Vite) opera de forma 100% independiente del servidor de aplicaciones (Django REST Framework). La comunicación es estrictamente asíncrona mediante JSON sobre HTTPS, permitiendo escalar o reemplazar cualquier extremo sin afectar al otro.
* **Persistencia Empresarial y Seguridad de Secretos:**
  * Se desacopló la base de datos local (SQLite para desarrollo ágil) de la base de datos de producción mediante una instancia gestionada de **PostgreSQL en Render.com**. Todas las credenciales sensibles (`SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) se manejan mediante variables de entorno inyectadas en la nube, garantizando que ningún secreto viaje al repositorio público de GitHub.
