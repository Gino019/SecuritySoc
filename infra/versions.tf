# ====================================================================
# Terraform: Versiones y Proveedores Oficiales de Google Cloud
# Tacna SOC — Inteligencia de Negocios & Ciberseguridad
# ====================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.15"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Configuración para Backend Remoto (opcional al inicializar con 'terraform init')
  # backend "gcs" {
  #   bucket = "tacna-soc-tfstate-production"
  #   prefix = "terraform/state"
  # }
}

