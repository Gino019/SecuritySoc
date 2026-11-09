-- ====================================================================
-- Script Maestro SQL para Supabase (PostgreSQL 15+)
-- Tacna SOC — Centro de Operaciones de Seguridad & Inteligencia de Negocios
-- Enfoque: Transaccional, BI, Data Lake/DWH y DevOps
-- ====================================================================

-- 0. Extensiones Requeridas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. TABLA: system_users (Usuarios y Roles RBAC)
-- ====================================================================
CREATE TABLE IF NOT EXISTS system_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT 'Admin2026!',
  role TEXT NOT NULL DEFAULT 'Security Analyst' CHECK (role IN ('Super Admin', 'Security Analyst', 'Auditor', 'Operator')),
  department TEXT DEFAULT 'Centro de Operaciones de Seguridad',
  status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Suspendido', 'Pendiente')),
  two_factor_enabled BOOLEAN DEFAULT true,
  last_login TEXT DEFAULT 'Nunca',
  ip_address TEXT DEFAULT '190.239.77.102 (Tacna)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON system_users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON system_users(created_at);

-- ====================================================================
-- 2. TABLA: websites (Activos Monitoreados / Portales Regionales)
-- ====================================================================
CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  category TEXT DEFAULT 'Gobierno' CHECK (category IN ('Gobierno', 'Educación', 'Salud', 'Finanzas', 'Tecnología / SaaS', 'E-Commerce / Retail', 'Corporativo / Empresa', 'Medios / Blog', 'General / Otro')),
  url TEXT NOT NULL,
  ip TEXT DEFAULT '190.119.200.45',
  last_evaluation TEXT DEFAULT 'Pendiente',
  vuln_count INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  risk_score NUMERIC(5,2) DEFAULT 0.0,
  risk_level TEXT DEFAULT 'Bajo' CHECK (risk_level IN ('Crítico', 'Alto', 'Medio', 'Bajo')),
  status TEXT DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_websites_created_at ON websites(created_at);
CREATE INDEX IF NOT EXISTS idx_websites_category ON websites(category);
CREATE INDEX IF NOT EXISTS idx_websites_risk_level ON websites(risk_level);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(status);

-- ====================================================================
-- 3. TABLA: vulnerability_references (Catálogo Maestro de CVEs / NVD / OWASP)
-- ====================================================================
CREATE TABLE IF NOT EXISTS vulnerability_references (
  cve_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('Crítica', 'Alta', 'Media', 'Baja')),
  cvss_score NUMERIC(3,1) DEFAULT 0.0,
  cvss_vector TEXT,
  attack_vector TEXT DEFAULT 'Network' CHECK (attack_vector IN ('Network', 'Adjacent', 'Local', 'Physical')),
  attack_complexity TEXT DEFAULT 'Low' CHECK (attack_complexity IN ('Low', 'High')),
  privileges_required TEXT DEFAULT 'None' CHECK (privileges_required IN ('None', 'Low', 'High')),
  user_interaction TEXT DEFAULT 'None' CHECK (user_interaction IN ('None', 'Required')),
  owasp_category TEXT,
  cwe_id TEXT,
  remediation JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  nvd_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vuln_ref_severity ON vulnerability_references(severity);
CREATE INDEX IF NOT EXISTS idx_vuln_ref_cvss ON vulnerability_references(cvss_score);
CREATE INDEX IF NOT EXISTS idx_vuln_ref_published ON vulnerability_references(nvd_published_at);
CREATE INDEX IF NOT EXISTS idx_vuln_ref_created_at ON vulnerability_references(created_at);

-- ====================================================================
-- 4. TABLA: evaluations (Historial de Escaneos y Auditorías de Seguridad)
-- ====================================================================
CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  target TEXT NOT NULL,
  date TEXT DEFAULT to_char(now(), 'YYYY-MM-DD'),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  score TEXT DEFAULT 'B' CHECK (score IN ('A', 'B+', 'B', 'C', 'D', 'F')),
  critical INTEGER DEFAULT 0,
  high INTEGER DEFAULT 0,
  medium INTEGER DEFAULT 0,
  low INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Completado' CHECK (status IN ('Completado', 'En Progreso', 'Fallido')),
  progress INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_evaluations_evaluated_at ON evaluations(evaluated_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_target ON evaluations(target);
CREATE INDEX IF NOT EXISTS idx_evaluations_score ON evaluations(score);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);

-- ====================================================================
-- 5. TABLA: findings (Hallazgos Detallados de Seguridad por Escaneo)
-- ====================================================================
CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
  cve_id TEXT REFERENCES vulnerability_references(cve_id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  cwe TEXT,
  description TEXT,
  remediation TEXT,
  evidence JSONB DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_findings_evaluation_id ON findings(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_findings_cve_id ON findings(cve_id);
CREATE INDEX IF NOT EXISTS idx_findings_detected_at ON findings(detected_at);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_created_at ON findings(created_at);

-- ====================================================================
-- 6. TABLA: analyses (Evaluaciones Inteligentes con Gemini AI)
-- ====================================================================
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  evaluation_id TEXT UNIQUE REFERENCES evaluations(id) ON DELETE CASCADE,
  motor TEXT DEFAULT 'Gemini 2.0 Flash',
  summary TEXT,
  risk_level TEXT DEFAULT 'Medio' CHECK (risk_level IN ('Crítico', 'Alto', 'Medio', 'Bajo')),
  score NUMERIC(4,2) DEFAULT 0.0,
  recommendations JSONB DEFAULT '[]'::jsonb,
  main_vulnerabilities JSONB DEFAULT '[]'::jsonb,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analyses_evaluation_id ON analyses(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_analyses_analyzed_at ON analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);

-- ====================================================================
-- 7. TABLA: audit_logs (Trazabilidad Inmutable con Hash SHA-256)
-- ====================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  actor_name TEXT NOT NULL DEFAULT 'Sistema',
  actor_email TEXT NOT NULL DEFAULT 'soc@tacnasoc.pe',
  actor_role TEXT NOT NULL DEFAULT 'Super Admin',
  event_type TEXT NOT NULL,
  target TEXT DEFAULT 'General',
  ip TEXT DEFAULT '190.239.77.102',
  location TEXT DEFAULT 'Tacna, Perú',
  severity TEXT DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'AUDIT')),
  description TEXT DEFAULT '',
  sha256_hash TEXT DEFAULT '',
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_timestamp ON audit_logs(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email);

-- ====================================================================
-- 8. POLÍTICAS ROW LEVEL SECURITY (RLS) - MODO DESARROLLO CONTROLADO
-- ====================================================================
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerability_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública/anónima y autenticada (Lectura y mutación durante fase de integración)
DO $$
BEGIN
  -- system_users
  DROP POLICY IF EXISTS "system_users_select_all" ON system_users;
  DROP POLICY IF EXISTS "system_users_insert_all" ON system_users;
  DROP POLICY IF EXISTS "system_users_update_all" ON system_users;
  CREATE POLICY "system_users_select_all" ON system_users FOR SELECT USING (true);
  CREATE POLICY "system_users_insert_all" ON system_users FOR INSERT WITH CHECK (true);
  CREATE POLICY "system_users_update_all" ON system_users FOR UPDATE USING (true);

  -- websites
  DROP POLICY IF EXISTS "websites_select_all" ON websites;
  DROP POLICY IF EXISTS "websites_insert_all" ON websites;
  DROP POLICY IF EXISTS "websites_update_all" ON websites;
  CREATE POLICY "websites_select_all" ON websites FOR SELECT USING (true);
  CREATE POLICY "websites_insert_all" ON websites FOR INSERT WITH CHECK (true);
  CREATE POLICY "websites_update_all" ON websites FOR UPDATE USING (true);

  -- vulnerability_references
  DROP POLICY IF EXISTS "vuln_ref_select_all" ON vulnerability_references;
  DROP POLICY IF EXISTS "vuln_ref_insert_all" ON vulnerability_references;
  DROP POLICY IF EXISTS "vuln_ref_update_all" ON vulnerability_references;
  CREATE POLICY "vuln_ref_select_all" ON vulnerability_references FOR SELECT USING (true);
  CREATE POLICY "vuln_ref_insert_all" ON vulnerability_references FOR INSERT WITH CHECK (true);
  CREATE POLICY "vuln_ref_update_all" ON vulnerability_references FOR UPDATE USING (true);

  -- evaluations
  DROP POLICY IF EXISTS "evaluations_select_all" ON evaluations;
  DROP POLICY IF EXISTS "evaluations_insert_all" ON evaluations;
  DROP POLICY IF EXISTS "evaluations_update_all" ON evaluations;
  CREATE POLICY "evaluations_select_all" ON evaluations FOR SELECT USING (true);
  CREATE POLICY "evaluations_insert_all" ON evaluations FOR INSERT WITH CHECK (true);
  CREATE POLICY "evaluations_update_all" ON evaluations FOR UPDATE USING (true);

  -- findings
  DROP POLICY IF EXISTS "findings_select_all" ON findings;
  DROP POLICY IF EXISTS "findings_insert_all" ON findings;
  DROP POLICY IF EXISTS "findings_update_all" ON findings;
  CREATE POLICY "findings_select_all" ON findings FOR SELECT USING (true);
  CREATE POLICY "findings_insert_all" ON findings FOR INSERT WITH CHECK (true);
  CREATE POLICY "findings_update_all" ON findings FOR UPDATE USING (true);

  -- analyses
  DROP POLICY IF EXISTS "analyses_select_all" ON analyses;
  DROP POLICY IF EXISTS "analyses_insert_all" ON analyses;
  DROP POLICY IF EXISTS "analyses_update_all" ON analyses;
  CREATE POLICY "analyses_select_all" ON analyses FOR SELECT USING (true);
  CREATE POLICY "analyses_insert_all" ON analyses FOR INSERT WITH CHECK (true);
  CREATE POLICY "analyses_update_all" ON analyses FOR UPDATE USING (true);

  -- audit_logs
  DROP POLICY IF EXISTS "audit_logs_select_all" ON audit_logs;
  DROP POLICY IF EXISTS "audit_logs_insert_all" ON audit_logs;
  CREATE POLICY "audit_logs_select_all" ON audit_logs FOR SELECT USING (true);
  CREATE POLICY "audit_logs_insert_all" ON audit_logs FOR INSERT WITH CHECK (true);
END $$;


-- ====================================================================
-- 9. DATOS SEMILLA HISTÓRICOS (DISTRIBUIDOS 2025 Y 2026)
-- Optimizado para Reportes Analíticos BI con Filtros por Año, Mes y Día
-- ====================================================================

-- 9.1 Usuarios del Sistema
INSERT INTO system_users (id, name, email, password, role, department, status, two_factor_enabled, last_login, ip_address, created_at)
VALUES
  ('usr-1', 'Usher DHR', 'usher.dhr1@gmail.com', 'Admin2026!', 'Super Admin', 'Ciberseguridad y Gobernanza SOC', 'Activo', true, 'Hace 5 minutos', '190.239.77.102 (Tacna)', '2025-01-10T08:00:00Z'),
  ('usr-2', 'Ing. Carlos Quispe', 'carlos.quispe@regiontacna.gob.pe', 'Analyst2026!', 'Security Analyst', 'Respuesta a Incidentes CSIRT', 'Activo', true, 'Hoy 09:45 AM', '190.119.200.14', '2025-02-15T09:30:00Z'),
  ('usr-3', 'Dra. María Elena Ramos', 'm.ramos@contraloria.gob.pe', 'Auditor2026!', 'Auditor', 'Auditoría Gubernamental y Cumplimiento', 'Activo', true, 'Ayer 16:20 PM', '200.48.14.88', '2025-03-20T11:15:00Z'),
  ('usr-4', 'Pedro Flores Chura', 'p.flores@tacna.soc.org', 'Operator2026!', 'Operator', 'Centro de Monitoreo Nivel 1', 'Activo', false, 'Hace 2 días', '190.237.12.3', '2025-05-04T14:00:00Z'),
  ('usr-5', 'Lucía Benavides', 'l.benavides@consultora.seg.pe', 'Analyst2026!', 'Security Analyst', 'Pentesting Externo', 'Suspendido', false, '18 Oct 2025', '181.65.22.4', '2025-08-11T16:45:00Z')
ON CONFLICT (id) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- 9.2 Catálogo Maestro de Vulnerabilidades (vulnerability_references)
INSERT INTO vulnerability_references (cve_id, name, description, severity, cvss_score, cvss_vector, attack_vector, attack_complexity, privileges_required, user_interaction, owasp_category, cwe_id, nvd_published_at, created_at)
VALUES
  ('CVE-2023-38408', 'Remote Code Execution in OpenSSH forwarded agent', 'Falla en el mecanismo PKCS#11 de ssh-agent que permite ejecución remota de código en agentes reenviados.', 'Crítica', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'Network', 'Low', 'None', 'None', 'A06:2021 - Vulnerable Components', 'CWE-426', '2023-07-19T00:00:00Z', '2025-01-15T10:00:00Z'),
  ('CVE-2021-44228', 'Log4Shell RCE in Apache Log4j2', 'Vulnerabilidad crítica en el procesamiento de expresiones JNDI que permite inyección y ejecución remota sin autenticación.', 'Crítica', 10.0, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', 'Network', 'Low', 'None', 'None', 'A06:2021 - Vulnerable Components', 'CWE-502', '2021-12-10T00:00:00Z', '2025-01-15T10:00:00Z'),
  ('CVE-2023-28252', 'SQL Injection in Institutional Web Portals', 'Inyección SQL en parámetros de búsqueda y login que expone tablas confidenciales y contraseñas.', 'Alta', 8.5, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N', 'Network', 'Low', 'None', 'None', 'A03:2021 - Injection', 'CWE-89', '2023-04-12T00:00:00Z', '2025-02-01T12:00:00Z'),
  ('CVE-2022-22965', 'Spring4Shell RCE in Spring Framework Core', 'Ejecución remota de código vía binding de parámetros en aplicaciones Java Spring Framework desplegadas en Tomcat.', 'Crítica', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'Network', 'Low', 'None', 'None', 'A06:2021 - Vulnerable Components', 'CWE-94', '2022-04-01T00:00:00Z', '2025-03-10T09:00:00Z'),
  ('CVE-2024-21413', 'Microsoft Outlook Remote Code Execution Flaw', 'Omisión de validación de enlaces que permite evasión de vista protegida y ejecución de código arbitrario.', 'Alta', 8.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', 'Network', 'Low', 'None', 'Required', 'A01:2021 - Broken Access Control', 'CWE-20', '2024-02-13T00:00:00Z', '2025-04-18T14:30:00Z'),
  ('CVE-2023-4863', 'Heap Buffer Overflow in WebP libwebp', 'Desbordamiento de búfer en decodificador WebP que permite ejecución de código mediante imágenes maliciosas.', 'Crítica', 8.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', 'Network', 'Low', 'None', 'Required', 'A06:2021 - Vulnerable Components', 'CWE-787', '2023-09-12T00:00:00Z', '2025-05-22T08:00:00Z'),
  ('CVE-2023-34362', 'MOVEit Transfer SQL Injection Vulnerability', 'Inyección SQL previa a la autenticación que facilita la exfiltración masiva de bases de datos.', 'Crítica', 9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 'Network', 'Low', 'None', 'None', 'A03:2021 - Injection', 'CWE-89', '2023-06-02T00:00:00Z', '2025-07-14T11:00:00Z'),
  ('CVE-2024-3094', 'Backdoor in XZ Utils Embedded Compression', 'Inyección maliciosa en liblzma que compromete la autenticación SSHd en sistemas Linux.', 'Crítica', 10.0, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', 'Network', 'Low', 'None', 'None', 'A06:2021 - Vulnerable Components', 'CWE-506', '2024-03-29T00:00:00Z', '2025-09-01T15:20:00Z')
ON CONFLICT (cve_id) DO NOTHING;

-- 9.3 Activos Web Monitoreados (websites)
INSERT INTO websites (id, name, institution, category, url, ip, last_evaluation, vuln_count, critical_count, high_count, medium_count, low_count, risk_score, risk_level, status, created_at, updated_at)
VALUES
  ('site-1', 'Portal Institucional GRT', 'Gobierno Regional de Tacna', 'Gobierno', 'https://regiontacna.gob.pe', '190.119.200.45', '2026-10-24 08:30', 15, 3, 5, 4, 3, 78.50, 'Crítico', 'Activo', '2025-01-15T09:00:00Z', '2026-10-24T08:30:00Z'),
  ('site-2', 'Municipalidad Provincial de Tacna', 'Municipalidad Provincial', 'Gobierno', 'https://mptacna.gob.pe', '190.119.200.88', '2026-10-20 14:15', 6, 1, 2, 2, 1, 42.00, 'Medio', 'Activo', '2025-02-10T10:00:00Z', '2026-10-20T14:15:00Z'),
  ('site-3', 'Universidad Nacional Jorge Basadre', 'UNJBG Tacna', 'Educación', 'https://unjbg.edu.pe', '190.119.200.14', '2026-10-18 09:00', 3, 0, 1, 1, 1, 18.20, 'Bajo', 'Activo', '2025-03-01T08:30:00Z', '2026-10-18T09:00:00Z'),
  ('site-4', 'Dirección Regional de Salud Tacna', 'DIRESA Tacna', 'Salud', 'https://diresatacna.gob.pe', '190.119.200.99', '2026-09-30 11:45', 18, 4, 6, 5, 3, 85.00, 'Crítico', 'Activo', '2025-04-12T11:00:00Z', '2026-09-30T11:45:00Z'),
  ('site-5', 'Dirección Regional de Educación Tacna', 'DRET Tacna', 'Educación', 'https://dretacna.gob.pe', '190.119.200.112', '2026-09-15 16:20', 8, 1, 3, 2, 2, 48.00, 'Medio', 'Activo', '2025-05-18T14:20:00Z', '2026-09-15T16:20:00Z'),
  ('site-6', 'Caja Municipal de Ahorro y Crédito Tacna', 'Caja Tacna', 'Finanzas', 'https://cmactacna.com.pe', '200.48.14.33', '2026-10-22 17:00', 2, 0, 0, 1, 1, 12.00, 'Bajo', 'Activo', '2025-06-25T16:00:00Z', '2026-10-22T17:00:00Z'),
  ('site-7', 'Empresa Prestadora de Servicios Tacna', 'EPS Tacna', 'Gobierno', 'https://epstacna.com.pe', '190.119.200.56', '2026-08-14 10:10', 11, 2, 4, 3, 2, 65.00, 'Alto', 'Activo', '2025-07-20T09:15:00Z', '2026-08-14T10:10:00Z'),
  ('site-8', 'Zona Franca de Tacna', 'ZOFRATACNA', 'Gobierno', 'https://zofratacna.com.pe', '190.119.200.77', '2026-10-05 13:30', 9, 2, 3, 3, 1, 58.00, 'Alto', 'Activo', '2025-08-30T10:45:00Z', '2026-10-05T13:30:00Z')
ON CONFLICT (id) DO UPDATE SET
  risk_score = EXCLUDED.risk_score,
  risk_level = EXCLUDED.risk_level,
  vuln_count = EXCLUDED.vuln_count;

-- 9.4 Evaluaciones Históricas (evaluations) distribuidas entre 2025 y 2026
INSERT INTO evaluations (id, target, date, evaluated_at, score, critical, high, medium, low, status, progress, created_at)
VALUES
  -- Año 2025 (Histórico base)
  ('eval-2025-01', 'regiontacna.gob.pe', '2025-02-14', '2025-02-14T10:30:00Z', 'D', 3, 8, 12, 18, 'Completado', 100, '2025-02-14T10:30:00Z'),
  ('eval-2025-02', 'mptacna.gob.pe', '2025-03-22', '2025-03-22T15:00:00Z', 'C', 1, 4, 7, 12, 'Completado', 100, '2025-03-22T15:00:00Z'),
  ('eval-2025-03', 'unjbg.edu.pe', '2025-05-18', '2025-05-18T09:45:00Z', 'B', 0, 2, 4, 8, 'Completado', 100, '2025-05-18T09:45:00Z'),
  ('eval-2025-04', 'diresatacna.gob.pe', '2025-06-30', '2025-06-30T11:20:00Z', 'F', 5, 9, 14, 22, 'Completado', 100, '2025-06-30T11:20:00Z'),
  ('eval-2025-05', 'epstacna.com.pe', '2025-08-12', '2025-08-12T16:15:00Z', 'C', 2, 5, 8, 10, 'Completado', 100, '2025-08-12T16:15:00Z'),
  ('eval-2025-06', 'cmactacna.com.pe', '2025-10-04', '2025-10-04T08:00:00Z', 'A', 0, 0, 2, 4, 'Completado', 100, '2025-10-04T08:00:00Z'),
  ('eval-2025-07', 'zofratacna.com.pe', '2025-11-20', '2025-11-20T14:40:00Z', 'D', 3, 6, 9, 15, 'Completado', 100, '2025-11-20T14:40:00Z'),
  
  -- Año 2026 (Mensual y Diario)
  ('eval-2026-01', 'regiontacna.gob.pe', '2026-01-15', '2026-01-15T09:15:00Z', 'C', 2, 6, 8, 14, 'Completado', 100, '2026-01-15T09:15:00Z'),
  ('eval-2026-02', 'mptacna.gob.pe', '2026-02-18', '2026-02-18T11:30:00Z', 'B', 1, 3, 5, 9, 'Completado', 100, '2026-02-18T11:30:00Z'),
  ('eval-2026-03', 'diresatacna.gob.pe', '2026-03-12', '2026-03-12T14:00:00Z', 'D', 4, 7, 10, 16, 'Completado', 100, '2026-03-12T14:00:00Z'),
  ('eval-2026-04', 'unjbg.edu.pe', '2026-04-20', '2026-04-20T10:00:00Z', 'A', 0, 1, 2, 5, 'Completado', 100, '2026-04-20T10:00:00Z'),
  ('eval-2026-05', 'dretacna.gob.pe', '2026-05-14', '2026-05-14T15:20:00Z', 'C', 1, 4, 6, 8, 'Completado', 100, '2026-05-14T15:20:00Z'),
  ('eval-2026-06', 'epstacna.com.pe', '2026-06-22', '2026-06-22T08:45:00Z', 'C', 2, 4, 5, 7, 'Completado', 100, '2026-06-22T08:45:00Z'),
  ('eval-2026-07', 'cmactacna.com.pe', '2026-07-08', '2026-07-08T16:30:00Z', 'A', 0, 0, 1, 2, 'Completado', 100, '2026-07-08T16:30:00Z'),
  ('eval-2026-08', 'zofratacna.com.pe', '2026-08-19', '2026-08-19T13:10:00Z', 'C', 2, 3, 5, 8, 'Completado', 100, '2026-08-19T13:10:00Z'),
  ('eval-2026-09', 'diresatacna.gob.pe', '2026-09-30', '2026-09-30T11:45:00Z', 'D', 4, 6, 5, 3, 'Completado', 100, '2026-09-30T11:45:00Z'),
  ('eval-2026-10', 'mptacna.gob.pe', '2026-10-20', '2026-10-20T14:15:00Z', 'B', 1, 2, 2, 1, 'Completado', 100, '2026-10-20T14:15:00Z'),
  ('eval-2026-11', 'regiontacna.gob.pe', '2026-10-24', '2026-10-24T08:30:00Z', 'D', 3, 5, 4, 3, 'Completado', 100, '2026-10-24T08:30:00Z')
ON CONFLICT (id) DO UPDATE SET
  score = EXCLUDED.score,
  critical = EXCLUDED.critical,
  high = EXCLUDED.high,
  medium = EXCLUDED.medium,
  low = EXCLUDED.low;

-- 9.5 Hallazgos Relacionales (findings)
INSERT INTO findings (id, evaluation_id, cve_id, type, name, severity, cwe, description, remediation, detected_at, created_at)
VALUES
  ('find-001', 'eval-2025-01', 'CVE-2023-38408', 'DAST_NETWORK', 'OpenSSH Agent Forwarding RCE', 'CRITICAL', 'CWE-426', 'Puerto 22 abierto con OpenSSH versión vulnerable a ejecución remota.', 'Actualizar paquete OpenSSH a versión 9.3p2 o superior.', '2025-02-14T10:32:00Z', '2025-02-14T10:32:00Z'),
  ('find-002', 'eval-2025-01', 'CVE-2023-28252', 'DAST_WEB', 'SQL Injection en formulario de consultas ciudadanas', 'HIGH', 'CWE-89', 'Parámetro dni no sanitizado en portal de consultas.', 'Usar consultas preparadas (Prepared Statements) con PDO o Prisma.', '2025-02-14T10:35:00Z', '2025-02-14T10:35:00Z'),
  ('find-003', 'eval-2025-04', 'CVE-2021-44228', 'DAST_CODE', 'Log4Shell en servicio de citas médicas', 'CRITICAL', 'CWE-502', 'Librería Log4j2 vulnerable a JNDI injection en cabecera User-Agent.', 'Actualizar Log4j2 a 2.17.1.', '2025-06-30T11:25:00Z', '2025-06-30T11:25:00Z'),
  ('find-004', 'eval-2025-07', 'CVE-2023-34362', 'DAST_WEB', 'MOVEit Transfer SQLi en portal de transferencias aduaneras', 'CRITICAL', 'CWE-89', 'Falla de SQL injection permite exfiltración de registros aduaneros.', 'Aplicar parche de seguridad urgente del proveedor.', '2025-11-20T14:45:00Z', '2025-11-20T14:45:00Z'),
  ('find-005', 'eval-2026-01', 'CVE-2022-22965', 'DAST_APP', 'Spring4Shell en portal de pagos de tasas regionales', 'CRITICAL', 'CWE-94', 'Framework Spring desactualizado susceptible a RCE vía data binding.', 'Actualizar Spring Core a 5.3.18+ y JDK a 17.', '2026-01-15T09:20:00Z', '2026-01-15T09:20:00Z'),
  ('find-006', 'eval-2026-03', 'CVE-2023-28252', 'DAST_WEB', 'SQLi en búsqueda de resoluciones directorales DIRESA', 'HIGH', 'CWE-89', 'Entrada de texto en buscador genera error sintáctico SQL al ingresar comilla simple.', 'Parametrizar consulta SQL.', '2026-03-12T14:05:00Z', '2026-03-12T14:05:00Z'),
  ('find-007', 'eval-2026-06', 'CVE-2024-21413', 'DAST_ACCESS', 'Broken Access Control en portal comercial EPS', 'HIGH', 'CWE-20', 'Omisión de autorización permite acceso a recibos de terceros alterando el ID.', 'Implementar validación RBAC de sesión a nivel controlador.', '2026-06-22T08:50:00Z', '2026-06-22T08:50:00Z'),
  ('find-008', 'eval-2026-09', 'CVE-2024-3094', 'DAST_SYS', 'Backdoor en utilitario de compresión servidor web DIRESA', 'CRITICAL', 'CWE-506', 'Binario xz-utils comprometido detectado en servidor perimetral.', 'Degradar inmediatamente xz-utils a versión 5.4 y aislar nodo.', '2026-09-30T11:50:00Z', '2026-09-30T11:50:00Z'),
  ('find-009', 'eval-2026-11', 'CVE-2023-38408', 'DAST_NETWORK', 'OpenSSH agente reenviado en nodo perimetral GRT', 'CRITICAL', 'CWE-426', 'Configuración de SSH permite forwarding inseguro.', 'Configurar ForwardAgent no en sshd_config.', '2026-10-24T08:35:00Z', '2026-10-24T08:35:00Z')
ON CONFLICT (id) DO NOTHING;

-- 9.6 Evaluaciones con Gemini AI (analyses)
INSERT INTO analyses (id, evaluation_id, motor, summary, risk_level, score, recommendations, main_vulnerabilities, analyzed_at, created_at)
VALUES
  ('ana-2025-01', 'eval-2025-01', 'Gemini 2.0 Flash', 'El análisis automático detectó 3 vulnerabilidades críticas en servicios expuestos. La presencia de inyecciones SQL y OpenSSH obsoleto eleva significativamente el riesgo de compromiso perimetral.', 'Crítico', 82.00, '["Deshabilitar OpenSSH forwarding", "Sanitizar entradas con WAF", "Aislar base de datos"]'::jsonb, '[{"nombre": "OpenSSH RCE", "cvss": 9.8}, {"nombre": "SQLi DNI", "cvss": 8.5}]'::jsonb, '2025-02-14T10:40:00Z', '2025-02-14T10:40:00Z'),
  ('ana-2026-03', 'eval-2026-03', 'Gemini 2.0 Flash', 'Portal DIRESA Tacna presenta brechas moderadas-altas. Se recomienda aplicar parches de seguridad en el gestor de contenidos y configurar cabeceras HSTS y Content-Security-Policy.', 'Alto', 68.50, '["Implementar CSP estricto", "Activar HSTS con includeSubdomains", "Revisar consultas de búsqueda"]'::jsonb, '[{"nombre": "SQLi Resoluciones", "cvss": 8.5}]'::jsonb, '2026-03-12T14:15:00Z', '2026-03-12T14:15:00Z'),
  ('ana-2026-11', 'eval-2026-11', 'Gemini 2.0 Flash', 'Evaluación perimetral consolidada de Gobierno Regional de Tacna: Nivel de exposición crítico debido a fallas conocidas sin parchear en puerto 22 y cabeceras ausentes.', 'Crítico', 85.00, '["Actualizar SSH inmediatamente", "Restringir acceso por VPN administrativa", "Re-escanear en 48 horas"]'::jsonb, '[{"nombre": "OpenSSH Forwarding RCE", "cvss": 9.8}]'::jsonb, '2026-10-24T08:45:00Z', '2026-10-24T08:45:00Z')
ON CONFLICT (id) DO NOTHING;

-- 9.7 Registro de Auditoría Inmutable (audit_logs) distribuido 2025 y 2026
INSERT INTO audit_logs (id, timestamp, event_timestamp, actor_name, actor_email, actor_role, event_type, target, ip, location, severity, description, sha256_hash, details, created_at)
VALUES
  ('aud-2025-01', '2025-02-14T10:28:00Z', '2025-02-14T10:28:00Z', 'Usher DHR', 'usher.dhr1@gmail.com', 'Super Admin', 'AUTH_LOGIN_SUCCESS', 'Consola Administrativa SOC', '190.239.77.102', 'Tacna, Perú', 'INFO', 'Inicio de sesión con doble factor de autenticación exitoso.', '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', '{"mfa": true, "session": "sess_2025_01"}'::jsonb, '2025-02-14T10:28:00Z'),
  ('aud-2025-02', '2025-02-14T10:30:00Z', '2025-02-14T10:30:00Z', 'Carlos Quispe', 'carlos.quispe@regiontacna.gob.pe', 'Security Analyst', 'SCAN_TRIGGERED', 'regiontacna.gob.pe', '190.119.200.14', 'Tacna, Perú', 'AUDIT', 'Lanzamiento de escaneo dinámico programado Q1 2025.', 'b337c76891048b321a415a770bfa3f80c6576d1e4384e5b9f71c356230f890ae', '{"scope": "full_dast"}'::jsonb, '2025-02-14T10:30:00Z'),
  ('aud-2025-03', '2025-06-30T11:30:00Z', '2025-06-30T11:30:00Z', 'Carlos Quispe', 'carlos.quispe@regiontacna.gob.pe', 'Security Analyst', 'VULN_STATUS_UPDATED', 'CVE-2021-44228 Log4j DIRESA', '190.119.200.14', 'Tacna, Perú', 'WARNING', 'Hallazgo crítico marcado en mitigación con ticket SEC-2025-442.', '4e29bf429cbb3d87db68565b93d7c485a53982e07ddac4353d26aa2215c0e1e2', '{"ticket": "SEC-2025-442"}'::jsonb, '2025-06-30T11:30:00Z'),
  ('aud-2025-04', '2025-10-04T08:15:00Z', '2025-10-04T08:15:00Z', 'María Elena Ramos', 'm.ramos@contraloria.gob.pe', 'Auditor', 'REPORT_EXPORTED', 'Informe_Q3_2025_Caja_Tacna.pdf', '200.48.14.88', 'Tacna / Lima, Perú', 'AUDIT', 'Generación de informe de auditoría oficial con firma criptográfica.', '76a21190bc93188d6dfab72f58e11a3db61a7ec8f844b24503714b3ad3aa81bf', '{"format": "PDF"}'::jsonb, '2025-10-04T08:15:00Z'),
  ('aud-2026-01', '2026-01-15T09:10:00Z', '2026-01-15T09:10:00Z', 'Usher DHR', 'usher.dhr1@gmail.com', 'Super Admin', 'USER_CREATED', 'Pedro Flores Chura (Operador N1)', '190.239.77.102', 'Tacna, Perú', 'INFO', 'Alta de nuevo operador en plataforma SOC.', 'c1889a7465fbb72579893d5671191060938b2d152a8a5b8214f4949a2a9bb415', '{"role": "Operator"}'::jsonb, '2026-01-15T09:10:00Z'),
  ('aud-2026-02', '2026-03-12T14:10:00Z', '2026-03-12T14:10:00Z', 'Carlos Quispe', 'carlos.quispe@regiontacna.gob.pe', 'Security Analyst', 'SCAN_COMPLETED', 'diresatacna.gob.pe', '190.119.200.14', 'Tacna, Perú', 'AUDIT', 'Finalización de escaneo automatizado con 4 vulnerabilidades críticas.', 'd77821a415ab58309c857691230f890aef6874152a8a5b8214f4949a2a9bb892', '{"findings_count": 4}'::jsonb, '2026-03-12T14:10:00Z'),
  ('aud-2026-03', '2026-05-14T15:30:00Z', '2026-05-14T15:30:00Z', 'Usher DHR', 'usher.dhr1@gmail.com', 'Super Admin', 'CONFIG_MODIFIED', 'Umbral CVSS y Alertas Telegram', '190.239.77.102', 'Tacna, Perú', 'WARNING', 'Ajuste de umbral de severidad a 8.0 y activación de canal Telegram CSIRT.', 'f1190bc93188d6dfab72f58e11a3db61a7ec8f844b24503714b3ad3aa81bf982', '{"threshold": 8.0}'::jsonb, '2026-05-14T15:30:00Z'),
  ('aud-2026-04', '2026-08-19T13:20:00Z', '2026-08-19T13:20:00Z', 'María Elena Ramos', 'm.ramos@contraloria.gob.pe', 'Auditor', 'REPORT_EXPORTED', 'Consolidado_Vulnerabilidades_Zofratacna_Agosto_2026.xlsx', '200.48.14.88', 'Tacna, Perú', 'AUDIT', 'Descarga masiva de datos en formato Excel para revisión de cumplimiento OCI.', '982bf76a21190bc93188d6dfab72f58e11a3db61a7ec8f844b24503714b3ad3a', '{"format": "EXCEL"}'::jsonb, '2026-08-19T13:20:00Z'),
  ('aud-2026-05', '2026-10-24T08:50:00Z', '2026-10-24T08:50:00Z', 'Usher DHR', 'usher.dhr1@gmail.com', 'Super Admin', 'SCAN_COMPLETED', 'regiontacna.gob.pe', '190.239.77.102', 'Tacna, Perú', 'CRITICAL', 'Escaneo ejecutado detecta reincidencia de CVE-2023-38408 en servidor GRT.', '327aa48f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc', '{"score": "D", "critical": 3}'::jsonb, '2026-10-24T08:50:00Z')
ON CONFLICT (id) DO NOTHING;
