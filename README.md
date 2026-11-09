<div align="center">

# 🛡️ Tacna SOC — Gestión de Vulnerabilidades e Inteligencia de Negocios

**Plataforma Integral de Centro de Operaciones de Seguridad (SOC) y Business Intelligence para el monitoreo, remediación y analítica avanzada de vulnerabilidades web en la región Tacna, Perú.**

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-Cloud_Run_|_BigQuery_|_GCS-4285F4?style=for-the-badge&logo=googlecloud)
![Terraform](https://img.shields.io/badge/Terraform-1.11-844FBA?style=for-the-badge&logo=terraform)
![Infracost](https://img.shields.io/badge/Infracost-$0.00/mo_Free_Tier-00D084?style=for-the-badge&logo=infracost)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD_Automated-2088FF?style=for-the-badge&logo=githubactions)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_OLTP-3ECF8E?style=for-the-badge&logo=supabase)
![Python](https://img.shields.io/badge/Python-3.12_ETL-3776AB?style=for-the-badge&logo=python)

</div>

---

## 📖 Visión General del Proyecto

**Tacna SOC** es una solución enterprise de ciberseguridad e inteligencia de negocios diseñada bajo los estándares internacionales (OWASP Top 10, NIST/NVD, MITRE ATT&CK, CVSS v3.1). Combina:
1. **Capa Operacional (OLTP)**: Evaluación activa de cabeceras HTTP, resolución DNS, detección de CVEs y análisis heurístico/IA con Google Gemini 2.0 Flash persistido en Supabase PostgreSQL.
2. **Capa Analítica (OLAP / DWH)**: Extracción incremental periódica hacia un Data Lake inmutable en **Google Cloud Storage (GCS)** y carga a un Data Warehouse en **Google Cloud BigQuery** modelado bajo un Esquema Estrella Canónico (Kimball).
3. **Módulo de Business Intelligence**: Suite interactiva de 6 reportes analíticos con filtrado multidimensional por **Año, Mes y Día**.
4. **DevOps & Cloud Computing**: Despliegue contenerizado en **Google Cloud Run**, Infraestructura como Código (IaC) con **Terraform**, estimación automatizada de costos con **Infracost** y flujos CI/CD en **GitHub Actions**.

---

## 🚀 Requisitos de Evolución BI, Cloud & DevOps (Completados 100%)

| # | Requisito Arquitectónico | Estado | Componentes y Entregables |
|:---:|---|:---:|---|
| **REQ-1** | **Despliegue Cloud + CI/CD + Docs** | ✅ 100% | Multi-stage Docker unificado (`tacna-soc/Dockerfile`), Cloud Run v2, Workflows GitHub Actions (`ci-cd-deploy.yml`, `generate-docs.yml`). |
| **REQ-2** | **Arquitectura DWH / Data Lake en Nube** | ✅ 100% | Data Lake en GCS (`raw/`), BigQuery DWH con Esquema Estrella Canónico (`fact_evaluations`, `fact_findings`, `dim_websites`, `dim_vulnerabilities`, `dim_time`). |
| **REQ-3** | **ETL Automatizado Incremental** | ✅ 100% | Pipeline Python 3.12 (`etl/main.py`), extracción por marca de agua `TIMESTAMPTZ`, carga dual GCS/BigQuery y modo demo local `--dry-run`. |
| **REQ-4** | **Infraestructura como Código (IaC) + Costos** | ✅ 100% | Terraform modular en `infra/terraform/` (`us-central1`), reporte Infracost (`$0.00/mes` Always Free Tier) y alternativa regional (`southamerica-west1`). |
| **REQ-5** | **Diagramas de Procesos e Infraestructura** | ✅ 100% | Diagramas Mermaid `.mmd` en `docs/diagrams/`, script compilador `scripts/generate-manuals.mjs` y 3 manuales técnicos en `docs/manuals/`. |
| **REQ-6** | **Módulo BI de 6 Reportes con Filtros Temporales** | ✅ 100% | Suite analítica en `ReportsView.tsx` con filtros por Año, Mes y Día, conectada a Supabase PostgreSQL y métricas agregadas del DWH. |

---

## 🏛️ Arquitectura Global del Sistema

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               1. CAPA OPERACIONAL (OLTP)                               │
│                                                                                        │
│   ┌─────────────────────────────┐           ┌──────────────────────────────────────┐   │
│   │   Frontend SPA (React 19)   │◄─────────►│        Backend API (Express)         │   │
│   │   TypeScript · Tailwind v4  │   HTTP    │   Escaneo HTTP · Gemini AI · NVD     │   │
│   └──────────────┬──────────────┘           └──────────────────┬───────────────────┘   │
│                  │                                             │                       │
│                  └──────────────────────┬──────────────────────┘                       │
│                                         │ PostgreSQL / REST                            │
│                             ┌───────────▼───────────┐                                  │
│                             │  Supabase PostgreSQL  │                                  │
│                             │   (7 Tablas OLTP)     │                                  │
│                             └───────────┬───────────┘                                  │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │ Extracción Incremental (Watermark TIMESTAMPTZ)
┌─────────────────────────────────────────┼──────────────────────────────────────────────┐
│                               2. CAPA ANALÍTICA (ETL & DWH)                            │
│                                                                                        │
│                             ┌───────────▼───────────┐                                  │
│                             │  Pipeline ETL Python  │                                  │
│                             │ (Cloud Run / Cron GHA)│                                  │
│                             └─────┬───────────────┬─┘                                  │
│               Carga Raw (Parquet) │               │ Carga Dimensional (Kimball)        │
│                                   ▼               ▼                                    │
│                    ┌────────────────────┐   ┌───────────────────────────────┐          │
│                    │ Google Cloud Store │   │     Google Cloud BigQuery     │          │
│                    │    (Data Lake)     │   │        (Data Warehouse)       │          │
│                    │  gs://tacna-soc/   │   │  fact_evaluations, fact_...   │          │
│                    └────────────────────┘   └───────────────┬───────────────┘          │
└─────────────────────────────────────────────────────────────┼──────────────────────────┘
                                                              │ Consultas Analíticas
┌─────────────────────────────────────────────────────────────┼──────────────────────────┐
│                               3. CAPA DE PRESENTACIÓN & BI  │                          │
│                                                             ▼                          │
│                             ┌───────────────────────────────────────────────┐          │
│                             │   Módulo Business Intelligence (ReportsView)  │          │
│                             │   Filtros Dinámicos: [Año] · [Mes] · [Día]    │          │
│                             │   6 Reportes Ejecutivos, Técnicos y Auditoría │          │
│                             └───────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentación y Manuales Técnicos

Los manuales y diagramas son generados automáticamente a partir del código fuente:

| Documento | Ubicación | Descripción |
|---|---|---|
| 📐 **Manual Técnico de Arquitectura DWH** | [`docs/manuals/MANUAL_TECNICO_ARQUITECTURA_DWH.md`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/manuals/MANUAL_TECNICO_ARQUITECTURA_DWH.md) | Modelo Estrella Canónico de BigQuery, particionamiento, clustering y Data Lake GCS. |
| 💰 **Manual de Infraestructura y Costos** | [`docs/manuals/MANUAL_INFRAESTRUCTURA_Y_COSTOS.md`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/manuals/MANUAL_INFRAESTRUCTURA_Y_COSTOS.md) | Módulos de Terraform, desglose de Infracost ($0.00/mes Free Tier) y arquitectura GCP. |
| 🚀 **Manual de Operación y Despliegue** | [`docs/manuals/MANUAL_OPERACION_Y_DESPLIEGUE.md`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/manuals/MANUAL_OPERACION_Y_DESPLIEGUE.md) | Guía de despliegue en Cloud Run, ejecución de ETL local/cloud y CI/CD en GitHub Actions. |
| 🧠 **Memoria Viva del Proyecto** | [`docs/memory/PROJECT_STATE.md`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/memory/PROJECT_STATE.md) | Estado detallado de integración de componentes, historial de decisiones y guía de defensa. |
| 📋 **Especificación de Requerimientos (SRS)** | [`FD03_SRS_Inteligencia de Negocios.md`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/FD03_SRS_Inteligencia%20de%20Negocios.md) | Requerimientos funcionales (RF-01 a RF-23) y no funcionales. |
| 🏗️ **Documento de Arquitectura (SAD)** | [`FD04_SAD_Inteligencia de Negocios.md`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/FD04_SAD_Inteligencia%20de%20Negocios.md) | Arquitectura C4, escenarios de calidad y diseño analítico en GCP. |

### Diagramas Como Código (Mermaid)
- [`docs/diagrams/01-arquitectura-dwh-datalake.mmd`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/diagrams/01-arquitectura-dwh-datalake.mmd): Arquitectura DWH y Data Lake en Google Cloud.
- [`docs/diagrams/02-proceso-automatizado-etl.mmd`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/diagrams/02-proceso-automatizado-etl.mmd): Flujo del pipeline ETL periódico con extracción incremental.
- [`docs/diagrams/03-infraestructura-cloud-iac.mmd`](file:///c:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/diagrams/03-infraestructura-cloud-iac.mmd): Infraestructura cloud aprovisionada con Terraform y CI/CD.

---

## 📊 Módulo de Business Intelligence (6 Reportes Analíticos)

Accediendo a la vista **Reportes** (`ReportsView.tsx`), el usuario dispone de una **Barra de Filtrado Global** (Año, Mes, Día) y los siguientes 6 reportes:

1. 📈 **Reporte 1: Tendencia Histórica de Postura de Seguridad**: Evolución mensual del promedio del score de seguridad (0 a 100) y volumen total de evaluaciones ejecutadas.
2. 🎯 **Reporte 2: Matriz de Severidad de Hallazgos**: Distribución porcentual y volumétrica de defectos detectados (Crítica, Alta, Media, Baja).
3. 🏛️ **Reporte 3: Ranking de Exposición por Entidad y Categoría**: Comparativa institucional entre los sectores Gobierno Regional, Salud, Educación y Finanzas de Tacna.
4. 🐞 **Reporte 4: Top Vulnerabilidades Recurrentes y OWASP Top 10**: Frecuencia de CVEs detectados clasificados bajo los estándares OWASP (Inyección, Fallas Criptográficas, CSP ausente, etc.).
5. 🛡️ **Reporte 5: Eficacia de Mitigación y Estado de Remediación**: Tasa porcentual de resolución, conteo de hallazgos abiertos vs mitigados y estimación de MTTR (Mean Time to Remediate).
6. 📜 **Reporte 6: Bitácora Analítica de Auditoría SOC**: Línea de tiempo inmutable con trazabilidad de eventos, usuarios intervinientes y verificación de integridad criptográfica SHA-256.

---

## 🛠️ Ejecución Local y Pruebas Rápidas

### 1. Aplicación Web (Frontend + Backend)

```bash
cd tacna-soc

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
# Acceder en: http://localhost:3000

# Validar tipado y compilación
npm run lint
npm run build

# Iniciar servidor unificado de producción
npm start
```

### 2. Demostración del Pipeline ETL (Modo Demo Local)

El pipeline incluye un modo autónomo `--dry-run` que extrae y transforma datos reales hacia el Esquema Estrella sin requerir credenciales de Google Cloud:

```bash
# Desde la raíz del proyecto
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r etl/requirements.txt

# Ejecutar ETL en modo demostración local
python etl/main.py --dry-run
```
> Los datasets generados (`dim_websites.json`, `dim_vulnerabilities.json`, `dim_time.json`, `fact_evaluations.json`, `fact_findings.json`) se guardan automáticamente en `etl/output/`.

### 3. Regeneración de Manuales Técnicos

```bash
node scripts/generate-manuals.mjs
```

### 4. Validación de Infraestructura como Código (Terraform)

```bash
cd infra/terraform
terraform init
terraform validate
terraform plan -var="project_id=tacna-soc-demo"
```

---

## ☁️ Despliegue en Google Cloud Run

### Con Docker local:

```bash
cd tacna-soc

# Construir imagen multi-stage
docker build -t gcr.io/TU_PROYECTO_GCP/tacna-soc-app:latest .

# Ejecutar contenedor localmente
docker run -p 8080:8080 -e PORT=8080 gcr.io/TU_PROYECTO_GCP/tacna-soc-app:latest
```

### Automatizado vía GitHub Actions:
Al configurar los siguientes secretos en el repositorio GitHub (`Settings > Secrets and variables > Actions`), el workflow `.github/workflows/ci-cd-deploy.yml` despliega automáticamente cada push a `main`:
- `GCP_PROJECT_ID`: ID del proyecto en Google Cloud.
- `GCP_SA_KEY`: Clave JSON de la Service Account con permisos de Cloud Run y Artifact Registry.

---

## 📂 Estructura General del Repositorio

```
.
├── .agents/                          # Reglas permanentes y habilidades autónomas
│   ├── rules/                        # Protocolo Cero Suposiciones, arquitectura, código
│   └── skills/                       # new-requirement, tacna-soc-audit, supabase-migration
├── .github/
│   └── workflows/
│       ├── ci-cd-deploy.yml          # Build, lint, dockerize y deploy en Cloud Run
│       ├── generate-docs.yml         # Compilación Mermaid y regeneración de manuales
│       └── etl-pipeline.yml          # Pipeline ETL periódico y programado
├── docs/
│   ├── diagrams/                     # Diagramas como código Mermaid (.mmd)
│   ├── manuals/                      # Manuales técnicos autogenerados (.md)
│   └── memory/                       # PROJECT_STATE.md (Memoria viva)
├── etl/                              # Pipeline de datos analíticos en Python
│   ├── main.py                       # Extractor incremental, transformador y cargador dual
│   ├── requirements.txt              # Dependencias (pandas, google-cloud-*, etc.)
│   ├── Dockerfile                    # Contenedor para ejecución en Cloud Run / Jobs
│   └── .env.example
├── infra/                            # Infraestructura como Código y FinOps
│   ├── terraform/                    # Módulos Cloud Run, BigQuery, GCS, IAM, Scheduler
│   └── infracost/                    # Reporte de costos ($0.00/mes Free Tier)
├── scripts/
│   └── generate-manuals.mjs          # Ensamblador de documentación técnica
├── tacna-soc/                        # Código fuente de la aplicación
│   ├── src/
│   │   ├── components/               # Vistas React 19 (ReportsView, DashboardView...)
│   │   ├── api.ts                    # Cliente HTTP para API Express
│   │   ├── supabase.ts               # Consultas tipadas a Supabase PostgreSQL
│   │   ├── types.ts                  # Tipos e interfaces globales del sistema
│   │   └── App.tsx                   # Enrutamiento y contenedor de estado
│   ├── server.js                     # Servidor Express unificado (API + SPA fallback)
│   ├── Dockerfile                    # Docker multi-stage (Node 20 Alpine)
│   └── package.json
├── FD03_SRS_Inteligencia de Negocios.md
├── FD04_SAD_Inteligencia de Negocios.md
├── supabase_setup.sql                # DDL maestro con 7 tablas, RLS y seed histórico
├── AGENTS.md                         # Guía maestra y mapa de navegación para IA
└── README.md                         # Este documento
```

---

## 👥 Equipo de Desarrollo y Curso

Proyecto desarrollado para el curso **SI885 — Inteligencia de Negocios**:
- **Docente**: Ing. Patrick Cuadros Quiroga
- **Integrantes**:
  - Flores Navarro, Eduardo Gino (2023076793)
  - Halanocca Rojas, Usher Damiron (2023076795)
  - Steven Shizuka Baldeon (2002023628)
- **Institución**: Universidad Privada de Tacna (UPT) · Facultad de Ingeniería · Escuela Profesional de Ingeniería de Sistemas

---

<div align="center">
  <strong>Tacna SOC</strong> — Ciberseguridad Proactiva e Inteligencia Analítica 🛡️
</div>
