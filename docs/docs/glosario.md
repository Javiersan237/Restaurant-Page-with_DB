# 📚 Glosario de Términos

Este documento define la terminología específica utilizada en el dominio de negocio y la arquitectura técnica del sistema **ÉLYSÉE Reservas**.

## Dominio de Negocio

- **Agenda / Bloque Reservable:** Un intervalo de tiempo específico (ej. 19:00 a 21:00 en un día concreto) que agrupa las reservaciones realizadas. 
- **Comensal:** Persona que asiste al restaurante (relacionado con el campo `NumeroPersonas`).
- **Lazy Cleanup (Limpieza Perezosa):** Mecanismo automático del sistema donde las agendas (bloques de tiempo) que ya caducaron y no tienen reservaciones asociadas son eliminadas de la base de datos automáticamente al hacer nuevas consultas.
- **No-Show:** Estado de una reservación donde el cliente no se presentó en el restaurante a la hora acordada y no canceló previamente.
- **Solapamiento:** Cuando dos o más clientes intentan reservar la misma mesa física en bloques de tiempo que chocan o se superponen (ej. 19:00-21:00 y 20:00-22:00).

## Términos Técnicos

- **CORS (Cross-Origin Resource Sharing):** Medida de seguridad configurada en el backend (`src/config/cors.js`) que asegura que solo el dominio oficial de ÉLYSÉE (el frontend) pueda solicitar datos a la API.
- **Endpoint:** Rutas específicas de la API (ej. `/api/mesas/disponibles`) que el frontend consulta para enviar o recibir información.
- **Idempotencia:** Propiedad de ciertas rutas de la API y scripts SQL (`seeds`) donde ejecutarlos múltiples veces tiene el mismo efecto seguro que ejecutarlos una sola vez (no duplica datos erróneamente).
- **SPA (Single Page Application):** Arquitectura del frontend (React + Vite) donde la página no se recarga al navegar, brindando una experiencia fluida.
- **UPDLOCK:** Bloqueo transaccional de SQL Server utilizado al momento de crear una reservación para evitar problemas de concurrencia si dos personas intentan reservar la misma mesa exactamente al mismo milisegundo.