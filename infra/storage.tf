# ====================================================================
# Terraform: Data Lake Raw en Google Cloud Storage (GCS)
# Tacna SOC — Almacenamiento Inmutable de Telemetría y Snapshots
# ====================================================================

resource "google_storage_bucket" "raw_lake" {
  name                        = "${var.lake_bucket_prefix}-${var.environment}-${random_id.bucket_suffix.hex}"
  location                    = var.region
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  # Políticas de Ciclo de Vida para Optimización de Costos
  lifecycle_rule {
    condition {
      age = 30 # Transición a Nearline después de 30 días
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 90 # Transición a Coldline tras 3 meses
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365 # Purga automática de versiones históricas superiores a 1 año
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    environment = var.environment
    workload    = "tacna-soc-datalake"
    managed_by  = "terraform"
  }

  depends_on = [google_project_service.gcp_services]
}

