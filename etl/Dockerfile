# ====================================================================
# Dockerfile: Contenedor Liviano para Pipeline ETL (Cloud Run Job)
# Tacna SOC — Extracción Supabase -> GCS Data Lake -> BigQuery DWH
# ====================================================================

FROM python:3.11-slim as builder

WORKDIR /app

# Instalar dependencias de compilación para conectores nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Imagen final de ejecución (reducida a < 180MB)
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

COPY . .

# Ejecución del pipeline ETL con soporte para argumentos (--dry-run, --full-refresh)
ENTRYPOINT ["python", "main.py"]

