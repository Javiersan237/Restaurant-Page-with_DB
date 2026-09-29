# 🍽️ ÉLYSÉE Reservas — Frontend

Interfaz de usuario para el sistema de reservas del restaurante **ÉLYSÉE**, un restaurante de alta cocina francesa.

Este proyecto está construido con **React + Vite + Tailwind CSS v4**, y consume la API del backend alojada en `/api` (a través del proxy configurado en Vite).

---

## 🛠️ Stack Tecnológico

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| React | 19.x | Librería de UI |
| Vite | 8.x | Bundler y servidor de desarrollo |
| Tailwind CSS | 4.x | Estilos utilitarios |
| React Router | 7.x | Navegación entre páginas |
| Axios | 1.x | Cliente HTTP |
| ESLint | 10.x | Análisis de código |

---

## 📁 Estructura de carpetas

    frontend/
    ├── public/                # Archivos estáticos (favicon, icons)
    ├── src/
    │   ├── assets/            # Imágenes, iconos importados
    │   ├── components/        # Componentes reutilizables (Navbar, Footer, Layout)
    │   ├── context/           # Contextos de React
    │   ├── hooks/             # Custom hooks (useForm, useDisponibilidad)
    │   ├── pages/             # Páginas (Home, Menu, Reservar, 404)
    │   ├── services/          # Llamadas a la API (axios)
    │   ├── styles/            # Estilos globales (globals.css con paleta ÉLYSÉE)
    │   ├── utils/             # Utilidades (formateo, validación)
    │   ├── App.jsx            # Configuración de React Router
    │   └── main.jsx           # Punto de entrada
    ├── index.html             # HTML raíz (con Google Fonts)
    ├── vite.config.js         # Configuración de Vite + Tailwind + proxy
    └── package.json

---

## 📋 Requisitos previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**

---

## 🚀 Instalación

### 1. Clonar el repositorio

    git clone https://github.com/Javiersan237/Restaurant-Page-with_DB.git
    cd Restaurant-Page-with_DB
    git checkout develop

### 2. Entrar a la carpeta del frontend

    cd frontend

### 3. Instalar dependencias

    npm install

---

## ▶️ Cómo ejecutar el proyecto

    npm run dev

La aplicación se abrirá en: **http://localhost:5173**

> ⚠️ **Nota:** Las llamadas a `/api/*` se redirigen automáticamente al backend en `http://localhost:3000` (configurado en `vite.config.js`). Asegúrate de tener el backend corriendo.

---

## 🎨 Paleta de colores

Los colores del restaurante están definidos en `src/styles/globals.css` usando la directiva `@theme` de Tailwind v4:

| Color | Uso | Código |
|-------|-----|--------|
| 🟡 Dorado | Acentos, títulos, botones | `#C9A961` |
| 🍷 Vino | Botones principales, CTA | `#722F37` |
| ⚫ Negro | Fondos, texto | `#1A1A1A` |

Uso en clases de Tailwind:

    <h1 className="text-dorado-400 font-serif">ÉLYSÉE</h1>
    <button className="bg-vino-500 hover:bg-vino-600">Reservar</button>

---

## 🔤 Fuentes

- **Playfair Display** — Títulos (serif elegante)
- **Inter** — Cuerpo (sans moderna)

Se cargan desde Google Fonts en `index.html`.

---

## 🧪 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `localhost:5173` |
| `npm run build` | Compila para producción en `/dist` |
| `npm run preview` | Previsualiza la build de producción |
| `npm run lint` | Analiza el código con ESLint |

---

## 🗺️ Estructura de rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | HomePage | Landing del restaurante |
| `/menu` | MenuPage | Menú (en construcción) |
| `/reservar` | ReservarPage | Formulario de reservación |
| `*` | NotFoundPage | Página 404 |

---

## 📚 Documentación relacionada

- [README del proyecto principal](../README.md)
- [API del backend](../docs/API.md)
- [Modelo de base de datos](../docs/ERD.md)
- [Guía de contribución](../docs/guia-contribucion.md)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](../LICENSE).