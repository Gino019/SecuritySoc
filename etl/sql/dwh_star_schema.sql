-- ====================================================================
-- Google BigQuery DDL: Esquema Estrella (Star Schema) - Tacna SOC DWH
-- Dataset Objetivo: tacna_soc_dwh
-- Capa Analítica: Business Intelligence, Dashboarding y Auditoría
-- ====================================================================

-- 1. Dimensión de Tiempo (dim_time)
CREATE TABLE IF NOT EXISTS `tacna_soc_dwh.dim_time` (
  time_key INT64 NOT NULL OPTIONS(description="Clave subrogada formato YYYYMMDD"),
  calendar_date DATE NOT NULL OPTIONS(description="Fecha calendario real"),
  year INT64 NOT NULL OPTIONS(description="Año calendario (ej. 2025, 2026)"),
  quarter INT64 NOT NULL OPTIONS(description="Trimestre (1, 2, 3, 4)"),
  month INT64 NOT NULL OPTIONS(description="Mes numérico (1-12)"),
  month_name STRING NOT NULL OPTIONS(description="Nombre del mes en español"),
  day INT64 NOT NULL OPTIONS(description="Día del mes (1-31)"),
  day_of_week INT64 NOT NULL OPTIONS(description="Día de la semana (1=Domingo, 7=Sábado)"),
  day_name STRING NOT NULL OPTIONS(description="Nombre del día en español"),
  is_weekend BOOL NOT NULL OPTIONS(description="Indica si es sábado o domingo"),
  semester INT64 NOT NULL OPTIONS(description="Semestre calendario (1 o 2)")
)
PARTITION BY calendar_date
OPTIONS(
  description="Dimensión temporal conformada para análisis multidimensional OLAP por Año, Mes y Día",
  require_partition_filter=false
);

-- 2. Dimensión de Activos Web Institucionales (dim_websites)
CREATE TABLE IF NOT EXISTS `tacna_soc_dwh.dim_websites` (
  website_key INT64 NOT NULL OPTIONS(description="Clave subrogada autoincremental"),
  website_id STRING NOT NULL OPTIONS(description="ID natural del activo en Supabase (ej. site-1)"),
  name STRING NOT NULL OPTIONS(description="Nombre descriptivo del portal web"),
  institution STRING NOT NULL OPTIONS(description="Entidad pública o privada responsable"),
  category STRING NOT NULL OPTIONS(description="Sector: Gobierno, Educación, Salud, Finanzas"),
  url STRING NOT NULL OPTIONS(description="URL completa o FQDN del portal"),
  ip_address STRING OPTIONS(description="Dirección IPv4 del servidor perimetral"),
  status STRING NOT NULL OPTIONS(description="Estado de monitoreo: Activo o Inactivo"),
  current_risk_level STRING OPTIONS(description="Nivel de riesgo vigente: Crítico, Alto, Medio, Bajo"),
  current_risk_score FLOAT64 OPTIONS(description="Puntaje de riesgo cuantitativo (0.00 - 100.00)"),
  valid_from TIMESTAMP NOT NULL OPTIONS(description="Inicio de validez del registro SCD Tipo 2"),
  valid_to TIMESTAMP OPTIONS(description="Fin de validez del registro (NULL si es actual)"),
  is_current BOOL NOT NULL OPTIONS(description="Indica si es el registro vigente del activo")
)
CLUSTER BY category, status
OPTIONS(
  description="Dimensión de activos web perimetrales monitoreados en la región Tacna"
);

-- 3. Dimensión de Vulnerabilidades y Amenazas (dim_vulnerabilities)
CREATE TABLE IF NOT EXISTS `tacna_soc_dwh.dim_vulnerabilities` (
  vulnerability_key INT64 NOT NULL OPTIONS(description="Clave subrogada de la vulnerabilidad"),
  cve_id STRING NOT NULL OPTIONS(description="Identificador oficial NIST NVD (ej. CVE-2023-38408)"),
  name STRING NOT NULL OPTIONS(description="Título formal de la vulnerabilidad"),
  severity STRING NOT NULL OPTIONS(description="Severidad cualitativa: Crítica, Alta, Media, Baja"),
  cvss_score FLOAT64 NOT NULL OPTIONS(description="Puntaje base CVSS v3.1 (0.0 - 10.0)"),
  cvss_vector STRING OPTIONS(description="Vector de ataque CVSS v3.1 completo"),
  attack_vector STRING OPTIONS(description="Vector: Network, Adjacent, Local, Physical"),
  attack_complexity STRING OPTIONS(description="Complejidad de ataque: Low, High"),
  privileges_required STRING OPTIONS(description="Privilegios requeridos: None, Low, High"),
  user_interaction STRING OPTIONS(description="Interacción de usuario: None, Required"),
  owasp_category STRING OPTIONS(description="Categoría OWASP Top 10 (ej. A06:2021)"),
  cwe_id STRING OPTIONS(description="Identificador Common Weakness Enumeration"),
  nvd_published_at TIMESTAMP OPTIONS(description="Fecha de publicación oficial en el NIST")
)
CLUSTER BY severity, attack_vector
OPTIONS(
  description="Catálogo maestro dimensional de CVEs, OWASP Top 10 y debilidades CWE"
);

-- 4. Tabla de Hechos de Evaluaciones de Seguridad (fact_evaluations)
CREATE TABLE IF NOT EXISTS `tacna_soc_dwh.fact_evaluations` (
  evaluation_key INT64 NOT NULL OPTIONS(description="Clave subrogada de la evaluación"),
  evaluation_id STRING NOT NULL OPTIONS(description="ID de escaneo en Supabase (ej. eval-2026-01)"),
  website_key INT64 NOT NULL OPTIONS(description="FK a dim_websites"),
  time_key INT64 NOT NULL OPTIONS(description="FK a dim_time (fecha de ejecución)"),
  target_domain STRING NOT NULL OPTIONS(description="Dominio objetivo evaluado"),
  evaluated_at TIMESTAMP NOT NULL OPTIONS(description="Timestamp exacto de finalización del escaneo"),
  score STRING NOT NULL OPTIONS(description="Calificación de seguridad obtenida (A, B+, B, C, D, F)"),
  score_numeric FLOAT64 NOT NULL OPTIONS(description="Equivalencia numérica: A=100, B+=85, B=75, C=60, D=40, F=20"),
  critical_count INT64 NOT NULL OPTIONS(description="Cantidad de vulnerabilidades críticas"),
  high_count INT64 NOT NULL OPTIONS(description="Cantidad de vulnerabilidades altas"),
  medium_count INT64 NOT NULL OPTIONS(description="Cantidad de vulnerabilidades medias"),
  low_count INT64 NOT NULL OPTIONS(description="Cantidad de vulnerabilidades bajas"),
  total_findings INT64 NOT NULL OPTIONS(description="Suma total de hallazgos detectados"),
  risk_score FLOAT64 NOT NULL OPTIONS(description="Índice de riesgo ponderado calculado"),
  status STRING NOT NULL OPTIONS(description="Estado de la evaluación: Completado, En Progreso, Fallido"),
  load_timestamp TIMESTAMP NOT NULL OPTIONS(description="Timestamp de carga por la tubería ETL")
)
PARTITION BY DATE(evaluated_at)
CLUSTER BY score, target_domain
OPTIONS(
  description="Tabla de hechos acumulativa de ejecuciones de escaneos y evaluaciones SOC",
  require_partition_filter=false
);

-- 5. Tabla de Hechos de Hallazgos Individuales (fact_findings)
CREATE TABLE IF NOT EXISTS `tacna_soc_dwh.fact_findings` (
  finding_key INT64 NOT NULL OPTIONS(description="Clave subrogada única del hallazgo"),
  finding_id STRING NOT NULL OPTIONS(description="ID natural del hallazgo en Supabase (ej. find-001)"),
  evaluation_key INT64 NOT NULL OPTIONS(description="FK a fact_evaluations"),
  website_key INT64 NOT NULL OPTIONS(description="FK a dim_websites"),
  vulnerability_key INT64 OPTIONS(description="FK a dim_vulnerabilities (NULL si es hallazgo no-CVE)"),
  time_key INT64 NOT NULL OPTIONS(description="FK a dim_time"),
  type STRING NOT NULL OPTIONS(description="Tipo de análisis: DAST_WEB, DAST_NETWORK, DAST_APP, DAST_CODE"),
  severity STRING NOT NULL OPTIONS(description="Severidad: CRITICAL, HIGH, MEDIUM, LOW"),
  severity_weight INT64 NOT NULL OPTIONS(description="Ponderación: CRITICAL=10, HIGH=6, MEDIUM=3, LOW=1"),
  cwe STRING OPTIONS(description="Código CWE asociado"),
  detected_at TIMESTAMP NOT NULL OPTIONS(description="Timestamp de detección del hallazgo"),
  is_mitigated BOOL NOT NULL OPTIONS(description="Indica si la vulnerabilidad ha sido corregida"),
  days_to_remediate FLOAT64 OPTIONS(description="Días transcurridos hasta la remediación (para cálculo MTTR)"),
  load_timestamp TIMESTAMP NOT NULL OPTIONS(description="Timestamp de carga por la tubería ETL")
)
PARTITION BY DATE(detected_at)
CLUSTER BY severity, type
OPTIONS(
  description="Tabla de hechos atómica de hallazgos individuales para reportes de granularidad fina",
  require_partition_filter=false
);

