<div align="center">

# 🛡️ Tacna SOC — Gestión de Vulnerabilidades

**Plataforma de Centro de Operaciones de Seguridad (SOC) para el monitoreo y gestión de vulnerabilidades en infraestructuras web de la región Tacna, Perú.**

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express)
![Gemini](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?style=for-the-badge&logo=google)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)

</div>

---

## 📖 ¿Qué es esta plataforma?

Tacna SOC es una aplicación web de gestión de seguridad que permite a analistas y administradores monitorear, analizar y gestionar vulnerabilidades de sitios web en tiempo real. La plataforma integra análisis de cabeceras HTTP, búsqueda de CVEs en la base de datos NVD (NIST) y análisis inteligente con **Gemini AI**.

---

## ✨ Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 📊 **Dashboard** | Panel ejecutivo con métricas globales, gráficos de riesgo y actividad reciente |
| 🌐 **Sitios Web** | Registro y monitoreo de sitios web con nivel de riesgo, escaneos y estados |
| 🔍 **Escaneo de Seguridad** | Análisis real de cabeceras HTTP: HSTS, CSP, X-Frame-Options, cookies, HTTPS, etc. |
| 🤖 **Análisis con IA** | Interpretación de resultados con Gemini 2.0 Flash: resumen, puntuación y recomendaciones |
| 🐞 **Vulnerabilidades** | Listado de CVEs con CVSS score, vector de ataque, remediación y sitios afectados |
| 📋 **Evaluaciones** | Historial de escaneos con calificación (A–F) y progreso |
| 📄 **Reportes** | Generación de reportes ejecutivos de seguridad |
| 🗄️ **Fuentes de Datos** | Integración con NVD/NIST, OWASP, MITRE ATT&CK y otras fuentes |
| 👥 **Gestión de Usuarios** | Administración de cuentas con roles: Super Admin, Security Analyst, Auditor, Operator |
| 📜 **Logs de Auditoría** | Registro completo de eventos del sistema con hash SHA-256 |
| ⚙️ **Configuración** | Ajustes generales de la plataforma |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│           Cliente (React + Vite)            │
│  React 19 · TypeScript · TailwindCSS v4    │
│  Lucide Icons · Motion (animaciones)       │
└──────────────────┬──────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────┐
│           Servidor (Express.js)             │
│  POST /api/scan        → Escaneo HTTP       │
│  GET  /api/cve/search  → Búsqueda NVD       │
│  POST /api/ai/analyze  → Gemini AI          │
│  GET  /api/health      → Estado del server  │
└──────────┬───────────────────┬──────────────┘
           │                   │
  ┌────────▼────────┐ ┌───────▼────────────┐
  │  NVD / NIST API │ │ Google Gemini API  │
  │  (CVE Search)   │ │ (AI Analysis)      │
  └─────────────────┘ └────────────────────┘
```

---

## 🚀 Instalación y ejecución local

### Prerrequisitos
- Node.js v18 o superior
- Una API Key de Gemini AI ([obtener aquí](https://aistudio.google.com/app/apikey))

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd tacna-soc
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` y completar:

```env
GEMINI_API_KEY="tu_api_key_de_gemini_aqui"
APP_URL="http://localhost:3000"
PORT=3000
```

### 4. Modo desarrollo (frontend + hot reload)

```bash
npm run dev
```
> Accede en: `http://localhost:3000`

### 5. Modo producción (con Express)

```bash
# Compilar el frontend
npm run build

# Iniciar el servidor
node server.js
```
> Accede en: `http://localhost:3000`

---

## ☁️ Deploy en VPS (Linux + Nginx + PM2)

### Requisitos del servidor
- Ubuntu 20.04+ / Debian 11+
- Node.js v20 LTS
- PM2 (`npm install -g pm2`)
- Nginx

---

### Opción A — Subir con SCP (desde tu PC local)

> Reemplaza `169.58.156.169` con la IP de tu VPS y `/var/www/sivit` con la ruta de tu proyecto.

#### 1. Compilar el proyecto primero en local

```bash
npm run build
```

#### 2. Subir los archivos al VPS

```bash
# Subir la carpeta dist (frontend compilado)
scp -r dist/ root@169.58.156.169:/var/www/sivit/

# Subir el servidor backend
scp server.js root@169.58.156.169:/var/www/sivit/

# Subir package.json
scp package.json root@169.58.156.169:/var/www/sivit/

# Subir variables de entorno
scp .env root@169.58.156.169:/var/www/sivit/
```

#### 3. Conectarte al VPS e instalar dependencias de producción

```bash
ssh root@169.58.156.169
cd /var/www/sivit
npm install --omit=dev
pm2 restart sivit-app
```

---

### Opción B — Usar Git (recomendado para actualizaciones frecuentes)

#### Primera vez en el VPS

```bash
ssh root@169.58.156.169
cd /var/www
git clone https://github.com/TU_USUARIO/TU_REPO.git sivit
cd sivit
npm install --omit=dev
npm run build
```

Crear el archivo `.env` en el VPS:

```bash
nano .env
```

```env
GEMINI_API_KEY="tu_api_key_aqui"
APP_URL="http://169.58.156.169"
PORT=3000
```

Iniciar con PM2:

```bash
pm2 start server.js --name sivit-app
pm2 save
pm2 startup   # para que inicie automáticamente tras reboot
```

#### Para actualizar el VPS después de cambios

```bash
# En tu PC local — hacer push a GitHub
git add .
git commit -m "descripción de cambios"
git push origin main

# En el VPS — actualizar
ssh root@169.58.156.169
cd /var/www/sivit
git pull origin main
npm install --omit=dev
npm run build
pm2 restart sivit-app
```

---

### Subir a GitHub (primera vez)

```bash
# Inicializar git en el proyecto
git init
git add .
git commit -m "feat: primera versión de Tacna SOC"

# Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

> ⚠️ Asegúrate de que `.gitignore` incluya `node_modules/`, `dist/` y `.env` antes de hacer push.

---

### Configuración de Nginx

Crear el archivo de configuración:

```bash
nano /etc/nginx/sites-available/sivit
```

```nginx
server {
    listen 80;
    server_name 169.58.156.169;  # o tu dominio

    client_max_body_size 10M;
    access_log /var/log/nginx/sivit_access.log;
    error_log /var/log/nginx/sivit_error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar y recargar:

```bash
ln -s /etc/nginx/sites-available/sivit /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

### Comandos PM2 útiles

```bash
pm2 status                      # Ver estado de todos los procesos
pm2 logs sivit-app              # Ver logs en tiempo real
pm2 logs sivit-app --lines 100  # Últimas 100 líneas de logs
pm2 restart sivit-app           # Reiniciar la app
pm2 stop sivit-app              # Detener la app
pm2 delete sivit-app            # Eliminar de PM2
pm2 monit                       # Monitor interactivo de recursos
```

---

## 📁 Estructura del proyecto

```
tacna-soc/
├── src/
│   ├── components/
│   │   ├── DashboardView.tsx         # Panel principal con métricas
│   │   ├── WebsitesView.tsx          # Gestión de sitios web
│   │   ├── WebsiteDetailView.tsx     # Detalle de un sitio
│   │   ├── VulnerabilitiesView.tsx   # Listado de CVEs
│   │   ├── VulnerabilityDetailView.tsx
│   │   ├── EvaluationsView.tsx       # Historial de escaneos
│   │   ├── ReportsView.tsx           # Reportes ejecutivos
│   │   ├── DataSourcesView.tsx       # Fuentes de datos (NVD, OWASP...)
│   │   ├── UserManagementView.tsx    # Gestión de usuarios
│   │   ├── AuditLogsView.tsx         # Logs de auditoría
│   │   ├── SettingsView.tsx          # Configuración
│   │   ├── ScanResultsModal.tsx      # Modal con resultados del escaneo
│   │   ├── NewScanModal.tsx          # Modal para iniciar escaneo
│   │   ├── NewSiteModal.tsx          # Modal para agregar sitio
│   │   ├── NewUserModal.tsx          # Modal para crear usuario
│   │   ├── AuditDetailModal.tsx      # Modal detalle de log
│   │   ├── Sidebar.tsx               # Menú de navegación lateral
│   │   └── TopHeader.tsx             # Barra superior
│   ├── App.tsx                       # Componente raíz y enrutamiento
│   ├── api.ts                        # Cliente HTTP hacia el backend
│   ├── types.ts                      # Tipos e interfaces TypeScript
│   ├── mockData.ts                   # Datos de demostración
│   ├── main.tsx                      # Punto de entrada React
│   └── index.css                     # Estilos globales
├── server.js                         # Servidor Express (backend + API)
├── vite.config.ts                    # Configuración de Vite
├── tsconfig.json                     # Configuración TypeScript
├── package.json                      # Dependencias y scripts npm
├── .env.example                      # Plantilla de variables de entorno
└── .gitignore                        # Archivos ignorados por Git
```

---

## 🔑 Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `GEMINI_API_KEY` | API Key de Google Gemini AI | ✅ Sí |
| `APP_URL` | URL pública de la aplicación | ⬜ Opcional |
| `PORT` | Puerto del servidor (default: 3000) | ⬜ Opcional |

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo con hot reload |
| `npm run build` | Compila el frontend para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Verifica tipos TypeScript |

---

## 👤 Roles de usuario

| Rol | Permisos |
|---|---|
| **Super Admin** | Acceso total: usuarios, configuración, auditoría |
| **Security Analyst** | Escaneos, vulnerabilidades, reportes |
| **Auditor** | Solo lectura: logs y reportes |
| **Operator** | Monitoreo básico de sitios |

---

## 📜 Licencia

Este proyecto fue desarrollado como parte del curso **SI885** — Universidad Privada de Tacna (UPT), Facultad de Ingeniería (FAING), Escuela Profesional de Ingeniería de Sistemas (EPIS).

---

<div align="center">
  <strong>Tacna SOC</strong> — Seguridad proactiva para infraestructuras web 🛡️
</div>
