# Imagen base oficial de Python en versión ligera (Linux Slim)
FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc y forzar buffer de salida para ver logs en Render
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de dependencias e instalarlas limpiamente
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código fuente al contenedor (el .dockerignore omitirá el .env y el env/)
COPY . /app/

# Exponer el puerto estándar que usa Render
EXPOSE 8000

# Comando de producción: arranca Gunicorn enlazado al puerto 8000
CMD sh -c "python manage.py migrate && python manage.py seed_inventario && gunicorn core.wsgi:application --bind 0.0.0.0:8000"
