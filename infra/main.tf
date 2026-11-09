# ====================================================================
# Terraform: Configuración Principal y Habilitación de APIs en GCP
# Tacna SOC — Centro de Operaciones de Seguridad
# ====================================================================

provider "google" {
  project = var.project_id
  region  = var.region
}

# Generador de sufijo aleatorio para nombres globales únicos de almacenamiento
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Habilitación de APIs requeridas en Google Cloud
locals {
  services = [
    "storage.googleapis.com",        # Google Cloud Storage (Data Lake Raw)
    "bigquery.googleapis.com",       # Google BigQuery (Data Warehouse)
    "run.googleapis.com",            # Cloud Run Jobs (Ejecución ETL Serverless)
    "cloudscheduler.googleapis.com", # Cloud Scheduler (Automatización Cron)
    "iam.googleapis.com"             # Identity and Access Management
  ]
}

resource "google_project_service" "gcp_services" {
  for_each                   = toset(locals.services)
  project                    = var.project_id
  service                    = each.key
  disable_dependent_services = false
  disable_on_destroy         = false
}

