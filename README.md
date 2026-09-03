# Proyecto Pronavid - Guía de Docker

Este proyecto está configurado para ejecutarse en contenedores Docker, lo que garantiza que todos trabajemos en el mismo entorno.

## Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

## Cómo empezar

1. **Clonar/Descargar la carpeta `BACKUOv2`**.
2. **Abrir una terminal** dentro de la carpeta `BACKUOv2`.
3. **Ejecutar el comando:**
   ```bash
   docker-compose up --build
   ```

## Servicios incluidos
- **Base de Datos (MySQL):** Disponible internamente en `db:3306` y externamente en `localhost:3308`.
- **Backend (NestJS):** Disponible en `http://localhost:4000/api`.
- **Frontend (Vite + Nginx):** Disponible en `http://localhost`.

## Notas importantes
- La base de datos se inicializa automáticamente con los datos del archivo `mysql_init/init.sql` la primera vez que se crea el volumen.
- Los archivos subidos (imágenes, etc.) se guardan en `backend-nest-js/uploads`.
- Si necesitas reiniciar la base de datos desde cero, borra el volumen: `docker-compose down -v`.
