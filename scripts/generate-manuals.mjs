#!/usr/bin/env node
/**
 * ==============================================================================
 * GENERADOR AUTOMATIZADO DE MANUALES TÉCNICOS Y ARTEFACTOS DE DOCUMENTACIÓN
 * Proyecto: Tacna SOC - Inteligencia de Negocios y Ciberseguridad
 * ==============================================================================
 * Este script compila la arquitectura, diagramas Mermaid, diccionario de datos
 * del Esquema Estrella y el análisis de costos en manuales técnicos formales
 * ubicados en docs/manuals/.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DIAGRAMS_DIR = path.join(ROOT_DIR, 'docs', 'diagrams');
const MANUALS_DIR = path.join(ROOT_DIR, 'docs', 'manuals');
const ETL_SQL_DIR = path.join(ROOT_DIR, 'etl', 'sql');
const INFRA_DIR = path.join(ROOT_DIR, 'infra');

// Asegurar existencia del directorio de manuales
if (!fs.existsSync(MANUALS_DIR)) {
  fs.mkdirSync(MANUALS_DIR, { recursive: true });
}

// Helper para leer archivo de forma segura
function readSafe(filePath, fallback = '') {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return fallback;
}

// Cargar diagramas Mermaid (.mmd)
const dwhDiagram = readSafe(path.join(DIAGRAMS_DIR, '01-arquitectura-dwh-datalake.mmd'));
const etlDiagram = readSafe(path.join(DIAGRAMS_DIR, '02-proceso-automatizado-etl.mmd'));
const infraDiagram = readSafe(path.join(DIAGRAMS_DIR, '03-infraestructura-cloud-iac.mmd'));
const dwhSql = readSafe(path.join(ETL_SQL_DIR, 'dwh_star_schema.sql'));
const costReport = readSafe(path.join(INFRA_DIR, 'COST_REPORT.md'));

console.log('🔄 Generando Manuales Técnicos de Tacna SOC...');

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL 1: ARQUITECTURA DWH Y DATA LAKE
// ─────────────────────────────────────────────────────────────────────────────
const manualDwh = `# 🏛️ Manual Técnico de Arquitectura Data Warehouse & Data Lake
**Sistema**: Tacna SOC — Centro de Operaciones de Seguridad e Inteligencia de Negocios  
**Curso**: Inteligencia de Negocios 2026 — Universidad Privada de Tacna  
**Generado Automáticamente**: ${new Date().toISOString().split('T')[0]}

---

## 1. Resumen Ejecutivo de la Arquitectura
La arquitectura de datos de Tacna SOC implementa un patrón **Modern Data Stack** desacoplado en la nube de Google Cloud Platform (GCP). Su objetivo es transformar la telemetría operativa transaccional (OLTP) recolectada en tiempo real sobre los portales gubernamentales, de salud, educación y finanzas de la Región Tacna en un repositorio analítico multidimensional optimizado para la toma de decisiones estratégicas.

### Capas Principales del Ecosistema:
1. **Capa Transaccional (OLTP - Supabase PostgreSQL)**: Almacena las entidades operativas en 7 tablas relacionales con auditoría criptográfica SHA-256 e índices temporales \`TIMESTAMPTZ\`.
2. **Capa Data Lake Raw (Google Cloud Storage)**: Repositorio inmutable multirregional (\`gs://tacna-soc-raw-data-lake\`) donde se persisten extracciones históricas en formato crudo (JSON / Parquet).
3. **Capa Data Warehouse Analítico (Google BigQuery)**: Almacén serverless que implementa un **Esquema Estrella Canónico (Star Schema)** con particionamiento por día y clustering multidimensional.
4. **Capa de Inteligencia de Negocios (BI Web Suite)**: Módulo de 6 reportes analíticos dinámicos con filtros interactivos de **Año, Mes y Día**.

---

## 2. Diagrama de Arquitectura de Datos (C4 Container & Data Flow)

\`\`\`mermaid
${dwhDiagram}
\`\`\`

---

## 3. Diccionario de Datos del Esquema Estrella (BigQuery)

El Data Warehouse reside en el dataset \`tacna_soc_dwh\` y se compone de 3 tablas dimensionales y 2 tablas de hechos:

### 3.1. Tablas Dimensionales (\`dim_*\`)

#### A. \`dim_time\` (Dimensión de Tiempo Canónica)
Permite la navegación jerárquica temporal sin requerir cómputo en tiempo de ejecución:
- **\`date_key\`** (INTEGER, PK): Clave subrogada numérica en formato \`YYYYMMDD\` (ej. \`20260215\`).
- **\`full_date\`** (DATE): Fecha calendario estándar.
- **\`year\`** (INTEGER): Año calendario (2025, 2026...).
- **\`quarter\`** (INTEGER): Trimestre (1 - 4).
- **\`month\`** (INTEGER): Número de mes (1 - 12).
- **\`month_name\`** (STRING): Nombre completo en español (Enero, Febrero...).
- **\`day_of_month\`** (INTEGER): Día del mes (1 - 31).
- **\`day_of_week\`** (INTEGER): Día de la semana (1 = Lunes, 7 = Domingo).
- **\`day_name\`** (STRING): Nombre del día (Lunes, Martes...).
- **\`is_weekend\`** (BOOLEAN): Indicador de fin de semana.
- **\`semester\`** (INTEGER): Semestre académico/financiero (1 o 2).

#### B. \`dim_websites\` (Dimensión de Activos Digitales Regionales)
- **\`website_key\`** (STRING, PK): Hash MD5 o UUID del activo.
- **\`natural_id\`** (STRING): Identificador operacional en Supabase.
- **\`domain\`** (STRING): Nombre de dominio analizado (ej. \`regiontacna.gob.pe\`).
- **\`name\`** (STRING): Nombre descriptivo de la entidad.
- **\`institution_name\`** (STRING): Razón social de la institución.
- **\`sector\`** (STRING): Clasificación sectorial (Gobierno, Salud, Educación, Finanzas, Comercio).
- **\`ip_address\`** (STRING): Dirección IP pública resuelta vía DNS.
- **\`environment\`** (STRING): Entorno (\`Producción\`, \`Desarrollo\`, \`Staging\`).
- **\`status\`** (STRING): Estado del activo (\`Activo\`, \`Inactivo\`, \`Bajo Análisis\`).

#### C. \`dim_vulnerabilities\` (Dimensión de Catálogo de Vulnerabilidades)
- **\`vulnerability_key\`** (STRING, PK): Clave dimensional subrogada.
- **\`natural_id\`** (STRING): Código normalizado (ej. \`CWE-693\`, \`CVE-2024-21413\`).
- **\`name\`** (STRING): Nombre técnico de la debilidad.
- **\`cwe_code\`** (STRING): Código del estándar MITRE CWE.
- **\`owasp_category\`** (STRING): Mapeo al estándar internacional OWASP Top 10 (2021).
- **\`default_severity\`** (STRING): Severidad estándar (CRITICAL, HIGH, MEDIUM, LOW).
- **\`cvss_base_score\`** (NUMERIC): Puntuación base según Common Vulnerability Scoring System v3.1.
- **\`cvss_range\`** (STRING): Rango cualitativo CVSS (\`Crítico [9.0-10.0]\`, \`Alto [7.0-8.9]\`...).

---

### 3.2. Tablas de Hechos (\`fact_*\`)

#### A. \`fact_evaluations\` (Hechos de Escaneos de Seguridad)
- **Particionamiento**: Diario sobre la columna \`evaluation_date\`.
- **Clustering**: \`sector\`, \`security_grade\`.
- **Métricas Clave**:
  - \`security_score\` (NUMERIC, 0-100): Calificación general de postura.
  - \`response_time_ms\` (INTEGER): Latencia del servicio en milisegundos.
  - \`critical_count\`, \`high_count\`, \`medium_count\`, \`low_count\`: Contadores de severidad.
  - \`total_findings\`: Conteo total de fallas detectadas.

#### B. \`fact_findings\` (Hechos de Vulnerabilidades Detectadas a Nivel Atómico)
- **Particionamiento**: Diario sobre la columna \`finding_date\`.
- **Clustering**: \`severity\`, \`owasp_category\`.
- **Métricas Clave**:
  - \`cvss_score\`: Puntuación CVSS del hallazgo específico.
  - \`remediation_sla_days\`: Plazo objetivo de resolución según norma (Crítica = 2 días, Alta = 7 días).
  - \`days_open\`: Días transcurridos sin mitigar.
  - \`is_sla_breached\`: Bandera de incumplimiento de SLA de seguridad.

---

## 4. Script DDL Maestro de BigQuery

A continuación se documenta el código DDL formal utilizado para aprovisionar el esquema en BigQuery:

\`\`\`sql
${dwhSql}
\`\`\`
`;

fs.writeFileSync(path.join(MANUALS_DIR, 'MANUAL_TECNICO_ARQUITECTURA_DWH.md'), manualDwh);
console.log('✅ Creado: docs/manuals/MANUAL_TECNICO_ARQUITECTURA_DWH.md');

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL 2: INFRAESTRUCTURA COMO CÓDIGO Y COSTOS (TERRAFORM + INFRACOST)
// ─────────────────────────────────────────────────────────────────────────────
const manualInfra = `# ☁️ Manual de Infraestructura como Código (IaC) y Gestión de Costos
**Sistema**: Tacna SOC — Centro de Operaciones de Seguridad e Inteligencia de Negocios  
**Curso**: Inteligencia de Negocios 2026 — Universidad Privada de Tacna  
**Generado Automáticamente**: ${new Date().toISOString().split('T')[0]}

---

## 1. Topología de Infraestructura Cloud en GCP
Todos los recursos en la nube requeridos para la ejecución de Tacna SOC se gestionan de forma declarativa y reproducible mediante **Terraform (Google Provider v5+)** dentro de la carpeta \`infra/\`.

### Diagrama de Infraestructura Cloud e IaC:
\`\`\`mermaid
${infraDiagram}
\`\`\`

---

## 2. Inventario de Recursos Aprovisionados con Terraform

| Recurso Terraform | Identificador GCP | Propósito Arquitectónico | Free Tier / SLA |
|---|---|---|---|
| \`google_storage_bucket\` | \`tacna-soc-raw-data-lake\` | Bucket multirregional para el Data Lake Raw de extracciones JSON/Parquet | 5 GB/mes incluidos gratis |
| \`google_bigquery_dataset\` | \`tacna_soc_dwh\` | Data Warehouse analítico con particionamiento y clustering | 10 GB almacenamiento y 1 TB consultas/mes gratis |
| \`google_cloud_run_v2_service\` | \`tacna-soc-web\` | Aplicación web unificada (React 19 + Express API) con auto-escalado 0..10 | 2 millones de peticiones y 180k vCPU-s gratis |
| \`google_cloud_run_v2_job\` | \`tacna-soc-etl\` | Tarea serverless que ejecuta el contenedor Python de extracción y carga | Ejecución batch bajo demanda sin costo ocioso |
| \`google_cloud_scheduler_job\` | \`tacna-soc-etl-daily\` | Disparador programado cron (\`0 2 * * *\`) para el Cloud Run Job | Hasta 3 trabajos cron mensuales 100% gratuitos |
| \`google_service_account\` | \`tacna-soc-web-sa\`, \`tacna-soc-etl-sa\` | Cuentas de servicio con privilegios mínimos (Least Privilege) | Seguridad nativa IAM sin llaves estáticas |

---

## 3. Reporte Preventivo de Costos Mensuales (Infracost)

${costReport}

---

## 4. Guía de Despliegue con Terraform

### 4.1. Requisitos Previos:
- Google Cloud SDK (\`gcloud\`) autenticado con \`gcloud auth application-default login\`.
- Terraform CLI v1.5.0 o superior instalado.
- Proyecto GCP creado con facturación habilitada.

### 4.2. Comandos de Ejecución:
\`\`\`bash
# 1. Ingresar a la carpeta de infraestructura
cd infra

# 2. Configurar variables de entorno
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con su gcp_project_id

# 3. Inicializar módulos y proveedores
terraform init

# 4. Planificar y validar cambios
terraform plan -out=tfplan

# 5. Aplicar la infraestructura en GCP
terraform apply tfplan
\`\`\`
`;

fs.writeFileSync(path.join(MANUALS_DIR, 'MANUAL_INFRAESTRUCTURA_Y_COSTOS.md'), manualInfra);
console.log('✅ Creado: docs/manuals/MANUAL_INFRAESTRUCTURA_Y_COSTOS.md');

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL 3: OPERACIÓN, DESPLIEGUE Y CI/CD
// ─────────────────────────────────────────────────────────────────────────────
const manualOps = `# 🚀 Manual de Operación, Despliegue y Automatización CI/CD
**Sistema**: Tacna SOC — Centro de Operaciones de Seguridad e Inteligencia de Negocios  
**Curso**: Inteligencia de Negocios 2026 — Universidad Privada de Tacna  
**Generado Automáticamente**: ${new Date().toISOString().split('T')[0]}

---

## 1. Arquitectura de Pipelines CI/CD (GitHub Actions)

El repositorio incorpora 3 flujos de trabajo automatizados en \`.github/workflows/\`:

1. **\`ci-cd-deploy.yml\` (Integración y Despliegue Continuo)**:
   - Valida el tipado estricto con TypeScript (\`tsc --noEmit\`).
   - Compila la aplicación frontend con Vite (\`npm run build\`).
   - Construye la imagen de producción Docker multi-stage.
   - Si existen los secretos \`GCP_PROJECT_ID\` y \`GCP_SA_KEY\`, despliega a Google Cloud Run; si no, finaliza exitosamente validando el artefacto compilado.
2. **\`generate-docs.yml\` (Documentación y Diagramas como Código)**:
   - Compila los diagramas Mermaid (\`docs/diagrams/*.mmd\`) a formato SVG/PNG mediante \`@mermaid-js/mermaid-cli\`.
   - Ejecuta este script (\`scripts/generate-manuals.mjs\`) para actualizar los manuales técnicos.
   - Genera artefactos descargables del flujo y realiza auto-commit de los cambios en el repositorio.
3. **\`etl-pipeline.yml\` (Orquestación Híbrida del ETL)**:
   - Se ejecuta diariamente vía cron (\`0 2 * * *\`) o bajo demanda con \`workflow_dispatch\`.
   - Ejecuta \`etl/main.py\` con soporte automático de fallback (\`--dry-run\`) si no hay credenciales activas.
   - Sube como artefacto los datasets generados para el Data Lake y el Esquema Estrella.

---

## 2. Diagrama de Secuencia del Proceso ETL Automatizado

\`\`\`mermaid
${etlDiagram}
\`\`\`

---

## 3. Instrucciones de Operación Local y Modo Demo

### 3.1. Ejecución del Frontend y Backend en Desarrollo:
\`\`\`bash
# 1. Instalar dependencias
cd tacna-soc
npm install

# 2. Iniciar servidor de desarrollo Vite + Express
npm run dev
# Abrir en http://localhost:3000
\`\`\`

### 3.2. Compilación y Servidor de Producción:
\`\`\`bash
cd tacna-soc
npm run build
npm start
# Servidor Express activo en http://localhost:8080 (sirviendo dist/)
\`\`\`

### 3.3. Ejecución del Pipeline ETL en Modo Demo Local:
\`\`\`bash
# Ejecutar pipeline ETL con extracción, transformación estrella y guardado local
python etl/main.py --dry-run
# Los archivos generados se ubican en etl/output/star_schema/ y etl/output/raw/
\`\`\`

---

## 4. Configuración de Secretos en GitHub Actions

Para habilitar el despliegue automático a Google Cloud Run, configure los siguientes secretos en el repositorio GitHub (\`Settings > Secrets and variables > Actions\`):

- \`GCP_PROJECT_ID\`: Identificador único del proyecto en Google Cloud.
- \`GCP_SA_KEY\`: Llave privada JSON de la cuenta de servicio con roles \`roles/run.admin\` y \`roles/storage.admin\`.
- \`GEMINI_API_KEY\` (Opcional): Clave para el motor de diagnóstico SOC de Google Gemini AI.
- \`VITE_SUPABASE_URL\` y \`VITE_SUPABASE_ANON_KEY\`: Parámetros de conexión a la base de datos Supabase.
`;

fs.writeFileSync(path.join(MANUALS_DIR, 'MANUAL_OPERACION_Y_DESPLIEGUE.md'), manualOps);
console.log('✅ Creado: docs/manuals/MANUAL_OPERACION_Y_DESPLIEGUE.md');

console.log('✨ Todos los Manuales Técnicos fueron generados satisfactoriamente.');

