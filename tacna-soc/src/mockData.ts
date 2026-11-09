import { 
  WebsiteItem, 
  VulnerabilityItem, 
  EvaluationItem, 
  DataSourceItem, 
  SystemUser, 
  AuditLogItem 
} from './types';

export const initialWebsites: WebsiteItem[] = [
  {
    id: 'site-1',
    name: 'Portal Institucional A',
    institution: 'Gobierno Regional de Tacna',
    category: 'Gobierno',
    url: 'https://regiontacna.gob.pe',
    ip: '192.168.1.45',
    lastEvaluation: '2023-10-24 08:30',
    vulnCount: 15,
    criticalCount: 3,
    highCount: 12,
    mediumCount: 28,
    lowCount: 45,
    riskScore: 75,
    riskLevel: 'Crítico',
    status: 'Activo'
  },
  {
    id: 'site-2',
    name: 'Municipalidad B',
    institution: 'Municipalidad Provincial',
    category: 'Gobierno',
    url: 'https://mptacna.gob.pe',
    ip: '192.168.1.88',
    lastEvaluation: '2023-10-23 14:15',
    vulnCount: 3,
    criticalCount: 0,
    highCount: 1,
    mediumCount: 2,
    lowCount: 5,
    riskScore: 35,
    riskLevel: 'Medio',
    status: 'Activo'
  },
  {
    id: 'site-3',
    name: 'Universidad C',
    institution: 'Universidad Nacional',
    category: 'Educación',
    url: 'https://unjbg.edu.pe',
    ip: '190.119.200.14',
    lastEvaluation: '2023-10-20 09:00',
    vulnCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 1,
    lowCount: 3,
    riskScore: 12,
    riskLevel: 'Bajo',
    status: 'Activo'
  },
  {
    id: 'site-4',
    name: 'Sistema de Trámites',
    institution: 'Gobierno Regional de Tacna',
    category: 'Gobierno',
    url: 'https://tramites.regiontacna.gob.pe',
    ip: '192.168.1.99',
    lastEvaluation: '2023-10-24 11:45',
    vulnCount: 42,
    criticalCount: 7,
    highCount: 16,
    mediumCount: 19,
    lowCount: 24,
    riskScore: 88,
    riskLevel: 'Crítico',
    status: 'Inactivo'
  },
  {
    id: 'site-5',
    name: 'Intranet Académica',
    institution: 'Universidad Nacional',
    category: 'Educación',
    url: 'https://intranet.unjbg.edu.pe',
    ip: '190.119.200.22',
    lastEvaluation: '2023-10-22 16:20',
    vulnCount: 8,
    criticalCount: 1,
    highCount: 2,
    mediumCount: 5,
    lowCount: 11,
    riskScore: 48,
    riskLevel: 'Medio',
    status: 'Activo'
  },
  {
    id: 'site-6',
    name: 'api-gateway.tacna.io',
    institution: 'Gobierno Digital Tacna',
    category: 'Finanzas',
    url: 'https://api-gateway.tacna.io',
    ip: '10.0.5.12',
    lastEvaluation: '2023-10-24 13:10',
    vulnCount: 62,
    criticalCount: 5,
    highCount: 22,
    mediumCount: 25,
    lowCount: 10,
    riskScore: 82,
    riskLevel: 'Crítico',
    status: 'Activo'
  },
  {
    id: 'site-7',
    name: 'legacy-crm.tacna.net',
    institution: 'Caja Municipal Tacna',
    category: 'Finanzas',
    url: 'https://legacy-crm.tacna.net',
    ip: '172.16.0.9',
    lastEvaluation: '2023-10-21 11:00',
    vulnCount: 41,
    criticalCount: 2,
    highCount: 15,
    mediumCount: 14,
    lowCount: 10,
    riskScore: 64,
    riskLevel: 'Alto',
    status: 'Activo'
  }
];

export const initialVulnerabilities: VulnerabilityItem[] = [
  {
    id: 'VULN-001',
    cve: 'CVE-2023-38408',
    name: 'Remote Code Execution in OpenSSH forwarded agent',
    owaspCategory: 'A06:2021 - Vulnerable and Outdated Components',
    cweId: 'CWE-426: Untrusted Search Path',
    cvssScore: 9.8,
    severity: 'Crítica',
    detectionDate: '2023-10-24 14:32:00',
    description: 'The PKCS#11 feature in ssh-agent in OpenSSH before 9.3p2 has an insufficiently trustworthy search path, leading to remote code execution if an agent is forwarded to an attacker-controlled system. (Code in /usr/lib is not necessarily safe for loading into ssh-agent.)',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    nvdPublicationDate: 'Julio 19, 2023',
    remediation: [
      'Actualizar OpenSSH a la versión 9.3p2 o superior.',
      'Deshabilitar el reenvío del agente SSH (`ForwardAgent no` en sshd_config).',
      'Restringir el acceso a los puertos SSH solo a redes de confianza (IP Allowlisting).',
      'Monitorear los logs del sistema para detectar ejecuciones anómalas originadas desde sesiones ssh-agent.'
    ],
    affectedSites: [
      { siteName: 'prod-api-gateway.tacna.local', ip: '10.0.5.12', status: 'Activo' },
      { siteName: 'staging-auth-node.tacna.local', ip: '10.0.8.44', status: 'Activo' },
      { siteName: 'legacy-db-ssh-jump.tacna.cloud', ip: '172.16.0.9', status: 'Activo' }
    ],
    sources: [
      { title: 'NVD - CVE-2023-38408', url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-38408' },
      { title: 'OpenSSH Release Notes 9.3p2', url: 'https://www.openssh.com/txt/release-9.3p2' }
    ]
  },
  {
    id: 'VULN-002',
    cve: 'CVE-2021-44228',
    name: 'Log4Shell RCE in Apache Log4j',
    owaspCategory: 'A06:2021 - Vulnerable and Outdated Components',
    cweId: 'CWE-502: Deserialization of Untrusted Data',
    cvssScore: 10.0,
    severity: 'Crítica',
    detectionDate: '2023-10-23 09:15:22',
    description: 'Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints.',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    nvdPublicationDate: 'Diciembre 10, 2021',
    remediation: [
      'Actualizar a Apache Log4j 2.17.1 o superior.',
      'En versiones 2.10 a 2.14.1, establecer log4j2.formatMsgNoLookups=true.',
      'Remover la clase JndiLookup del classpath si no se puede actualizar inmediatamente.'
    ],
    affectedSites: [
      { siteName: 'api.core-banking.net', ip: '10.0.12.5', status: 'Activo' },
      { siteName: 'auth.portal-clientes.com', ip: '10.0.14.99', status: 'Activo' }
    ],
    sources: [
      { title: 'Apache Security Advisory Log4j', url: 'https://logging.apache.org/security' }
    ]
  },
  {
    id: 'VULN-003',
    cve: 'CVE-2023-28252',
    name: 'SQL Injection in Login Form',
    owaspCategory: 'A03:2021 - Injection',
    cweId: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 8.5,
    severity: 'Alta',
    detectionDate: '2023-10-22 18:45:10',
    description: 'A critical SQL injection flaw in the user authentication route permits bypass of authentication procedures and unauthorized extraction of database table contents.',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    nvdPublicationDate: 'Abril 12, 2023',
    remediation: [
      'Migrar consultas directas a Prepared Statements con enlace de parámetros (Parameter Binding).',
      'Implementar validación y saneamiento de entradas con esquemas estrictos.',
      'Configurar un Web Application Firewall (WAF) con reglas OWASP CRS.'
    ],
    affectedSites: [
      { siteName: 'admin.backoffice.local', ip: '192.168.10.15', status: 'Activo' }
    ],
    sources: [
      { title: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org' }
    ]
  },
  {
    id: 'VULN-004',
    cve: 'CVE-2022-26134',
    name: 'Confluence OGNL Injection',
    owaspCategory: 'A03:2021 - Injection',
    cweId: 'CWE-917: Improper Neutralization of Special Elements in Expression Language',
    cvssScore: 9.8,
    severity: 'Crítica',
    detectionDate: '2023-10-20 11:20:05',
    description: 'In affected versions of Confluence Server and Data Center, an OGNL injection vulnerability exists that would allow an unauthenticated attacker to execute arbitrary code on the host.',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    nvdPublicationDate: 'Junio 02, 2022',
    remediation: [
      'Actualizar inmediatamente a las versiones 7.18.1, 7.17.4 o 7.15.3.',
      'Aplicar la regla WAF de mitigación de OGNL si el parche no puede ser desplegado de inmediato.'
    ],
    affectedSites: [
      { siteName: 'internal-portal.tacna.corp', ip: '10.0.1.20', status: 'Activo' }
    ],
    sources: [
      { title: 'Atlassian Security Advisory 2022-06-02', url: 'https://confluence.atlassian.com' }
    ]
  },
  {
    id: 'VULN-005',
    cve: 'CVE-2023-38545',
    name: 'Cross-Site Scripting (Reflected)',
    owaspCategory: 'A03:2021 - Injection',
    cweId: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 6.1,
    severity: 'Media',
    detectionDate: '2023-10-18 16:05:44',
    description: 'Reflected cross-site scripting in search parameter allows injection of client-side Javascript, potentially capturing session tokens or spoofing administrative dialogues.',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'Required',
    nvdPublicationDate: 'Octubre 11, 2023',
    remediation: [
      'Implementar Contextual Output Encoding en todas las respuestas dinámicas.',
      'Definir Content Security Policy (CSP) restrictiva prohibiendo inline scripts (`script-src self`).',
      'Configurar cookies con flag HttpOnly y SameSite=Strict.'
    ],
    affectedSites: [
      { siteName: 'tramites.regiontacna.gob.pe', ip: '192.168.1.99', status: 'Activo' }
    ],
    sources: [
      { title: 'OWASP XSS Prevention Reference', url: 'https://cheatsheetseries.owasp.org' }
    ]
  }
];

export const initialEvaluaciones: EvaluationItem[] = [
  {
    id: 'EVAL-101',
    target: 'api.produccion.tacna.io',
    date: '24 Oct 2023, 14:30',
    critical: 2,
    high: 5,
    medium: 12,
    low: 28,
    score: 'D',
    status: 'Completado'
  },
  {
    id: 'EVAL-102',
    target: 'portal.clientes.tacna.io',
    date: '25 Oct 2023, 09:15',
    critical: 1,
    high: 3,
    medium: 7,
    low: 14,
    score: 'B',
    status: 'En Progreso',
    progress: 45
  },
  {
    id: 'EVAL-103',
    target: 'blog.tacna.io',
    date: '23 Oct 2023, 18:00',
    critical: 0,
    high: 0,
    medium: 2,
    low: 8,
    score: 'A',
    status: 'Completado'
  },
  {
    id: 'EVAL-104',
    target: 'regiontacna.gob.pe',
    date: '22 Oct 2023, 11:20',
    critical: 3,
    high: 8,
    medium: 15,
    low: 32,
    score: 'D',
    status: 'Completado'
  },
  {
    id: 'EVAL-105',
    target: 'tramites.regiontacna.gob.pe',
    date: '21 Oct 2023, 16:45',
    critical: 4,
    high: 9,
    medium: 12,
    low: 19,
    score: 'D',
    status: 'Completado'
  }
];

export const initialDataSources: DataSourceItem[] = [
  {
    id: 'ds-1',
    name: 'NVD / NIST',
    badge: 'Global',
    badgeColor: '#3b82f6',
    description: 'National Vulnerability Database. Repositorio del gobierno de EE. UU. de datos de gestión de vulnerabilidades basados en estándares (SCAP).',
    statusType: 'Live Sync',
    statusColor: '#10b981',
    endpoint: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
    lastSync: 'Hace 4 minutos',
    recordsCount: '238,419 CVEs'
  },
  {
    id: 'ds-2',
    name: 'CVE Mitre',
    badge: 'Industry',
    badgeColor: '#a855f7',
    description: 'Common Vulnerabilities and Exposures. Diccionario de divulgaciones públicas de vulnerabilidades de seguridad cibernética.',
    statusType: 'Live Sync',
    statusColor: '#10b981',
    endpoint: 'https://cve.mitre.org/data/downloads/allitems.csv',
    lastSync: 'Hace 12 minutos',
    recordsCount: '254,102 Registros'
  },
  {
    id: 'ds-3',
    name: 'OWASP Top 10',
    badge: 'Framework',
    badgeColor: '#f97316',
    description: 'Documento de concientización estándar para desarrolladores y seguridad de aplicaciones web. Define los riesgos de seguridad más críticos.',
    statusType: 'Static Ref',
    statusColor: '#94a3b8',
    endpoint: 'https://owasp.org/Top10/2021-data',
    lastSync: 'Sincronizado v2021',
    recordsCount: '10 Categorías A01-A10'
  },
  {
    id: 'ds-4',
    name: 'Institucionales Tacna',
    badge: 'Internal',
    badgeColor: '#dec29a',
    description: 'Telemetría interna, registros de firewall, agentes de endpoints e inventario de activos específicos de la infraestructura gubernamental local.',
    statusType: 'Streaming',
    statusColor: '#10b981',
    endpoint: 'kafka://soc.tacna.gob.pe:9092/telemetry-stream',
    lastSync: 'En tiempo real (1.2k eps)',
    recordsCount: '150 Activos Monitorizados'
  },
  {
    id: 'ds-5',
    name: 'Lab Data',
    badge: 'Experimental',
    badgeColor: '#ffb4ab',
    description: 'Investigación de amenazas en curso, análisis de malware y honeypots desplegados en entornos controlados (Sandboxes).',
    statusType: 'Restricted',
    statusColor: '#ffb4ab',
    endpoint: 'sandbox://honey-net.tacna.internal/quarantine',
    lastSync: 'Aislado Air-gap',
    recordsCount: '14 Muestras de Zero-day'
  }
];

export const initialUsers: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'Usher DHR',
    email: 'usher.dhr1@gmail.com',
    password: 'Admin2026!',
    role: 'Super Admin',
    department: 'Ciberseguridad y Gobernanza SOC',
    status: 'Activo',
    twoFactorEnabled: true,
    lastLogin: 'Hace 2 minutos (Sesión actual)',
    ipAddress: '190.239.77.102 (Tacna, Perú)',
    createdAt: '2023-01-15'
  },
  {
    id: 'usr-2',
    name: 'Ing. Carlos Quispe',
    email: 'carlos.quispe@regiontacna.gob.pe',
    password: 'Analyst2026!',
    role: 'Security Analyst',
    department: 'Respuesta a Incidentes CSIRT',
    status: 'Activo',
    twoFactorEnabled: true,
    lastLogin: 'Hoy a las 09:45 AM',
    ipAddress: '190.119.200.14',
    createdAt: '2023-03-10'
  },
  {
    id: 'usr-3',
    name: 'Dra. María Elena Ramos',
    email: 'm.ramos@contraloria.gob.pe',
    password: 'Auditor2026!',
    role: 'Auditor',
    department: 'Auditoría Gubernamental y Cumplimiento',
    status: 'Activo',
    twoFactorEnabled: true,
    lastLogin: 'Ayer a las 16:20 PM',
    ipAddress: '200.48.14.88',
    createdAt: '2023-05-02'
  },
  {
    id: 'usr-4',
    name: 'Pedro Flores Chura',
    email: 'p.flores@tacna.soc.org',
    password: 'Operator2026!',
    role: 'Operator',
    department: 'Centro de Monitoreo Nivel 1',
    status: 'Activo',
    twoFactorEnabled: false,
    lastLogin: 'Hace 3 días',
    ipAddress: '190.237.12.3',
    createdAt: '2023-08-20'
  },
  {
    id: 'usr-5',
    name: 'Lucía Benavides',
    email: 'l.benavides@consultora.seg.pe',
    password: 'Analyst2026!',
    role: 'Security Analyst',
    department: 'Pentesting Externo',
    status: 'Suspendido',
    twoFactorEnabled: false,
    lastLogin: '18 Oct 2023',
    ipAddress: '181.65.22.4',
    createdAt: '2023-09-01'
  }
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'AUD-9981',
    timestamp: '2023-10-24 15:42:19',
    eventType: 'AUTH_LOGIN_SUCCESS',
    actor: {
      name: 'Usher DHR',
      email: 'usher.dhr1@gmail.com',
      role: 'Super Admin'
    },
    severity: 'INFO',
    target: 'Consola Administrativa Tacna SOC',
    ipAddress: '190.239.77.102',
    location: 'Tacna, Perú',
    description: 'Inicio de sesión exitoso con 2FA TOTP hardware token verificado.',
    sha256Checksum: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    details: {
      authMethod: 'MFA_TOTP',
      sessionId: 'sess_99a8b1c4',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; Chrome/120.0)'
    }
  },
  {
    id: 'AUD-9980',
    timestamp: '2023-10-24 15:30:05',
    eventType: 'SCAN_TRIGGERED',
    actor: {
      name: 'Carlos Quispe',
      email: 'carlos.quispe@regiontacna.gob.pe',
      role: 'Security Analyst'
    },
    severity: 'AUDIT',
    target: 'portal.clientes.tacna.io',
    ipAddress: '190.119.200.14',
    location: 'Tacna, Perú',
    description: 'Lanzamiento de escaneo dinámico DAST nivel profundidad exhaustivo.',
    sha256Checksum: 'b337c76891048b321a415a770bfa3f80c6576d1e4384e5b9f71c356230f890ae',
    details: {
      scanType: 'OWASP_DAST_FULL',
      targetHost: 'portal.clientes.tacna.io',
      portRange: '80,443,8080,8443',
      engine: 'OpenVAS / Nuclei Core v3'
    }
  },
  {
    id: 'AUD-9979',
    timestamp: '2023-10-24 14:15:22',
    eventType: 'VULN_STATUS_UPDATED',
    actor: {
      name: 'Usher DHR',
      email: 'usher.dhr1@gmail.com',
      role: 'Super Admin'
    },
    severity: 'WARNING',
    target: 'CVE-2023-38408 (OpenSSH RCE)',
    ipAddress: '190.239.77.102',
    location: 'Tacna, Perú',
    description: 'Estado cambiado de "Abierto" a "En Mitigación" con asignación de parche urgente.',
    sha256Checksum: '4e29bf429cbb3d87db68565b93d7c485a53982e07ddac4353d26aa2215c0e1e2',
    details: {
      previousStatus: 'Abierto',
      newStatus: 'En Mitigación',
      ticketId: 'SEC-8924',
      assignedTeam: 'Infraestructura DevSecOps'
    }
  },
  {
    id: 'AUD-9978',
    timestamp: '2023-10-24 13:40:11',
    eventType: 'REPORT_EXPORTED',
    actor: {
      name: 'María Elena Ramos',
      email: 'm.ramos@contraloria.gob.pe',
      role: 'Auditor'
    },
    severity: 'AUDIT',
    target: 'Reporte_Ejecutivo_Q3_Tacna_SOC.pdf',
    ipAddress: '200.48.14.88',
    location: 'Lima / Tacna, Perú',
    description: 'Descarga criptográficamente firmada de reporte de auditoría para Contraloría.',
    sha256Checksum: '76a21190bc93188d6dfab72f58e11a3db61a7ec8f844b24503714b3ad3aa81bf',
    details: {
      format: 'PDF_ENCRYPTED_AES256',
      signature: 'VALID_GOV_CERT_TACNA',
      scope: 'Consolidado Institucional 150 Sitios'
    }
  },
  {
    id: 'AUD-9977',
    timestamp: '2023-10-24 12:02:44',
    eventType: 'USER_SUSPENDED',
    actor: {
      name: 'Usher DHR',
      email: 'usher.dhr1@gmail.com',
      role: 'Super Admin'
    },
    severity: 'CRITICAL',
    target: 'l.benavides@consultora.seg.pe',
    ipAddress: '190.239.77.102',
    location: 'Tacna, Perú',
    description: 'Suspensión preventiva de credenciales por expiración de contrato de consultoría.',
    sha256Checksum: '3128b7a42ea9520cb2a926d833878b27ec4689255a6d36e2f1f008f51a4a4ddb',
    details: {
      reason: 'POLICY_EXPIRED_CONTRACT',
      revokedTokensCount: 3,
      notifiedViaEmail: true
    }
  },
  {
    id: 'AUD-9976',
    timestamp: '2023-10-24 10:18:30',
    eventType: 'CONFIG_MODIFIED',
    actor: {
      name: 'Usher DHR',
      email: 'usher.dhr1@gmail.com',
      role: 'Super Admin'
    },
    severity: 'WARNING',
    target: 'Políticas de Notificación de Alertas Críticas',
    ipAddress: '190.239.77.102',
    location: 'Tacna, Perú',
    description: 'Ajuste de umbral CVSS para despacho de alertas inmediatas a Telegram/Email (8.5 -> 8.0).',
    sha256Checksum: '1a91e5cf5236ecaa7987e9729864205f4dc67ff43f3cf8c43ec865d6c9b5d203',
    details: {
      previousThreshold: 8.5,
      newThreshold: 8.0,
      channels: ['EMAIL_ALERTS', 'SOC_WEBHOOK', 'SMS_DUTY_PHONE']
    }
  },
  {
    id: 'AUD-9975',
    timestamp: '2023-10-24 07:11:58',
    eventType: 'AUTH_LOGIN_FAILED',
    actor: {
      name: 'Desconocido / Intento de fuerza bruta',
      email: 'admin@tacna.gob.pe',
      role: 'Desconocido'
    },
    severity: 'CRITICAL',
    target: 'Portal Autenticación SSO',
    ipAddress: '45.142.195.12',
    location: 'Rusia (Bloqueado por GeoIP)',
    description: 'Múltiples intentos de credenciales inválidas. IP añadida a lista negra de WAF automática.',
    sha256Checksum: 'e921d7b38827cfa88b64e528b1850dbffbb3c92e7a17726715f206ce59828d15',
    details: {
      attemptsCount: 14,
      actionTaken: 'IP_DROP_RULE_APPLIED',
      firewallZone: 'EXTERNAL_EDGE'
    }
  }
];
