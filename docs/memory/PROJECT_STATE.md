# Estado del Proyecto — Tacna SOC: Gestión de Vulnerabilidades
> **Fecha de Actualización**: Noviembre 2026  
> **Documentos de Referencia**: FD03 (SRS) y FD04 (SAD) — Inteligencia de Negocios, Universidad Privada de Tacna.  
> **Arquitectura Actual**: Monorepo / SPA React 19 + Express 4.x + Supabase (PostgreSQL) + Gemini AI 2.0 Flash + NVD NIST API.

---

## 1. Resumen Ejecutivo del Repositorio

El proyecto implementa una plataforma de **Centro de Operaciones de Seguridad (SOC)** especializada en el monitoreo y gestión de vulnerabilidades para la infraestructura web gubernamental e institucional de la región de Tacna, Perú.

### 1.1 Estructura Estandarizada de Directorios y Archivos

| Ubicación / Archivo | Tipo | Estado / Observaciones |
|---|---|---|
| `tacna-soc/` | Directorio (Aplicación) | **Estandarizada y aplanada**: Nombre normalizado (sin caracteres especiales ni tildes). Contiene la SPA (React 19, TypeScript, TailwindCSS v4) y el servidor Express (`server.js`). |
| `FD03_SRS_Inteligencia de Negocios.md` (.docx) | Documentación Raíz | **Especificación de Requerimientos de Software (SRS)**: Define los 4 roles (Super Admin, Security Analyst, Auditor, Operator) y los requerimientos funcionales (RF-01 a RF-17). |
| `FD04_SAD_Inteligencia de Negocios.md` (.docx) | Documentación Raíz | **Documento de Arquitectura de Software (SAD)**: Detalla la arquitectura objetivo (C4, diagrama relacional de base de datos sección 3.2.4, puertos/adaptadores y drivers OA-01 a OA-05). |
| `media/` | Directorio Raíz | Diagramas e imágenes vinculados directamente por `FD03` y `FD04` (`image1.png`, etc.). |
| `supabase_setup.sql` (en raíz) | Script SQL | **Fuente Única de Verdad para Base de Datos**: Unificado en la raíz del repositorio. Se detectó incompleto frente a `src/supabase.ts` (solo incluye `system_users`, pendiente incorporar `websites`, `evaluations` y `audit_logs`). Se eliminó el duplicado redundante en `tacna-soc/`. |
| `AGENTS.md` | Archivo Raíz | Mapa maestro del repositorio para agentes autónomos y desarrolladores. |

---

## 2. Inventario de Componentes y Vistas (`src/components/`)

A continuación se detalla la procedencia exacta de los datos para cada una de las 21 vistas y componentes registrados en `src/components/`, identificando su dependencia de **Supabase**, **Backend Express (`server.js`)** o **Mock Data (`src/mockData.ts`)**.

### 2.1 Matriz de Integración de Datos

| Componente | Archivo | Origen de Datos Primario | Mecanismo de Conexión | Fallback / Inicialización | Estado de Persistencia |
|---|---|---|---|---|---|
| **Escáner Web (PentestNet)** | `PentestScanView.tsx` | Supabase (`websites`, `evaluations`) + Express DAST | `App.tsx` conectado a `scanUrl()` y `analyzeWithAI()` | `initialWebsites`, `initialEvaluaciones` | **Flujo Principal en 3 Pasos (PentestNet)**: Hero Scan Bar con auto-registro de dominios en Supabase, 5 módulos de cobertura en vivo (Cabeceras, SSL, Fingerprint, OWASP, Red) y resultados instantáneos con snippets de remediación (Apache/Nginx). |
| **Superficie & OWASP** | `VulnerabilitiesView.tsx` | Supabase (`vulnerability_references`) / Mock | `App.tsx` conectado a `supabase.ts` con fallback seguro | `mockData.initialVulnerabilities` | **Persistente / Híbrido**: Catálogo global sincronizado. Incorpora cuadrícula interactiva superior "Qué Escaneamos / Cobertura y Taxonomía" (CVSS v3.1 con SLAs y categorías OWASP/CWE con filtrado directo en 1 clic) y modal de matriz completa. |
| **Analítica BI (6 Reportes)** | `ReportsView.tsx` | Supabase (`evaluations`, `findings`, `websites`, `audit_logs`) | Lectura agregada con barra de filtros temporal por Año, Mes y Día | Datos históricos sembrados | **6 Reportes BI Analíticos (100% Preservados)**: Tendencia histórica, matriz de severidad, ranking institucional, top CVEs/OWASP, tasa de remediación y bitácora de auditoría con granularidad por Año, Mes y Día. |
| **Ajustes & Gobernanza (Hub)** | `AdminHubView.tsx` | Supabase (`system_users`, `audit_logs`) + Mock | Agrupación centralizada con sub-pestañas internas | `initialUsers`, `initialDataSources`, `initialAuditLogs` | **Hub Unificado de Administración**: Aloja Usuarios & Roles (`UserManagementView`), Fuentes de Amenazas (`DataSourcesView`), Auditoría SHA-256 (`AuditLogsView`), Configuración / API Key (`SettingsView`) y Guía (`GuideView`). |
| **Sitios Web (Legado)** | `WebsitesView.tsx` | Supabase (`websites`) | `App.tsx` vía `getWebsitesFromDb()` de `src/supabase.ts` | `mockData.initialWebsites` | **Lectura y Creación en Supabase** (`insertWebsiteToDb`). Mantenido como vista de respaldo y detalle. |
| **Detalle de Sitio** | `WebsiteDetailView.tsx` | **Híbrido** | Datos del sitio desde Supabase (`websites`); lista de vulnerabilidades filtrada desde `vulnerabilities` de `App.tsx` | `mockData.initialVulnerabilities` | **Parcial**: El sitio proviene de la BD; las vulnerabilidades asociadas son **100% Mock Data**. |
| **Detalle de Vulnerabilidad** | `VulnerabilityDetailView.tsx` | Supabase (`vulnerability_references`) / Mock | `App.tsx` seleccionado por CVE vía `getVulnerabilitiesFromDb()` | `mockData.initialVulnerabilities` | **Lectura con fallback**: Detalle completo con vector CVSS, CWE, remediación y sitios afectados. |
| **Evaluaciones (Legado)** | `EvaluationsView.tsx` | Supabase (`evaluations`) | `App.tsx` vía `getEvaluationsFromDb()` de `src/supabase.ts` | `mockData.initialEvaluaciones` | **Lectura y Escritura en Supabase** (`insertEvaluationToDb`). |
| **Fuentes de Amenazas** | `DataSourcesView.tsx` | **Mock Data** (`src/mockData.ts`) | Integrado dentro de `AdminHubView` | `mockData.initialDataSources` | **Sin persistencia**: La sincronización es una simulación visual con timeout que emite un log de auditoría. |
| **Gestión de Usuarios** | `UserManagementView.tsx` | Supabase (`system_users`) | Integrado dentro de `AdminHubView` con llamadas a `src/supabase.ts` | `localStorage` + `mockData.initialUsers` | **CRUD Completo en Supabase** con fallback y reconciliación en `localStorage`. |
| **Logs de Auditoría** | `AuditLogsView.tsx` | Supabase (`audit_logs`) | Integrado dentro de `AdminHubView` con llamadas a `src/supabase.ts` | `mockData.initialAuditLogs` | **Lectura y Escritura en Supabase** (`insertAuditLogToDb`) con cálculo de hash SHA-256. |
| **Detalle de Log** | `AuditDetailModal.tsx` | Supabase / Mock | Recibe el objeto `AuditLogItem` seleccionado desde `AuditLogsView`. | N/A | **Solo Inspección**. |
| **Login y Autenticación** | `LoginView.tsx` | Supabase (`system_users`, `audit_logs`) | Conexión directa a Supabase con soporte de **Acceso Híbrido y Modal On-Demand** | `PUBLIC_GUEST_USER` por defecto | **Modo PentestNet Directo (Cero Bloqueo)**: La aplicación aterriza de inmediato en `PentestScanView.tsx` con sesión pública activa (`PUBLIC_GUEST_USER`). `LoginView` se abre como modal bajo demanda desde `TopHeader` ("Iniciar Sesión / Registrarse") o `Sidebar`, permitiendo login y registro con cierre de sesión directo que devuelve al modo público. |
| **Configuración** | `SettingsView.tsx` | Local + Express Backend | Integrado dentro de `AdminHubView` | Local | **Sin conexión a Supabase**. |
| **Guía de Usuario** | `GuideView.tsx` | Estático / Documentación interactiva | Integrado dentro de `AdminHubView` | N/A | **Módulo Completo de Referencia**: Incluye sección dedicada "Marco Metodológico de Clasificación de Riesgo" detallando CVSS v3.1, Tríada CIA, SLAs y categorías OWASP Top 10. |
| **Nuevo Sitio (Modal)** | `NewSiteModal.tsx` | Express Backend + Supabase | Consulta DNS a `server.js` (`GET /api/resolve-ip`) y guarda mediante `insertWebsiteToDb` | N/A | **Backend Express + Supabase**. |
| **Nuevo Escaneo (Modal)** | `NewScanModal.tsx` | Formulario UI + Backend | Envía parámetros a `server.js` (`POST /api/scan`). | N/A | **Disparador hacia Express**. |
| **Resultados de Escaneo (Modal)** | `ScanResultsModal.tsx` | Express Backend + Gemini + Supabase | Muestra análisis HTTP real y evaluación IA (`/api/ai/analyze`). Permite guardar la evaluación en Supabase (`insertEvaluationToDb`). | N/A | **Integración Total Backend + IA + Supabase**. |
| **Barra Superior** | `TopHeader.tsx` | Contexto de Sesión | Muestra usuario autenticado y controles de perfil. | `initialUsers[0]` | **Solo UI**. |
| **Barra Lateral** | `Sidebar.tsx` | Enrutamiento UI | Navegación simplificada en 3 secciones principales (`scanner`, `vulnerabilities`, `reports`) + 1 botón discreto de `admin`. | N/A | **Solo UI**. |
| **Control de Errores** | `ErrorBoundary.tsx` | Infraestructura React | Captura caídas de renderizado y permite reintentar. | N/A | **Infraestructura UI**. |

---

## 3. Estado de Persistencia y Esquema SQL Maestro (`supabase_setup.sql`)

El script maestro [supabase_setup.sql](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/supabase_setup.sql) ha sido consolidado en la raíz con un diseño **idempotente, transaccional y analítico (BI-Ready)**:
- **Estructura DDL (7 tablas)**:
  - `system_users`: RBAC con 4 roles, soporte dual (`password` plano para compatibilidad y `auth_user_id UUID` para Supabase Auth nativo).
  - `websites`: Activos monitoreados con métricas de riesgo y categorías institucionales.
  - `vulnerability_references`: Catálogo maestro de CVEs (NVD, OWASP, CWE, CVSS score y vector de ataque).
  - `evaluations`: Historial de escaneos perimetrales con columnas `date TEXT`, `evaluated_at TIMESTAMPTZ` y `created_at TIMESTAMPTZ`.
  - `findings`: Hallazgos detallados vinculados a evaluaciones y CVEs con timestamps indexados.
  - `analyses`: Evaluaciones ejecutivas generadas por Gemini AI (`analyzed_at TIMESTAMPTZ`).
  - `audit_logs`: Trazabilidad inmutable con checksum SHA-256 e índice en `event_timestamp TIMESTAMPTZ`.
- **Indexación Temporal**: Índices B-Tree en todas las columnas `TIMESTAMPTZ` para soportar agregaciones analíticas y filtros dinámicos por Año, Mes y Día sin degradar rendimiento.
- **Datos Semilla Históricos (2025 - 2026)**: Inserciones estructuradas y distribuidas a lo largo de 2025 y todos los meses de 2026 para alimentar de inmediato los dashboards y reportes analíticos.
- **Políticas RLS**: Habilitadas en las 7 tablas con políticas de desarrollo controlado para roles anónimo y autenticado.

---

## 4. Roadmap de Evolución BI, Cloud & DevOps (Requisitos 1 a 6)

Para llevar la plataforma de un prototipo local a un ecosistema empresarial de Inteligencia de Negocios y Ciberseguridad, se definen los siguientes 6 requerimientos clave:

| # | Módulo / Requisito | Descripción Técnica | Entregables Clave |
|---|---|---|---|
| **REQ-1** | **Despliegue Cloud + CI/CD Automático** | Automatización con GitHub Actions para pruebas, build y despliegue continuo en nube pública. Generación desatendida de manuales y diagramas técnicos desde el repositorio Git. | `.github/workflows/deploy.yml`, pipeline de docs automáticos. |
| **REQ-2** | **Arquitectura DWH / Data Lake** | Diseño de arquitectura de almacenamiento masivo y analítico para telemetría, CVEs y logs de seguridad en la nube (GCP BigQuery / AWS Redshift / Azure Synapse). | Diagrama C4 Container & Data Lake Architecture en Mermaid/PNG. |
| **REQ-3** | **ETL Automatizado en Nube** | Tubería periódica (ej. Cloud Functions, Airflow / Cloud Composer o cron serverless) que extrae datos operacionales desde Supabase PostgreSQL y los carga en el Data Warehouse / Data Lake. | Scripts ETL / DAGs de orquestación, esquema dimensional (Star Schema). |
| **REQ-4** | **Infraestructura como Código (IaC) + Costos** | Aprovisionamiento declarativo y reproducible de los recursos cloud mediante Terraform u OpenTofu, integrando análisis presupuestario preventivo con Infracost. | Módulos Terraform (`main.tf`, `variables.tf`), reporte de costos estimado. |
| **REQ-5** | **Diagramas de Procesos e Infraestructura** | Modelado formal de los flujos de datos periódicos (ETL) y mapa topológico de infraestructura en la nube. | Diagramas de secuencia y arquitectura en docs y `media/`. |
| **REQ-6** | **Módulo BI de 6 Reportes con Filtros de Tiempo** | Rediseño integral de `ReportsView.tsx` y `DashboardView.tsx` incorporando selectores de **Año, Mes y Día**, con mínimo 6 reportes analíticos basados en los datos históricos reales. | Componentes de filtros temporales, gráficos agregados y exportación. |

---

## 5. Decisiones Arquitectónicas Aprobadas (Evolución Cloud & BI)

- **Decisión Cloud (REQ-2, REQ-3, REQ-4)**: **Google Cloud Platform (GCP)**.
  - *Data Lake Raw*: Google Cloud Storage (GCS) en bucket multirregional para telemetría JSON y logs.
  - *Data Warehouse Analítico*: Google BigQuery (Serverless, particionado por día sobre `event_timestamp` / `evaluated_at` con clustering por severidad y entidad).
  - *ETL Serverless*: Tubería periódica en Python con Cloud Run Jobs orquestada vía Cloud Scheduler (cron).
  - *Infraestructura como Código*: Terraform (Google Cloud Provider v5+) con análisis preventivo de costos mediante Infracost.
- **Decisión Módulo BI (REQ-6)**: **Suite Ejecutiva y Técnica de 6 Reportes (Opción 2-A)**.
  - Implementación con filtros reactivos por **Año (2025, 2026, Todos)**, **Mes (01 - 12)**, **Día (01 - 31)** y **Sector Institucional**.
  - Exportación en vivo a formato CSV (Excel) y PDF oficial.

---

## 6. Estado de Avance por Fases

- **Fase 1 (COMPLETADA 100% — REQ-6)**:
  - [x] Nuevos tipos en `src/types.ts` (`FindingItem`, `AnalysisItem`, `OWASPCategory`, timestamps `TIMESTAMPTZ`).
  - [x] Conexión de `VulnerabilitiesView`, `VulnerabilityDetailView` y `WebsiteDetailView` a `supabase.ts` con fallback resiliente.
  - [x] Rediseño completo de `ReportsView.tsx` con los 6 reportes analíticos y barra de filtros multidimensionales de tiempo (Año, Mes, Día).
  - [x] Verificación de compilación limpia con TypeScript (`npm run lint`).
- **Fase 2 (COMPLETADA 100% — REQ-2, REQ-3, REQ-4)**:
  - [x] **Data Warehouse & Esquema Estrella**: DDL maestro en `etl/sql/dwh_star_schema.sql` y 5 esquemas JSON en `etl/sql/schemas/` (`dim_time`, `dim_websites`, `dim_vulnerabilities`, `fact_evaluations`, `fact_findings`) con particionamiento diario y clustering por severidad y entidad.
  - [x] **Pipeline ETL Automatizado en Python**: Implementado en `etl/main.py` con dockerización (`etl/Dockerfile`, `etl/requirements.txt`, `etl/.env.example`) cubriendo extracción incremental de 7 tablas de Supabase, transformación dimensional y carga en dos capas (GCS Lake Raw + BigQuery DWH).
  - [x] **Modo Demo Local Verificado**: Ejecución local con `python etl/main.py --dry-run` probada exitosamente, generando datasets en `etl/output/raw/` y `etl/output/star_schema/` (CSV + JSON).
  - [x] **Infraestructura como Código (IaC)**: Módulos de Terraform en `infra/terraform/` (`main.tf`, `variables.tf`, `cloud_run.tf`, `storage.tf`, `bigquery.tf`, `iam.tf`, `outputs.tf`, `terraform.tfvars.example`).
  - [x] **Análisis y Reporte de Costos Infracost**: Configuración `infra/infracost/infracost.yml`, archivo de desglose `infra/infracost/cost-report.json` y resumen ejecutivo en `infra/infracost/COST_SUMMARY.md` demostrando elegibilidad para Always Free Tier ($0.00/mes en `us-central1` vs ~$11.50/mes en `southamerica-west1`).
- **Fase 3 (COMPLETADA 100% — REQ-1, REQ-5)**:
  - [x] **Contenedor Unificado Multi-stage**: `tacna-soc/Dockerfile` (Node 20 Alpine, multi-stage builder + runner con usuario no root) y `tacna-soc/server.js` (soporte de `process.env.PORT || 8080`, probe `/api/health`, servicio de estáticos `dist/` y fallback SPA a `index.html`).
  - [x] **Diagramas Como Código (Mermaid)**: Creados en `docs/diagrams/` (`01-arquitectura-dwh-datalake.mmd`, `02-proceso-automatizado-etl.mmd`, `03-infraestructura-cloud-iac.mmd`).
  - [x] **Generador Automatizado de Documentación**: Script en ESM `scripts/generate-manuals.mjs` que compila los diagramas y ensambla los manuales técnicos.
  - [x] **Manuales Técnicos Oficiales**: Generados en `docs/manuals/`:
    - `docs/manuals/MANUAL_TECNICO_ARQUITECTURA_DWH.md`
    - `docs/manuals/MANUAL_INFRAESTRUCTURA_Y_COSTOS.md`
    - `docs/manuals/MANUAL_OPERACION_Y_DESPLIEGUE.md`
  - [x] **Workflows de GitHub Actions**: Implementados en `.github/workflows/`:
    - `ci-cd-deploy.yml`: Lint, build, dockerización y despliegue condicional en Cloud Run con salida limpia ante ausencia de secretos.
    - `generate-docs.yml`: Compilación desatendida de diagramas Mermaid (`mmdc` a `.svg`/`.png`), ejecución del generador de manuales, subida de artefactos y auto-commit.
    - `etl-pipeline.yml`: Ejecución programada de ETL (cron diario o manual), fallback a `--dry-run` y publicación de datasets generados como artefactos de ejecución.
  - [x] **Actualización de Especificación SRS y SAD**: Incorporada Sección 9 en `FD03_SRS_Inteligencia de Negocios.md` (RF-18 a RF-23) y Sección 5 en `FD04_SAD_Inteligencia de Negocios.md`.
  - [x] **Actualización del README Maestro**: Unificado con tabla de los 6 requisitos, badges, manuales técnicos y árbol de archivos.

---

## 7. Guía Maestra para la Demostración y Defensa de Requisitos (REQ-1 a REQ-6)

Esta guía provee las instrucciones exactas, comandos y evidencias para demostrar el cumplimiento riguroso de cada uno de los 6 requisitos ante el docente o evaluador:

### 🎯 Demostración REQ-1: Despliegue Cloud + CI/CD + Documentación Automatizada
- **Qué evaluar**: Contenedor listo para Cloud Run y flujos de automatización en GitHub Actions.
- **Comandos de demostración**:
  ```bash
  # 1. Compilación de producción y verificación de tipos
  npm --prefix tacna-soc run lint
  npm --prefix tacna-soc run build

  # 2. Verificar estructura del Dockerfile multi-stage
  cat tacna-soc/Dockerfile

  # 3. Inspeccionar workflows CI/CD
  ls .github/workflows/
  ```
- **Evidencia clave**:
  - `tacna-soc/Dockerfile` incluye multi-stage builder (`node:20-alpine`) y runner seguro con health check.
  - `.github/workflows/ci-cd-deploy.yml` valida tipado, compila y dockeriza la aplicación.
  - `.github/workflows/generate-docs.yml` automatiza la compilación de diagramas Mermaid y manuales técnicos.

### 🎯 Demostración REQ-2: Arquitectura DWH / Data Lake en Google Cloud
- **Qué evaluar**: Almacenamiento desacoplado en dos capas (Data Lake GCS + BigQuery DWH con Esquema Estrella).
- **Comandos de demostración**:
  ```bash
  # 1. Ver el DDL y particionamiento del Esquema Estrella
  cat etl/sql/dwh_star_schema.sql

  # 2. Inspeccionar esquemas JSON para BigQuery
  ls etl/sql/schemas/
  ```
- **Evidencia clave**:
  - `fact_evaluations` y `fact_findings` particionadas por día (`_PARTITIONDATE`) y clusterizadas por severidad y entidad.
  - Dimensiones conformadas: `dim_websites`, `dim_vulnerabilities` y `dim_time` (grano diario).
  - Manual de arquitectura DWH: `docs/manuals/MANUAL_TECNICO_ARQUITECTURA_DWH.md`.

### 🎯 Demostración REQ-3: Pipeline ETL Automatizado en Nube
- **Qué evaluar**: Extracción incremental de 7 tablas de Supabase, transformación y carga dual con modo demo local.
- **Comandos de demostración**:
  ```bash
  # Ejecutar el pipeline ETL en vivo en modo demostración local
  python etl/main.py --dry-run
  ```
- **Evidencia clave**:
  - Salida de logs estructurados en consola mostrando las 3 fases (Extracción -> Transformación dimensional -> Carga).
  - Inspeccionar los archivos generados en `etl/output/star_schema/` (`dim_time.csv`, `dim_websites.csv`, `dim_vulnerabilities.csv`, `fact_evaluations.csv`, `fact_findings.csv`).
  - Inspeccionar los snapshots crudos inmutables en `etl/output/raw/`.

### 🎯 Demostración REQ-4: Infraestructura como Código (IaC) con Terraform + Infracost
- **Qué evaluar**: Declaración reproducible de infraestructura y análisis de costos operativos.
- **Comandos de demostración**:
  ```bash
  cd infra/terraform
  terraform init -backend=false
  terraform validate
  cat variables.tf
  ```
- **Evidencia clave**:
  - Módulos de Terraform cubren Cloud Run, Cloud Scheduler, Cloud Storage, BigQuery DWH y cuentas de servicio IAM con principio de menor privilegio.
  - Reporte de Infracost en `infra/infracost/COST_SUMMARY.md`: Costo mensual de **$0.00 / mes** en `us-central1` gracias al Always Free Tier de GCP.
  - Alternativa de baja latencia documentada en `southamerica-west1` ($11.50/mes).

### 🎯 Demostración REQ-5: Diagramas de Procesos e Infraestructura Como Código
- **Qué evaluar**: Diagramas técnicos de procesos ETL, arquitectura DWH e infraestructura, generados desde código.
- **Comandos de demostración**:
  ```bash
  # 1. Regenerar los 3 manuales técnicos con un comando
  node scripts/generate-manuals.mjs

  # 2. Inspeccionar los diagramas Mermaid fuente (.mmd)
  ls docs/diagrams/
  ```
- **Evidencia clave**:
  - `docs/diagrams/01-arquitectura-dwh-datalake.mmd`: Arquitectura DWH y Data Lake C4.
  - `docs/diagrams/02-proceso-automatizado-etl.mmd`: Diagrama de secuencia del ETL periódico.
  - `docs/diagrams/03-infraestructura-cloud-iac.mmd`: Diagrama de infraestructura en GCP aprovisionada con Terraform.
  - Manuales técnicos compilados en `docs/manuals/`.

### 🎯 Demostración REQ-6: Módulo BI de 6 Reportes con Filtros de Tiempo
- **Qué evaluar**: Interfaz de Business Intelligence con barra de filtrado temporal por Año, Mes y Día, conectada a los datos reales.
- **Comandos de demostración**:
  ```bash
  cd tacna-soc
  npm run dev
  # Abrir en navegador http://localhost:3000 y navegar a la pestaña "Reportes"
  ```
- **Evidencia clave**:
  - Barra de filtros interactiva con selectores: **Año** (Todos, 2025, 2026), **Mes** (Enero a Diciembre), **Día** (Todos o fecha específica).
  - Los 6 reportes analíticos recalculan KPIs reactivamente al cambiar el filtro temporal:
    1. *Tendencia Histórica de Postura de Seguridad* (Scores y volumen de escaneos).
    2. *Matriz de Severidad de Hallazgos* (Crítica, Alta, Media, Baja).
    3. *Ranking de Exposición por Entidad Regional y Categoría* (Gobierno, Salud, Educación, Finanzas).
    4. *Top Vulnerabilidades Recurrentes y OWASP Top 10*.
    5. *Eficacia de Mitigación y Estado de Remediación* (Abiertas vs Mitigadas / MTTR).
    6. *Bitácora Analítica de Auditoría y Trazabilidad SOC* (con hashes SHA-256).
  - Botón de exportación a CSV con datos filtrados y registro en `audit_logs`.

---

## 7. Correcciones de Nivel Producción Real (Noviembre 2026)

Se consolidaron 4 mejoras fundamentales requeridas para despliegue y auditoría de nivel productivo:

1. **`LoginView.tsx` Limpio para Producción**:
   - Eliminación total de la sección de cuentas preconfiguradas ("Cuentas Demo") y la caja de "Modo Evaluador".
   - Mantiene exclusivamente el formulario oficial de autenticación y registro de nuevos analistas contra la tabla `system_users` de Supabase con hashing SHA-256 en `audit_logs`.
   - Opción sobria y profesional de "Continuar al Escáner Público" sin etiquetas de demo.

2. **Restauración del Dashboard con Gráficos y Navegación en 4 Vistas**:
   - Reincorporación de `DashboardView.tsx` en `Sidebar.tsx` estructurando la navegación en 4 vistas principales:
     1) `dashboard`: **Dashboard (Gráficos & KPIs)** — Donut de severidad CVSS v3.1, tendencia de 6 meses, ranking top 5 y distribución OWASP.
     2) `scanner`: **Escáner Web** (Pentest Live DAST).
     3) `vulnerabilities`: **Taxonomía & OWASP** (Catálogo de CVEs y criterios).
     4) `reports`: **Reportes BI (6 Reportes)** con histogramas y gráficos visuales dedicados.
     + Icono discreto inferior de **Ajustes & Admin (Hub)**.

3. **Explicación Didáctica y Transparente de Hallazgos**:
   - Cada vulnerabilidad detectada en `PentestScanView.tsx`, `api.ts`, `server.js` y `vite.config.ts` presenta:
     - **Clasificación**: Categoría OWASP Top 10, CWE y puntuación CVSS.
     - **Evidencia Real**: Cabecera HTTP, cookie o respuesta exacta detectada en la web.
     - **¿Qué significa esto?**: Explicación clara para usuarios no técnicos sobre el impacto real del fallo.
     - **Guía de Remediación**: Reglas listas para copiar en Apache (`.htaccess`) y Nginx (`nginx.conf`).

4. **Categorías Universales con Autodetección Inteligente**:
   - Expansión del modelo en `types.ts`, `PentestScanView.tsx`, `ReportsView.tsx`, `NewSiteModal.tsx` y `supabase_setup.sql` a 9 sectores:
     `Gobierno`, `Educación`, `Salud`, `Finanzas`, `Tecnología / SaaS`, `E-Commerce / Retail`, `Corporativo / Empresa`, `Medios / Blog`, `General / Otro`.
   - Selector con opción `✨ Autodetectar (IA / Dominio)` que deduce el sector en tiempo real según el TLD y nombre de dominio.


