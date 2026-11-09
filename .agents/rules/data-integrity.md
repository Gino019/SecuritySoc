# Reglas de Integridad de Datos y Persistencia - Tacna SOC

## 1. Persistencia en Supabase
- **Esquema de Tablas Obligatorio**:
  - `system_users`: Gestión de usuarios, roles (`Super Admin`, `Security Analyst`, `Auditor`, `Operator`), estado y 2FA.
  - `websites`: Activos monitoreados, categorías, URLs, IPs, conteo de vulnerabilidades y risk score.
  - `evaluations`: Historial de escaneos, calificaciones (A-F), estado y progreso.
  - `audit_logs`: Trazabilidad inmutable de eventos con actor, tipo de evento, severidad, IP y hash SHA-256.
  - *(Objetivo según FD04)* `findings`, `analyses`, `vulnerability_references`: Desglose detallado de hallazgos por escaneo.

## 2. Scripts SQL y Migraciones
- Todo script de base de datos debe almacenarse de forma versionada e incremental en la carpeta de base de datos o en `supabase_setup.sql`.
- Los scripts deben ser idempotentes: utilizar `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, etc.
- No ejecutar `DROP TABLE` ni sentencias destructivas en entornos compartidos sin confirmación previa del usuario.

## 3. Seguridad de Autenticación
- Migración obligatoria de contraseñas locales en `localStorage` o texto plano a Supabase Auth o hashing seguro.
- Verificación estricta de roles en vistas protegidas (por ejemplo, `UserManagementView` reservada para administradores).

