# ====================================================================
# Terraform: Variables de Entrada
# Tacna SOC — Infraestructura Cloud & Data Platform
# ====================================================================

variable "project_id" {
  type        = string
  description = "ID del proyecto en Google Cloud Platform (GCP)"
  default     = "tacna-soc-bi-cloud-2026"
}

variable "region" {
  type        = string
  description = "Región de despliegue en GCP. Por defecto 'us-central1' para aprovechar el Always Free Tier de GCP. Alternativa de baja latencia para Tacna: 'southamerica-west1' (Santiago, Chile)."
  default     = "us-central1"
}

variable "environment" {
  type        = string
  description = "Ambiente de despliegue (production, staging, dev)"
  default     = "production"
}

variable "dataset_id" {
  type        = string
  description = "Identificador del Dataset en BigQuery para el Data Warehouse"
  default     = "tacna_soc_dwh"
}

variable "lake_bucket_prefix" {
  type        = string
  description = "Prefijo para el bucket de Cloud Storage que actuará como Data Lake Raw"
  default     = "tacna-soc-raw-lake"
}

variable "etl_image" {
  type        = string
  description = "URI del contenedor Docker en Artifact Registry / GCR para el pipeline ETL"
  default     = "gcr.io/tacna-soc-bi-cloud-2026/tacna-soc-etl:latest"
}

variable "etl_schedule" {
  type        = string
  description = "Expresión Cron para el Cloud Scheduler (por defecto 03:00 AM hora de Tacna / Perú)"
  default     = "0 3 * * *"
}

variable "time_zone" {
  type        = string
  description = "Zona horaria del Scheduler para sincronización regional"
  default     = "America/Lima"
}

variable "supabase_url" {
  type        = string
  description = "Endpoint REST de la instancia de Supabase"
  default     = "https://moqrfgsgcczcogwhbrsd.supabase.co"
}

variable "supabase_key" {
  type        = string
  description = "Clave de API / Service Role de Supabase para extracción ETL"
  default     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  sensitive   = true
}

