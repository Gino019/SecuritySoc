---
name: supabase-migration
description: >-
  Guía la creación y ejecución de esquemas SQL, políticas RLS y migraciones de datos en Supabase para Tacna SOC.
---

# Migración y Configuración de Supabase - Tacna SOC

Esta habilidad describe los pasos para asegurar y migrar tablas en Supabase PostgreSQL para la plataforma Tacna SOC.

## Tablas del Sistema

### 1. `websites`
Almacena activos monitoreados en la región de Tacna.
- Columnas requeridas: `id`, `name`, `institution`, `category`, `url`, `ip`, `last_evaluation`, `vuln_count`, `critical_count`, `high_count`, `medium_count`, `low_count`, `risk_score`, `risk_level`, `status`, `created_at`.

### 2. `evaluations`
Historial de escaneos y evaluaciones de seguridad perimetral.
- Columnas requeridas: `id`, `target`, `date`, `score`, `critical`, `high`, `medium`, `low`, `status`, `progress`, `created_at`.

### 3. `audit_logs`
Trazabilidad de acciones administrativas y eventos del SOC.
- Columnas requeridas: `id`, `timestamp`, `actor_name`, `actor_email`, `actor_role`, `event_type`, `target`, `ip`, `location`, `severity`, `description`, `sha256_hash`, `details`, `created_at`.

### 4. `system_users`
Cuentas de analistas, administradores y operadores del SOC.
- Columnas requeridas: `id`, `name`, `email`, `password`, `role`, `department`, `status`, `two_factor_enabled`, `last_login`, `ip_address`, `created_at`.

## Políticas de Acceso (Row Level Security - RLS)
- Habilitar RLS en cada tabla: `ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;`.
- Configurar políticas de lectura y escritura acordes al rol autenticado.

