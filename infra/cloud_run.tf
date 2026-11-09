# ====================================================================
# Terraform: Pipeline ETL Serverless en Cloud Run Job & Scheduler
# Tacna SOC — Extracción y Carga Periódica Desatendida
# ====================================================================

# Cuenta de Servicio para ejecución del Pipeline ETL (Menor Privilegio)
resource "google_service_account" "etl_runner" {
  account_id   = "tacna-soc-etl-sa"
  display_name = "Tacna SOC ETL Service Account"
  description  = "Identidad de servicio para orquestar la extracción Supabase -> GCS -> BigQuery"
}

# Roles de IAM requeridos por la cuenta de servicio
resource "google_project_iam_member" "bq_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.etl_runner.email}"
}

resource "google_project_iam_member" "bq_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.etl_runner.email}"
}

resource "google_project_iam_member" "gcs_object_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.etl_runner.email}"
}

# Definición del Job Serverless en Cloud Run
resource "google_cloud_run_v2_job" "etl_job" {
  name     = "tacna-soc-etl-job"
  location = var.region

  template {
    template {
      service_account = google_service_account.etl_runner.email
      timeout         = "600s" # 10 minutos máximo por ejecución

      containers {
        image = var.etl_image

        resources {
          limits = {
            cpu    = "1000m" # 1 vCPU (Optimizado para Free Tier)
            memory = "512Mi" # 512 MB RAM
          }
        }

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "GCP_REGION"
          value = var.region
        }
        env {
          name  = "GCS_LAKE_BUCKET"
          value = google_storage_bucket.raw_lake.name
        }
        env {
          name  = "BQ_DATASET_ID"
          value = google_bigquery_dataset.dwh.dataset_id
        }
        env {
          name  = "SUPABASE_URL"
          value = var.supabase_url
        }
        env {
          name  = "SUPABASE_KEY"
          value = var.supabase_key
        }
        env {
          name  = "DRY_RUN"
          value = "false"
        }
      }
    }
  }

  depends_on = [
    google_project_service.gcp_services,
    google_project_iam_member.bq_editor,
    google_project_iam_member.gcs_object_admin
  ]
}

# Automatización con Cloud Scheduler (Cron Diario)
resource "google_cloud_scheduler_job" "etl_daily_cron" {
  name             = "tacna-soc-etl-daily-trigger"
  description      = "Trigger automatizado para sincronización diaria de telemetría hacia BigQuery"
  schedule         = var.etl_schedule
  time_zone        = var.time_zone
  attempt_deadline = "320s"

  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-run.googleapis.com/v2/projects/${var.project_id}/locations/${var.region}/jobs/${google_cloud_run_v2_job.etl_job.name}:run"

    oauth_token {
      service_account_email = google_service_account.etl_runner.email
    }
  }

  depends_on = [
    google_cloud_run_v2_job.etl_job,
    google_project_service.gcp_services
  ]
}

