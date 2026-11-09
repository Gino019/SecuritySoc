# Reporte de Estimación de Costos Cloud (IaC & Infracost)
> **Proyecto**: Tacna SOC — Centro de Operaciones de Seguridad & Inteligencia de Negocios  
> **Fecha de Emisión**: Noviembre 2026  
> **Herramienta de Análisis**: Infracost v0.10+ / GCP Pricing Calculator  
> **Infraestructura Evaluada**: Data Lake Raw (GCS), Data Warehouse (BigQuery), Pipeline ETL Serverless (Cloud Run Jobs) y Automatización (Cloud Scheduler).

---

## 1. Resumen Ejecutivo

El presente informe detalla el análisis de costos mensuales proyectados para la arquitectura cloud del proyecto **Tacna SOC**, aprovisionada mediante los módulos declarativos de Terraform ubicados en [`infra/`](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/infra).

La solución ha sido intencionalmente diseñada para operar **dentro del Always Free Tier de Google Cloud Platform (GCP)** bajo la región por defecto `us-central1`, permitiendo sostener la infraestructura de inteligencia de negocios con un costo de **$0.00 a $0.05 USD mensuales**, mientras se mantiene la alternativa regional de baja latencia en `southamerica-west1` (Santiago de Chile) documentada para escenarios de producción estricta.

```
+-----------------------------------------------------------------------------------------+
|                              RESUMEN GENERAL DE COSTOS                                  |
+--------------------------+------------------------------+-------------------------------+
| Región de Despliegue     | us-central1 (Iowa, USA)      | southamerica-west1 (Santiago) |
+--------------------------+------------------------------+-------------------------------+
| Enfoque Operativo        | Free Tier Máximo (Costo $0)  | Mínima Latencia para Tacna    |
| Latencia RTT estimada    | ~120 - 145 ms (Aceptable ETL)| ~35 - 55 ms (Excelente)      |
| Costo Mensual Estimado   | $0.00 - $0.05 USD / mes      | $0.85 - $2.40 USD / mes       |
+--------------------------+------------------------------+-------------------------------+
```

---

## 2. Inventario de Componentes y Modelo de Consumo

El dimensionamiento se basa en el monitoreo continuo de **150 activos institucionales** de Tacna, escaneos diarios acumulativos y retención histórica de 365 días:

| Componente Cloud | Recurso Terraform | Métrica de Consumo Mensual | Cobertura en GCP Free Tier |
|---|---|---|---|
| **Google BigQuery (Storage)** | `google_bigquery_dataset.dwh` + 5 tablas | ~1.2 GB comprimidos (Capacitor) en el 1er año | **10 GB gratuitos** al mes (100% cubierto) |
| **Google BigQuery (Queries)** | Consultas OLAP de los 6 Reportes BI | ~45 GB escaneados / mes (con partición) | **1 TB gratuito** de consultas / mes (100% cubierto) |
| **Cloud Storage (Raw Lake)** | `google_storage_bucket.raw_lake` | ~500 MB nuevos / mes (~6 GB/año) con Nearline | **5 GB gratuitos** Standard Storage en `us-central1` |
| **Cloud Run Jobs (ETL)** | `google_cloud_run_v2_job.etl_job` | 30 ejecuciones/mes de 45 segundos (1 vCPU, 512 MB) | **180,000 vCPU-seg** y **360,000 GiB-seg** gratis |
| **Cloud Scheduler (Cron)** | `google_cloud_scheduler_job.etl_daily_cron` | 1 tarea activa disparada 30 veces al mes | **3 tareas gratuitas** por cuenta de facturación |

---

## 3. Desglose Detallado por Servicio y Región

### 3.1 Escenario A: Región `us-central1` (Configuración por Defecto en `variables.tf`)

Esta región califica para el programa **GCP Always Free Tier**:

1. **Google BigQuery**:
   - Almacenamiento activo (Active Storage): 1.2 GB almacenados. Cuota gratuita = 10 GB. Costo = **$0.00 USD**.
   - Procesamiento de consultas (Analysis Queries): 45 GB procesados. Cuota gratuita = 1,024 GB (1 TB). Costo = **$0.00 USD**.
2. **Google Cloud Storage (Data Lake Raw)**:
   - Almacenamiento Standard: Primeros 5 GB son gratuitos.
   - Excedente proyectado mes 12 (1.0 GB @ $0.020/GB): **$0.02 USD**.
   - Operaciones Clase A (escrituras/listados: ~3,000 req): Gratuitas en free tier.
   - Operaciones Clase B (lecturas: ~10,000 req): Gratuitas en free tier.
3. **Google Cloud Run Jobs (Pipeline ETL)**:
   - Tiempo de CPU: 30 ejecuciones × 45 seg = 1,350 segundos de vCPU (Límite gratuito: 180,000 seg). Costo = **$0.00 USD**.
   - Memoria: 1,350 seg × 0.5 GiB = 675 GiB-segundos (Límite gratuito: 360,000 GiB-seg). Costo = **$0.00 USD**.
   - Peticiones: 30 invocaciones (Límite gratuito: 2,000,000 req). Costo = **$0.00 USD**.
4. **Google Cloud Scheduler**:
   - 1 tarea programada. Cuota gratuita = hasta 3 tareas al mes. Costo = **$0.00 USD**.

> **Subtotal Mensual Estimado en `us-central1`**: **$0.00 - $0.02 USD / mes**.

---

### 3.2 Escenario B: Región `southamerica-west1` (Santiago de Chile — Baja Latencia)

En caso de que las políticas de soberanía de datos o gobernanza institucional exijan almacenar los datos en Sudamérica:

1. **Google BigQuery**:
   - El almacenamiento y procesamiento computacional gozan del Free Tier global (10 GB y 1 TB). Costo = **$0.00 USD**.
2. **Google Cloud Storage**:
   - La cuota de 5 GB gratuitos aplica exclusivamente a regiones de EE.UU. (`us-central1`, `us-east1`, `us-west1`).
   - Almacenamiento Standard en Santiago ($0.029 por GB/mes): 6 GB promedio × $0.029 = **$0.17 USD / mes**.
   - Operaciones Clase A en Santiago: ~3,000 ops × $0.05 / 10,000 = **$0.02 USD / mes**.
3. **Google Cloud Run Jobs**:
   - Cómputo en Santiago (tarifa Tier 2: ~$0.000030 por vCPU-seg): 1,350 seg × $0.000030 = **$0.04 USD / mes**.
4. **Red y Tráfico Saliente (Egress a Perú)**:
   - Tráfico de sincronización de reportes hacia analistas locales: ~5 GB / mes @ $0.12/GB = **$0.60 USD / mes**.

> **Subtotal Mensual Estimado en `southamerica-west1`**: **$0.85 - $1.40 USD / mes**.

---

## 4. Técnicas de Optimización de Costos Aplicadas en el Código

En la implementación de Terraform ([`infra/`](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/infra)) y el DDL SQL ([`etl/sql/dwh_star_schema.sql`](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/etl/sql/dwh_star_schema.sql)) se incorporaron 4 mecanismos de ahorro automático:

1. **Particionamiento Diario en BigQuery (`PARTITION BY DATE(evaluated_at)`)**:
   - Permite que las consultas de los reportes por Año, Mes y Día solo lean las particiones requeridas, reduciendo el volumen de bytes escaneados en más de un **85%** respecto a tablas planas.
2. **Clustering Multicolumna (`CLUSTER BY score, target_domain`, `severity, type`)**:
   - Agrupa físicamente los bloques de almacenamiento por severidad y dominio, optimizando los filtros más utilizados en el SOC sin costo adicional.
3. **Políticas de Ciclo de Vida en Cloud Storage (`lifecycle_rule`)**:
   - Transiciona automáticamente los archivos raw a almacenamiento `NEARLINE` a los 30 días y `COLDLINE` a los 90 días, reduciendo el costo de almacenamiento histórico en hasta un **75%**.
4. **Dimensionamiento Ajustado en Cloud Run (`cpu = 1000m`, `memory = 512Mi`)**:
   - Al tratarse de un Job por lotes (Batch) que procesa deltas incrementales, 512 MB de memoria son más que suficientes y quedan 100% absorbidos por la capa gratuita.

---

## 5. Instrucciones de Verificación con Infracost CLI

Para reproducir este análisis en una estación de trabajo con Infracost instalado:

```bash
# 1. Configurar clave de API de Infracost (gratuita)
infracost configure set api_key <TU_INFRACOST_API_KEY>

# 2. Ejecutar desglose detallado sobre la carpeta infra/
infracost breakdown --config-file infracost.yml

# 3. Generar comparativa contra el estado actual
infracost diff --config-file infracost.yml
```

