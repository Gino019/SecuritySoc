export type NavigationTab = 
  | 'scanner'
  | 'admin'
  | 'dashboard'
  | 'websites'
  | 'vulnerabilities'
  | 'evaluations'
  | 'evaluaciones'
  | 'reports'
  | 'data-sources'
  | 'user-management'
  | 'audit-logs'
  | 'settings'
  | 'guide';

export type RiskLevel = 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

export type WebsiteCategory = 
  | 'Gobierno'
  | 'Educación'
  | 'Salud'
  | 'Finanzas'
  | 'Tecnología / SaaS'
  | 'E-Commerce / Retail'
  | 'Corporativo / Empresa'
  | 'Medios / Blog'
  | 'General / Otro';

export const ALL_WEBSITE_CATEGORIES: WebsiteCategory[] = [
  'Gobierno',
  'Educación',
  'Salud',
  'Finanzas',
  'Tecnología / SaaS',
  'E-Commerce / Retail',
  'Corporativo / Empresa',
  'Medios / Blog',
  'General / Otro'
];

export function inferCategoryFromUrl(rawUrl: string): WebsiteCategory {
  if (!rawUrl) return 'General / Otro';
  const url = rawUrl.toLowerCase().trim();
  
  if (url.includes('.gob') || url.includes('.gov') || url.includes('region') || url.includes('muni') || url.includes('congreso') || url.includes('poderjudicial') || url.includes('sunat') || url.includes('reniec')) {
    return 'Gobierno';
  }
  if (url.includes('.edu') || url.includes('universidad') || url.includes('unjbg') || url.includes('colegio') || url.includes('instituto') || url.includes('school') || url.includes('academy')) {
    return 'Educación';
  }
  if (url.includes('salud') || url.includes('hospital') || url.includes('diresa') || url.includes('minsa') || url.includes('essalud') || url.includes('clinica') || url.includes('health') || url.includes('farma')) {
    return 'Salud';
  }
  if (url.includes('banco') || url.includes('caja') || url.includes('financ') || url.includes('bank') || url.includes('credit') || url.includes('seguro') || url.includes('crypto') || url.includes('invest')) {
    return 'Finanzas';
  }
  if (url.includes('shop') || url.includes('store') || url.includes('tienda') || url.includes('mall') || url.includes('market') || url.includes('ecommerce') || url.includes('compra') || url.includes('venta')) {
    return 'E-Commerce / Retail';
  }
  if (url.includes('.tech') || url.includes('.io') || url.includes('.app') || url.includes('.dev') || url.includes('software') || url.includes('saas') || url.includes('cloud') || url.includes('api') || url.includes('cyber') || url.includes('security')) {
    return 'Tecnología / SaaS';
  }
  if (url.includes('noticia') || url.includes('news') || url.includes('diario') || url.includes('prensa') || url.includes('radio') || url.includes('tv') || url.includes('blog') || url.includes('periodico')) {
    return 'Medios / Blog';
  }
  if (url.includes('corp') || url.includes('inc') || url.includes('consulting') || url.includes('grupo') || url.includes('empresa') || url.includes('holding')) {
    return 'Corporativo / Empresa';
  }

  return 'General / Otro';
}

export interface WebsiteItem {
  id: string;
  name: string;
  institution: string;
  category: WebsiteCategory;
  url: string;
  ip: string;
  lastEvaluation: string;
  vulnCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: 'Activo' | 'Inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface VulnerabilityItem {
  id: string;
  cve: string;
  name: string;
  title?: string;
  owaspCategory: string;
  cweId: string;
  cvssScore: number;
  cvss?: number;
  severity: 'Crítica' | 'Alta' | 'Media' | 'Baja' | 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  detectionDate: string;
  description: string;
  cvssVector: string;
  attackVector: 'Network' | 'Adjacent' | 'Local' | 'Physical';
  attackComplexity: 'Low' | 'High';
  privilegesRequired: 'None' | 'Low' | 'High';
  userInteraction: 'None' | 'Required';
  nvdPublicationDate: string;
  remediation: string[];
  mitigation?: string | string[];
  status?: 'Activo' | 'Mitigado' | string;
  affectedSites: {
    siteName: string;
    ip: string;
    status: 'Activo' | 'Mitigado';
  }[];
  sources: {
    title: string;
    url: string;
  }[];
  createdAt?: string;
}

export interface FindingItem {
  id: string;
  evaluationId: string;
  cveId?: string;
  type: string;
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cwe?: string;
  description: string;
  remediation?: string;
  evidence?: Record<string, unknown>;
  detectedAt: string;
  createdAt?: string;
}

export interface AnalysisItem {
  id: string;
  evaluationId: string;
  motor: string;
  summary: string;
  riskLevel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  score: number;
  recommendations: string[];
  mainVulnerabilities: Array<{
    nombre: string;
    descripcion?: string;
    impacto?: string;
    cvss?: number;
  }>;
  analyzedAt: string;
  createdAt?: string;
}

export interface EvaluationItem {
  id: string;
  target: string;
  date: string;
  evaluatedAt?: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  score: 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  status: 'Completado' | 'En Progreso' | 'Fallido';
  progress?: number;
  createdAt?: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  badge: 'Global' | 'Industry' | 'Framework' | 'Internal' | 'Experimental';
  badgeColor: string;
  description: string;
  statusType: 'Live Sync' | 'Static Ref' | 'Streaming' | 'Restricted';
  statusColor: string;
  endpoint: string;
  lastSync: string;
  recordsCount: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: 'Super Admin' | 'Security Analyst' | 'Auditor' | 'Operator';
  department: string;
  status: 'Activo' | 'Suspendido' | 'Pendiente';
  twoFactorEnabled: boolean;
  lastLogin: string;
  ipAddress: string;
  createdAt: string;
}

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'AUDIT';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  eventTimestamp?: string;
  eventType: 
    | 'AUTH_LOGIN_SUCCESS'
    | 'AUTH_LOGIN_FAILED'
    | 'USER_CREATED'
    | 'USER_REGISTERED'
    | 'USER_ROLE_UPDATED'
    | 'USER_SUSPENDED'
    | 'GUEST_ACCESS_GRANTED'
    | 'SCAN_TRIGGERED'
    | 'SCAN_COMPLETED'
    | 'VULN_STATUS_UPDATED'
    | 'REPORT_EXPORTED'
    | 'CONFIG_MODIFIED'
    | 'API_KEY_ROTATED';
  actor: {
    name: string;
    email: string;
    role: string;
  };
  severity: AuditSeverity;
  target: string;
  ipAddress: string;
  location: string;
  description: string;
  sha256Checksum: string;
  details: Record<string, unknown>;
  createdAt?: string;
}
