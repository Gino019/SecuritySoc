# ====================================================================
# Terraform: Salidas del Despliegue (Outputs)
# Tacna SOC — Plataforma Cloud & Data Warehouse
# ====================================================================

output "gcp_project_id" {
  description = "ID del proyecto en Google Cloud"
  value       = var.project_id
}

output "deployment_region" {
  description = "Región de infraestructura aprovisionada"
  value       = var.region
}

output "dwh_dataset_id" {
  description = "ID del Dataset en BigQuery con el Esquema Estrella"
  value       = google_bigquery_dataset.dwh.dataset_id
}

output "raw_lake_bucket_name" {
  description = "Nombre del bucket Data Lake en Cloud Storage"
  value       = google_storage_bucket.raw_lake.name
}

output "raw_lake_bucket_url" {
  description = "URI del bucket Data Lake para consultas externas"
  value       = "gs://${google_storage_bucket.raw_lake.name}"
}

output "etl_job_name" {
  description = "Nombre del Job serverless en Cloud Run"
  value       = google_cloud_run_v2_job.etl_job.name
}

output "scheduler_job_name" {
  description = "Nombre del disparador programado en Cloud Scheduler"
  value       = google_cloud_scheduler_job.etl_daily_cron.name
}

output "etl_schedule" {
  description = "Frecuencia de sincronización cron configurada"
  value       = var.etl_schedule
}

output "service_account_email" {
  description = "Identidad de servicio utilizada para el ETL"
  value       = google_service_account.etl_runner.email
}

