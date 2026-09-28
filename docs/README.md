# 📚 Documentación — ÉLYSÉE Reservas

Documentación técnica del sistema de reservas del restaurante **ÉLYSÉE**.

## Índice

- [Diagrama Entidad-Relación](./ERD.md)
- [Tablas de la Base de Datos](./tablas/)
  - [Clientes](./tablas/01-clientes.md)
  - [Mesas](./tablas/02-mesas.md)
  - [Reservaciones](./tablas/03-reservaciones.md)
- [Decisiones Técnicas](./decisiones.md) *(pendiente)*
- [Especificación de la API](./API.md) *(pendiente)*
- [Guía de Contribución](./guia-contribucion.md) *(pendiente)*
- [Guía de Despliegue](./guia-despliegue.md) *(pendiente)*
- [Glosario](./glosario.md) *(pendiente)*

## Convenciones

- **Motor de BD**: SQL Server 2019+
- **Collation**: `SQL_Latin1_General_CP1_CI_AS`
- **Nombres de tablas**: PascalCase plural (`Clientes`, `Mesas`, `Reservaciones`)
- **Nombres de columnas**: PascalCase (`ClienteID`, `NumeroMesa`, `FechaCreacion`)
- **Constraints**: prefijo por tipo
  - `PK_` → Primary Key
  - `FK_` → Foreign Key
  - `UQ_` → Unique
  - `CK_` → Check
  - `IX_` → Index
- **Idioma**: nombres de negocio en español, palabras clave SQL en inglés

## Estructura de archivos

```
docs/
├── README.md              → Este archivo (índice)
├── ERD.md                 → Diagrama Entidad-Relación
├── decisiones.md          → Registro de decisiones técnicas (ADR)
├── API.md                 → Especificación de endpoints REST
├── guia-contribucion.md   → Cómo contribuir al proyecto
├── guia-despliegue.md     → Cómo desplegar en producción
├── glosario.md            → Términos del dominio
└── tablas/
    ├── 01-clientes.md
    ├── 02-mesas.md
    └── 03-reservaciones.md
```

## ¿Por dónde empezar?

- **Nuevo en el proyecto**: empieza por el [ERD](./ERD.md) para entender el modelo de datos.
- **Vas a tocar la base de datos**: lee las 3 tablas en `tablas/`.
- **Vas a consumir la API**: ve a [API.md](./API.md).
- **Vas a contribuir código**: lee la [Guía de Contribución](./guia-contribucion.md).