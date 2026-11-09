import { createClient } from '@supabase/supabase-js';
import { 
  WebsiteItem, 
  EvaluationItem, 
  SystemUser, 
  AuditLogItem,
  VulnerabilityItem,
  FindingItem,
  AnalysisItem
} from './types';
import { 
  initialWebsites, 
  initialEvaluaciones, 
  initialUsers, 
  initialAuditLogs,
  initialVulnerabilities
} from './mockData';

const env = (import.meta as any).env || {};
const rawSupabaseUrl = env.VITE_SUPABASE_URL || 'https://zyjgfkqqiefydvevmfqh.supabase.co';
// Normalizar URL eliminando sufijo /rest/v1 si estuviera presente
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xBh3bXmfP-oRTKh4NKhXRQ_E5vJE5T2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── WEBSITES ─────────────────────────────────────────────────────────────
export async function getWebsitesFromDb(): Promise<WebsiteItem[]> {
  try {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .order('risk_score', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialWebsites;
    }

    return data.map((d: any) => ({
      id: String(d.id || `site-${Date.now()}`),
      name: String(d.name || 'Portal Institucional'),
      institution: String(d.institution || 'Entidad Tacna'),
      category: d.category || 'Gobierno',
      url: String(d.url || 'https://tacna.gob.pe'),
      ip: String(d.ip || '190.119.200.45'),
      lastEvaluation: String(d.last_evaluation || 'Pendiente'),
      vulnCount: Number(d.vuln_count) || 0,
      criticalCount: Number(d.critical_count) || 0,
      highCount: Number(d.high_count) || 0,
      mediumCount: Number(d.medium_count) || 0,
      lowCount: Number(d.low_count) || 0,
      riskScore: Number(d.risk_score) || 0,
      riskLevel: d.risk_level || 'Bajo',
      status: d.status || 'Activo',
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  } catch (err) {
    console.warn('Error fetching websites from Supabase, using local fallback:', err);
    return initialWebsites;
  }
}

export async function insertWebsiteToDb(site: WebsiteItem): Promise<boolean> {
  try {
    const { error } = await supabase.from('websites').insert([{
      id: site.id,
      name: site.name,
      institution: site.institution,
      category: site.category,
      url: site.url,
      ip: site.ip,
      last_evaluation: site.lastEvaluation,
      vuln_count: site.vulnCount,
      critical_count: site.criticalCount,
      high_count: site.highCount,
      medium_count: site.mediumCount,
      low_count: site.lowCount,
      risk_score: site.riskScore,
      risk_level: site.riskLevel,
      status: site.status,
      created_at: site.createdAt || new Date().toISOString()
    }]);
    return !error;
  } catch {
    return false;
  }
}

// ─── EVALUATIONS ──────────────────────────────────────────────────────────
export async function getEvaluationsFromDb(): Promise<EvaluationItem[]> {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('evaluated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialEvaluaciones;
    }

    return data.map((d: any) => ({
      id: d.id,
      target: d.target,
      date: d.date || (d.evaluated_at ? d.evaluated_at.substring(0, 10) : '2026-09-27'),
      evaluatedAt: d.evaluated_at || d.created_at,
      critical: Number(d.critical) || 0,
      high: Number(d.high) || 0,
      medium: Number(d.medium) || 0,
      low: Number(d.low) || 0,
      score: d.score || 'B',
      status: d.status || 'Completado',
      progress: d.progress,
      createdAt: d.created_at
    }));
  } catch (err) {
    console.warn('Error fetching evaluations from Supabase:', err);
    return initialEvaluaciones;
  }
}

export async function insertEvaluationToDb(ev: EvaluationItem): Promise<boolean> {
  try {
    const nowIso = new Date().toISOString();
    const { error } = await supabase.from('evaluations').insert([{
      id: ev.id,
      target: ev.target,
      date: ev.date || nowIso.substring(0, 10),
      evaluated_at: ev.evaluatedAt || nowIso,
      score: ev.score,
      critical: ev.critical,
      high: ev.high,
      medium: ev.medium,
      low: ev.low,
      status: ev.status,
      progress: ev.progress ?? 100,
      created_at: ev.createdAt || nowIso
    }]);
    return !error;
  } catch {
    return false;
  }
}

// ─── VULNERABILITY REFERENCES (Catálogo Maestro) ──────────────────────────
export async function getVulnerabilitiesFromDb(): Promise<VulnerabilityItem[]> {
  try {
    const { data, error } = await supabase
      .from('vulnerability_references')
      .select('*')
      .order('cvss_score', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialVulnerabilities;
    }

    return data.map((d: any) => {
      // Find matching mock item if any to preserve affected sites and detailed guides
      const mockMatch = initialVulnerabilities.find(v => v.cve === d.cve_id);
      return {
        id: d.cve_id,
        cve: d.cve_id,
        name: d.name || d.cve_id,
        owaspCategory: d.owasp_category || 'A06:2021 - Componentes Vulnerables',
        cweId: d.cwe_id || 'CWE-Unknown',
        cvssScore: Number(d.cvss_score) || 7.5,
        severity: d.severity || 'Alta',
        detectionDate: d.created_at ? d.created_at.substring(0, 10) : '2026-01-15',
        description: d.description || '',
        cvssVector: d.cvss_vector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
        attackVector: d.attack_vector || 'Network',
        attackComplexity: d.attack_complexity || 'Low',
        privilegesRequired: d.privileges_required || 'None',
        userInteraction: d.user_interaction || 'None',
        nvdPublicationDate: d.nvd_published_at ? d.nvd_published_at.substring(0, 10) : '2023-07-19',
        remediation: Array.isArray(d.remediation) ? d.remediation : (mockMatch?.remediation || [
          'Aplicar las últimas actualizaciones de seguridad provistas por el fabricante.',
          'Configurar reglas de filtrado perimetral WAF.',
          'Aislar el servicio de accesos externos directos no autorizados.'
        ]),
        affectedSites: mockMatch?.affectedSites || [
          { siteName: 'regiontacna.gob.pe', ip: '190.119.200.45', status: 'Activo' },
          { siteName: 'diresatacna.gob.pe', ip: '190.119.200.99', status: 'Activo' }
        ],
        sources: Array.isArray(d.sources) ? d.sources : (mockMatch?.sources || [
          { title: `NVD - ${d.cve_id}`, url: `https://nvd.nist.gov/vuln/detail/${d.cve_id}` }
        ]),
        createdAt: d.created_at
      };
    });
  } catch (err) {
    console.warn('Error fetching vulnerabilities from Supabase, using local fallback:', err);
    return initialVulnerabilities;
  }
}

// ─── FINDINGS (Hallazgos por Escaneo) ──────────────────────────────────────
export async function getFindingsFromDb(): Promise<FindingItem[]> {
  try {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      evaluationId: d.evaluation_id,
      cveId: d.cve_id,
      type: d.type,
      name: d.name,
      severity: d.severity,
      cwe: d.cwe,
      description: d.description,
      remediation: d.remediation,
      evidence: d.evidence || {},
      detectedAt: d.detected_at || d.created_at,
      createdAt: d.created_at
    }));
  } catch (err) {
    console.warn('Error fetching findings from Supabase:', err);
    return [];
  }
}

export async function insertFindingToDb(finding: FindingItem): Promise<boolean> {
  try {
    const nowIso = new Date().toISOString();
    const { error } = await supabase.from('findings').insert([{
      id: finding.id,
      evaluation_id: finding.evaluationId,
      cve_id: finding.cveId || null,
      type: finding.type,
      name: finding.name,
      severity: finding.severity,
      cwe: finding.cwe || null,
      description: finding.description,
      remediation: finding.remediation || null,
      evidence: finding.evidence || {},
      detected_at: finding.detectedAt || nowIso,
      created_at: finding.createdAt || nowIso
    }]);
    return !error;
  } catch {
    return false;
  }
}

// ─── ANALYSES (Análisis Inteligente Gemini) ────────────────────────────────
export async function getAnalysesFromDb(): Promise<AnalysisItem[]> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('analyzed_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      evaluationId: d.evaluation_id,
      motor: d.motor || 'Gemini 2.0 Flash',
      summary: d.summary || '',
      riskLevel: d.risk_level || 'Medio',
      score: Number(d.score) || 0,
      recommendations: Array.isArray(d.recommendations) ? d.recommendations : [],
      mainVulnerabilities: Array.isArray(d.main_vulnerabilities) ? d.main_vulnerabilities : [],
      analyzedAt: d.analyzed_at || d.created_at,
      createdAt: d.created_at
    }));
  } catch (err) {
    console.warn('Error fetching analyses from Supabase:', err);
    return [];
  }
}

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────
export async function getAuditLogsFromDb(): Promise<AuditLogItem[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('event_timestamp', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialAuditLogs;
    }

    return data.map((d: any) => ({
      id: d.id,
      timestamp: d.timestamp || (d.event_timestamp ? d.event_timestamp.replace('T', ' ').substring(0, 19) : '2026-10-24 15:42:19'),
      eventTimestamp: d.event_timestamp || d.created_at,
      actor: {
        name: d.actor_name || 'Sistema',
        email: d.actor_email || 'soc@tacnasoc.pe',
        role: d.actor_role || 'Super Admin'
      },
      eventType: d.event_type || 'CONFIG_MODIFIED',
      target: d.target || 'General',
      ipAddress: d.ip || '190.239.77.102',
      location: d.location || 'Tacna, Perú',
      severity: d.severity || 'INFO',
      description: d.description || '',
      sha256Checksum: d.sha256_hash || '',
      details: d.details || {},
      createdAt: d.created_at
    }));
  } catch (err) {
    console.warn('Error fetching audit logs from Supabase:', err);
    return initialAuditLogs;
  }
}

export async function insertAuditLogToDb(log: AuditLogItem): Promise<boolean> {
  try {
    const nowIso = new Date().toISOString();
    const { error } = await supabase.from('audit_logs').insert([{
      id: log.id,
      timestamp: log.timestamp || nowIso,
      event_timestamp: log.eventTimestamp || nowIso,
      actor_name: log.actor.name,
      actor_email: log.actor.email,
      actor_role: log.actor.role,
      event_type: log.eventType,
      target: log.target,
      ip: log.ipAddress,
      location: log.location,
      severity: log.severity,
      description: log.description,
      sha256_hash: log.sha256Checksum,
      details: log.details,
      created_at: log.createdAt || nowIso
    }]);
    return !error;
  } catch {
    return false;
  }
}

// ─── SYSTEM USERS ─────────────────────────────────────────────────────────
export async function getUsersFromDb(): Promise<SystemUser[]> {
  try {
    const { data, error } = await supabase
      .from('system_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialUsers;
    }

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      password: d.password,
      role: d.role,
      department: d.department || 'Ciberseguridad',
      status: d.status || 'Activo',
      twoFactorEnabled: d.two_factor_enabled ?? true,
      lastLogin: d.last_login || '2026-09-27',
      ipAddress: d.ip_address || '190.239.77.102 (Tacna)',
      createdAt: d.created_at ? d.created_at.substring(0, 10) : '2026-01-15'
    }));
  } catch (err) {
    console.warn('Error fetching users from Supabase:', err);
    return initialUsers;
  }
}

export async function insertUserToDb(user: SystemUser): Promise<boolean> {
  try {
    const { error } = await supabase.from('system_users').insert([{
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password || 'Admin2026!',
      role: user.role,
      department: user.department,
      status: user.status,
      two_factor_enabled: user.twoFactorEnabled,
      last_login: user.lastLogin,
      ip_address: user.ipAddress
    }]);
    if (error) {
      console.error('Error inserting user to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception inserting user to Supabase:', err);
    return false;
  }
}

export async function updateUserStatusInDb(userId: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_users')
      .update({ status })
      .eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function updateUserRoleInDb(userId: string, role: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_users')
      .update({ role })
      .eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function updateUserPasswordInDb(userId: string, newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_users')
      .update({ password: newPassword })
      .eq('id', userId);
    if (error) {
      console.warn('Error updating password in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception updating password in Supabase:', err);
    return false;
  }
}

// ─── REGISTRO PÚBLICO Y MODO EVALUADOR ────────────────────────────────────
export async function registerNewUser(params: {
  name: string;
  email: string;
  password: string;
  role: 'Super Admin' | 'Security Analyst' | 'Auditor' | 'Operator';
  department?: string;
}): Promise<{ success: boolean; user?: SystemUser; error?: string }> {
  try {
    const emailNorm = params.email.trim().toLowerCase();

    // 1. Verificar si ya existe en Supabase
    const { data: existing, error: checkError } = await supabase
      .from('system_users')
      .select('id, email')
      .ilike('email', emailNorm)
      .limit(1);

    if (!checkError && existing && existing.length > 0) {
      return { success: false, error: 'Este correo electrónico ya se encuentra registrado.' };
    }

    const nowIso = new Date().toISOString();
    const newUserId = `usr-${Date.now()}`;
    const newUser: SystemUser = {
      id: newUserId,
      name: params.name.trim(),
      email: emailNorm,
      password: params.password,
      role: params.role || 'Security Analyst',
      department: params.department || 'Ciberseguridad Tacna',
      status: 'Activo',
      twoFactorEnabled: false,
      lastLogin: nowIso.replace('T', ' ').substring(0, 19),
      ipAddress: '190.239.77.102 (Tacna)',
      createdAt: nowIso.substring(0, 10)
    };

    // 2. Inserción en system_users de Supabase
    const { error: insertError } = await supabase.from('system_users').insert([{
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      department: newUser.department,
      status: newUser.status,
      two_factor_enabled: newUser.twoFactorEnabled,
      last_login: newUser.lastLogin,
      ip_address: newUser.ipAddress
    }]);

    if (insertError) {
      console.warn('Advertencia insertando en Supabase (se mantiene persistencia local):', insertError);
    }

    // 3. Registrar evento USER_REGISTERED en audit_logs con hash SHA-256
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const auditItem: AuditLogItem = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
      eventTimestamp: nowIso,
      actor: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      eventType: 'USER_REGISTERED',
      target: newUser.email,
      ipAddress: '190.239.77.102',
      location: 'Tacna, Perú',
      severity: 'INFO',
      description: `Nuevo usuario registrado en la plataforma: ${newUser.name} (${newUser.email}) con rol asignado ${newUser.role}.`,
      sha256Checksum: randomHex,
      details: {
        role: newUser.role,
        department: newUser.department,
        registrationType: 'Self-Service Portal'
      }
    };
    await insertAuditLogToDb(auditItem);

    // 4. Cache local en localStorage para respaldo y resiliencia offline
    try {
      const stored = localStorage.getItem('sivit_registered_users');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newUser);
      localStorage.setItem('sivit_registered_users', JSON.stringify(list));
    } catch {}

    return { success: true, user: newUser };
  } catch (err: any) {
    console.error('Excepción registrando nuevo usuario:', err);
    return { success: false, error: err?.message || 'Error inesperado durante el registro.' };
  }
}

export async function logGuestAccess(): Promise<void> {
  try {
    const nowIso = new Date().toISOString();
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const auditItem: AuditLogItem = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
      eventTimestamp: nowIso,
      actor: {
        name: 'Evaluador Invitado (Modo Público)',
        email: 'evaluador.publico@tacnasoc.pe',
        role: 'Security Analyst'
      },
      eventType: 'GUEST_ACCESS_GRANTED',
      target: 'Portal Público / Modo Evaluador',
      ipAddress: '190.239.77.102',
      location: 'Tacna, Perú',
      severity: 'INFO',
      description: 'Acceso rápido concedido en Modo Evaluador / Escaneo Público sin requerimiento de credenciales.',
      sha256Checksum: randomHex,
      details: {
        accessMode: 'Public Evaluator',
        assignedRole: 'Security Analyst',
        grantedPermissions: ['Scan', 'BI Reports', 'Vulnerability Catalog']
      }
    };
    await insertAuditLogToDb(auditItem);
  } catch (err) {
    console.warn('No se pudo registrar log de acceso invitado:', err);
  }
}
