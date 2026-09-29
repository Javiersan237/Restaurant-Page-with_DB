# 🚀 Guía de Despliegue en Producción

Esta guía detalla los pasos necesarios para desplegar el frontend, backend y la base de datos del sistema **ÉLYSÉE Reservas** en un entorno de producción.

## 🗄️ 1. Despliegue de Base de Datos (SQL Server)

El proyecto utiliza **SQL Server 2022**. Debes desplegar la base de datos antes que el backend.

**Opciones recomendadas:**
*   **Azure SQL Database (PaaS):** La opción más robusta y natural para SQL Server.
    *   Crea el recurso en el portal de Azure.
    *   Configura el Firewall para permitir acceso desde las IPs de tu servidor backend.
    *   Obtén la *Connection String*.
*   **Somee:** Excelente alternativa gratuita para proyectos de portafolio o pruebas.
    *   Crea una cuenta y una base de datos MS SQL.
    *   Conéctate con SSMS (SQL Server Management Studio) usando las credenciales proporcionadas.
    *   Ejecuta los scripts de la carpeta `database/migrations/` en orden (0001 al 0007).

## ⚙️ 2. Despliegue del Backend (Node.js + Express)

El backend está construido con Node.js y utiliza el puerto dinámico asignado por el entorno de hosting.

**Opciones recomendadas:**
*   **Render:** (Recomendado) 
    *   Conecta tu repositorio de GitHub.
    *   Ajusta el Root Directory a `backend`.
    *   Build Command: `npm install`
    *   Start Command: `npm start` (ejecuta `node src/server.js`).
*   **Railway:** Detecta automáticamente el entorno Node.js.
    *   Conecta el repositorio y selecciona la carpeta `backend` como raíz.

**Variables de Entorno (Environment Variables):**
Configura estas variables en tu proveedor de hosting:

```env
NODE_ENV=production
DB_HOST=tu-servidor.database.windows.net (o el host de Somee)
DB_PORT=1433
DB_NAME=ElyseeDB
DB_USER=tu_usuario
DB_PASSWORD=tu_password_segura
DB_ENCRYPT=true # Importante cambiar a true para Azure/producción
DB_TRUST_CERT=false
FRONTEND_URL=[https://elysee-reservas.vercel.app](https://elysee-reservas.vercel.app) # La URL final de tu frontend