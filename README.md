# 🍽️ ÉLYSÉE Reservas

[![Build Status](https://img.shields.io/badge/build-pending-yellow)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen)]()
[![SQL Server](https://img.shields.io/badge/sql%20server-%3E%3D2019-red)]()

Sistema de gestión de reservas para el restaurante de alta cocina **ÉLYSÉE**.
Permite a los clientes reservar mesas en línea y al restaurante administrar
mesas, horarios y reservaciones desde una API REST moderna.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| Base de datos | SQL Server 2019+ |
| Frontend | React + Vite + Tailwind CSS |
| Autenticación | JWT (panel admin) |
| Documentación | Markdown en `/docs` |
| CI/CD | GitHub Actions |
| Control de versiones | Git + GitHub |

---

## 📁 Estructura del Proyecto

```
Restaurant-Page-with_DB/
├── .github/              # Templates de issues, PRs y workflows de CI
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── docs/                 # Documentación técnica y funcional
│   └── tablas/           # Documentación por tabla de la BD
├── database/             # Scripts SQL: migraciones, seeds, queries, tests
│   ├── migrations/
│   ├── seeds/
│   ├── queries/
│   └── tests/
├── backend/              # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── validators/
│   │   └── utils/
│   └── tests/
├── frontend/             # Interfaz de usuario (React + Vite)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       ├── styles/
│       └── utils/
├── .editorconfig
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📋 Requisitos Previos

- **Node.js** >= 18.x → [Descargar](https://nodejs.org/)
- **npm** >= 9.x (viene con Node)
- **SQL Server** >= 2019 → [Descargar](https://www.microsoft.com/sql-server/sql-server-downloads)
- **Git** → [Descargar](https://git-scm.com/)
- **Docker** (opcional, para SQL Server en contenedor)

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Javiersan237/Restaurant-Page-with_DB.git
cd Restaurant-Page-with_DB
git checkout develop
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de SQL Server.

### 3. Levantar SQL Server (opcional con Docker)

```bash
docker-compose up -d
```

### 4. Instalar dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 5. Ejecutar migraciones de la base de datos

```bash
cd ../database
# Ejecutar los scripts en orden: 0001 → 0006
```

---

## ▶️ Cómo Ejecutar el Proyecto

**Backend:**
```bash
cd backend
npm run dev
```
→ Disponible en `http://localhost:3000`

**Frontend:**
```bash
cd frontend
npm run dev
```
→ Disponible en `http://localhost:5173`

---

## 📚 Documentación

Toda la documentación detallada está en la carpeta [`/docs`](./docs).

| Documento | Descripción |
|-----------|-------------|
| [ERD](./docs/ERD.md) | Diagrama Entidad-Relación de la base de datos |
| [API](./docs/API.md) | Especificación de endpoints REST |
| [Tablas](./docs/tablas/) | Documentación detallada de cada tabla |
| [Decisiones](./docs/decisiones.md) | Registro de decisiones técnicas (ADR) |
| [Guía de contribución](./docs/guia-contribucion.md) | Cómo contribuir al proyecto |
| [Guía de despliegue](./docs/guia-despliegue.md) | Cómo desplegar en producción |
| [Glosario](./docs/glosario.md) | Términos del dominio del restaurante |

---

## 🌿 Flujo de Ramas

| Rama | Propósito | Quién escribe |
|------|-----------|---------------|
| `main` | Solo archivos base (configuración del repo) | Solo vía PR aprobado |
| `develop` | Rama de integración con todo el código | Ambos desarrolladores |
| `feature/*` | Trabajo individual por issue | Cada uno la suya |

**Reglas de contribución:**

1. Toda feature se desarrolla en una rama `feature/nombre-descriptivo`.
2. Se abre un Pull Request hacia `develop`.
3. El otro compañero revisa y aprueba.
4. Se hace merge con **squash** (un solo commit por feature).
5. `main` **nunca** recibe merges directos, solo PRs coordinados.

---

## 🧪 Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

**Base de datos:**
```bash
# Ejecutar scripts en database/tests/
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Javier Aram** — [@Javiersan237](https://github.com/Javiersan237)
- **Angela Sofía** — [@tu-usuario](http://github.com/estrella18iortiz-byte)

---

## 🙏 Agradecimientos

Proyecto desarrollado como práctica profesional de arquitectura full-stack
con SQL Server, Node.js y React.