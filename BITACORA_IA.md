# Bitácora de Uso y Auditoría de Inteligencia Artificial

**Asignatura:** Programación Back End (TI3041)  
**Estudiante:** Felipe Álvarez (Alumno INACAP)  
**Docente:** Helton Smith Bustos Sáez  
**Proyecto:** Sistema de Gestión de Inventario Desacoplado Full Stack  
**Repositorio:** https://github.com/pipefound/Construcci-n-de-Arquitectura-Desacoplada-Full-Stack  
**Backend (Render):** https://inventario-backend-udw5.onrender.com/api/  
**Frontend (Vercel):** https://construccin-de-arquitectura-desacoplada-full-stack.vercel.app

---

## 1. Prompts Principales Formulados

* **Prompt 1 (Modelado de Datos Relacional):**
  > *"Genera 3 modelos relacionales para Django representando un sistema de inventario con integridad referencial 1:N (Categoría, Proveedor y Producto) con campos de auditoría y validaciones básicas."*

* **Prompt 2 (Serializadores y Relaciones):**
  > *"Escribe serializers en Django REST Framework para Producto que incluyan campos calculados de solo lectura (ReadOnlyField) para mostrar el nombre legible de la categoría y del proveedor sin perder la clave foránea para inserciones."*

* **Prompt 3 (Contenedorización en Docker):**
  > *"Crea un Dockerfile ligero basado en python:3.12-slim para Django con Gunicorn en el puerto 8000, compatible con PostgreSQL para ser desplegado como Web Service en Render.com, automatizando migraciones y seeder al arrancar el contenedor."*

* **Prompt 4 (Poblado Semilla / Fixture):**
  > *"Diseña un comando personalizado de Django (manage.py seed_inventario) que inserte registros iniciales de categorías, proveedores y productos tecnológicos con SKU únicos, y que además cree un superusuario admin para pruebas de JWT."*

* **Prompt 5 (Autenticación JWT):**
  > *"Integra djangorestframework-simplejwt al proyecto Django para exponer los endpoints /api/token/ y /api/token/refresh/, configurar JWTAuthentication en REST_FRAMEWORK y proteger las operaciones de escritura (POST, PUT, DELETE) con IsAuthenticatedOrReadOnly."*

* **Prompt 6 (Frontend React Desacoplado):**
  > *"Construye una Single Page Application en React con Vite y Axios que consuma la API REST en Render, con tabla de productos, formulario CRUD reactivo con selectores de Categoría y Proveedor, y envío de cabecera Authorization: Bearer token en las peticiones protegidas."*

* **Prompt 7 (Diseño Liquid Glass + Home/Lobby):**
  > *"Rediseña la interfaz React con estética glassmorphism (backdrop-filter: blur, paneles semitransparentes, orbes de luz animados) e implementa una vista Home/Lobby pública con preview parcial del catálogo bloqueado, que exija autenticación JWT para revelar el Dashboard de gestión completo."*

---

## 2. Errores, Alucinaciones y Depuración

* **Incompatibilidad de versión Python 3.11 con Django 6:**
  * *Problema detectado:* El Dockerfile inicial usaba `FROM python:3.11-slim`. Al instalar `Django==6.1.3`, pip rechazó la instalación con el error `Requires-Python >=3.12`, impidiendo que la imagen Docker se construyera en Render.
  * *Depuración y Corrección:* Se actualizó la imagen base a `FROM python:3.12-slim` en el `Dockerfile`, lo que resolvió la incompatibilidad de versión y permitió construir el contenedor correctamente.

* **Alucinación del campo DB_HOST con URL completa de conexión:**
  * *Problema detectado:* Al configurar las variables de entorno en Render, se pegó la URL completa de PostgreSQL (`postgresql://usuario:clave@host/db`) en la variable `DB_HOST`. Django espera únicamente el hostname del servidor, no una URL compuesta, lo que provocó el error `could not translate host name "postgresql://..." to address: Name or service not known`.
  * *Depuración y Corrección:* Se descompuso la URL en sus partes individuales, asignando cada fragmento a su variable correspondiente: `DB_HOST` recibió solo el hostname (`dpg-...`), `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DB_PORT` se configuraron por separado con sus valores respectivos.

* **Shell interactivo de Render bloqueado en plan gratuito:**
  * *Problema detectado:* La pauta indicaba ejecutar `python manage.py migrate` y `python manage.py seed_inventario` manualmente desde la consola Shell de Render. Sin embargo, el plan gratuito no permite acceso a la consola interactiva sin pago.
  * *Depuración y Corrección:* Se modificó el `Dockerfile` para encadenar los comandos de migración, semilla y servidor en la instrucción `CMD` usando `sh -c`, de modo que se ejecutan automáticamente cada vez que el contenedor arranca en Render, sin necesidad de intervención manual ni consola de pago.

* **Configuración Restrictiva de CORS bloqueando React:**
  * *Problema detectado:* La IA inicialmente propuso una lista rígida de orígenes permitidos en `CORS_ALLOWED_ORIGINS` apuntando a `localhost:3000`. Al usar Vite (puerto `5173`) y al desplegar el frontend en Vercel (dominio dinámico), el navegador bloqueaba todas las solicitudes `preflight OPTIONS`.
  * *Depuración y Corrección:* Se instaló `django-cors-headers`, se posicionó `CorsMiddleware` estrictamente como primera entrada en `MIDDLEWARE` y se configuró `CORS_ALLOW_ALL_ORIGINS = True` para garantizar la interoperabilidad entre Render (backend) y Vercel (frontend).

* **Credenciales JWT inválidas por falta del superusuario en la base de datos:**
  * *Problema detectado:* El endpoint `/api/token/` respondía con `401 Unauthorized` al intentar autenticarse con `admin/admin123`, ya que el seeder original no incluía la creación del superusuario de Django.
  * *Depuración y Corrección:* Se agregó al comando `seed_inventario.py` la instrucción `User.objects.create_superuser('admin', 'admin@inacap.cl', 'admin123')` con verificación previa de existencia, garantizando que el usuario administrador se cree automáticamente en PostgreSQL al arrancar el contenedor.

* **Ruta del Dockerfile impidiendo la copia de requirements.txt:**
  * *Problema detectado:* El `Dockerfile` fue inicialmente ubicado dentro del paquete `core/`, por lo que el contexto de construcción de Docker no encontraba el archivo `requirements.txt` ubicado en la raíz del repositorio.
  * *Depuración y Corrección:* Se trasladó el `Dockerfile` a la raíz del repositorio y se creó un `.dockerignore` para excluir `env/`, `.env` y directorios temporales, resolviendo el contexto de construcción.

---

## 3. Justificación Arquitectónica

* **Uso de ModelViewSet y DefaultRouter (DRF):**
  * Se implementaron `ModelViewSet` en conjunto con `DefaultRouter` para garantizar el cumplimiento estricto de la semántica HTTP RESTful (`GET`, `POST`, `PUT`, `DELETE`), respondiendo con los códigos de estado exactos definidos por la pauta: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request` y `404 Not Found`.

* **Desacoplamiento Total Frontend / Backend:**
  * La capa de presentación (React SPA con Vite desplegada en Vercel) opera de forma completamente independiente del servidor de aplicaciones (Django REST Framework en Render). La comunicación es estrictamente asíncrona mediante JSON sobre HTTPS, permitiendo escalar, reemplazar o mantener cualquier extremo de forma independiente sin afectar al otro.

* **Persistencia Empresarial y Seguridad de Secretos:**
  * Se utilizó una instancia gestionada de PostgreSQL en Render.com para producción, desacoplada de SQLite usada en desarrollo local. Todas las credenciales sensibles (`SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) se inyectan como variables de entorno en la plataforma cloud, garantizando que ningún secreto viaje al repositorio público de GitHub.

* **Automatización del Ciclo de Vida del Contenedor Docker:**
  * El `Dockerfile` encadena en su instrucción `CMD` tres operaciones secuenciales: `migrate` (creación de esquema en PostgreSQL), `seed_inventario` (carga de datos iniciales y superusuario) y `gunicorn` (inicio del servidor de producción), eliminando la dependencia de intervención manual y garantizando un despliegue reproducible en cualquier entorno.

* **Autenticación Segura con JWT (Bonificación +10 pts):**
  * Se implementó `djangorestframework-simplejwt` para emitir Bearer Tokens firmados mediante el estándar JSON Web Token (RFC 7519). Las operaciones de escritura (`POST`, `PUT`, `DELETE`) sobre el recurso `Producto` están protegidas con `IsAuthenticatedOrReadOnly`, permitiendo lectura pública del catálogo y exigiendo token válido para mutaciones. El frontend React almacena el token en `localStorage` y lo adjunta en la cabecera `Authorization: Bearer <token>` de cada petición protegida.

* **Interfaz Liquid Glass con Home/Lobby (Bonificación Visual):**
  * Se implementó una arquitectura de vistas en dos capas: un **Home/Lobby** público con preview parcial del catálogo (glassmorphism, orbes animados, estadísticas en vivo) y un **Dashboard** protegido que solo se revela tras autenticación JWT exitosa. Esta decisión de diseño refuerza visualmente el concepto de seguridad basada en tokens evaluado en la bonificación.