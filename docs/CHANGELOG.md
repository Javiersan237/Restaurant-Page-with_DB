---

### 2. `CHANGELOG.md`

Crea este archivo en la **raíz del repositorio** (junto al README).

```markdown
# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [1.0.0] - 2026-09-29

### Añadido
- Primera versión estable y funcional del sistema ÉLYSÉE Reservas.
- **Base de datos:** Modelo relacional completo en SQL Server con 4 tablas (`Clientes`, `Mesas`, `Agendas`, `Reservaciones`), validaciones mediante CHECK constraints, triggers y control de doble solapamiento.
- **Backend:** API REST construida con Node.js y Express. Manejo robusto de pool de conexiones (`mssql`), Rate Limiting y configuración CORS estricta para producción.
- **Frontend:** Single Page Application construida con React y Vite. Incluye Landing Page (`HomePage`), listado de menú y flujo de reserva en 2 pasos con confirmación.
- **Diseño:** Interfaz estilizada con Tailwind CSS v4, implementando la paleta de colores exclusiva de la marca (Vino, Dorado y Negros profundos).
- **Documentación:** Directorio `docs/` completo incluyendo Diagrama Entidad-Relación (ERD), API, ADRs, glosario y guía de despliegue a producción.
- **Infraestructura:** Soporte para contenedores mediante `docker-compose.yml` para el despliegue local de SQL Server 2022.