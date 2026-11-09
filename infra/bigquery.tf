# ====================================================================
# Terraform: Data Warehouse Analítico en Google BigQuery (Star Schema)
# Tacna SOC — Esquema Estrella Particionado y Clusterizado
# ====================================================================

resource "google_bigquery_dataset" "dwh" {
  dataset_id                  = var.dataset_id
  friendly_name               = "Tacna SOC Data Warehouse"
  description                 = "Almacén analítico multidimensional con Esquema Estrella para inteligencia de ciberseguridad en Tacna"
  location                    = var.region
  default_table_expiration_ms = null # Almacenamiento analítico persistente

  labels = {
    environment = var.environment
    workload    = "tacna-soc-dwh"
    managed_by  = "terraform"
  }

  depends_on = [google_project_service.gcp_services]
}

# 1. Dimensión de Tiempo
resource "google_bigquery_table" "dim_time" {
  dataset_id          = google_bigquery_dataset.dwh.dataset_id
  table_id            = "dim_time"
  description         = "Dimensión de tiempo para filtros multidimensionales por Año, Mes y Día"
  deletion_protection = false

  time_partitioning {
    type  = "DAY"
    field = "calendar_date"
  }

  schema = file("${path.module}/../etl/sql/schemas/dim_time.json")
}

# 2. Dimensión de Activos Web
resource "google_bigquery_table" "dim_websites" {
  dataset_id          = google_bigquery_dataset.dwh.dataset_id
  table_id            = "dim_websites"
  description         = "Dimensión de activos web monitoreados en la región de Tacna"
  deletion_protection = false

  clustering = ["category", "status"]

  schema = file("${path.module}/../etl/sql/schemas/dim_websites.json")
}

# 3. Dimensión de Vulnerabilidades
resource "google_bigquery_table" "dim_vulnerabilities" {
  dataset_id          = google_bigquery_dataset.dwh.dataset_id
  table_id            = "dim_vulnerabilities"
  description         = "Catálogo dimensional de CVEs, OWASP Top 10 y debilidades CWE"
  deletion_protection = false

  clustering = ["severity", "attack_vector"]

  schema = file("${path.module}/../etl/sql/schemas/dim_vulnerabilities.json")
}

# 4. Tabla de Hechos de Evaluaciones
resource "google_bigquery_table" "fact_evaluations" {
  dataset_id          = google_bigquery_dataset.dwh.dataset_id
  table_id            = "fact_evaluations"
  description         = "Tabla de hechos acumulativa de ejecuciones y posturas de seguridad"
  deletion_protection = false

  time_partitioning {
    type  = "DAY"
    field = "evaluated_at"
  }

  clustering = ["score", "target_domain"]

  schema = file("${path.module}/../etl/sql/schemas/fact_evaluations.json")
}

# 5. Tabla de Hechos de Hallazgos
resource "google_bigquery_table" "fact_findings" {
  dataset_id          = google_bigquery_dataset.dwh.dataset_id
  table_id            = "fact_findings"
  description         = "Tabla de hechos atómica de hallazgos perimetrales individuales"
  deletion_protection = false

  time_partitioning {
    type  = "DAY"
    field = "detected_at"
  }

  clustering = ["severity", "type"]

  schema = file("${path.module}/../etl/sql/schemas/fact_findings.json")
}

