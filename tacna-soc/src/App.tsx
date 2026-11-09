import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { PentestScanView } from './components/PentestScanView';
import { AdminHubView } from './components/AdminHubView';
import { DashboardView } from './components/DashboardView';
import { WebsitesView } from './components/WebsitesView';
import { WebsiteDetailView } from './components/WebsiteDetailView';
import { VulnerabilitiesView } from './components/VulnerabilitiesView';
import { VulnerabilityDetailView } from './components/VulnerabilityDetailView';
import { EvaluationsView } from './components/EvaluationsView';
import { ReportsView } from './components/ReportsView';
import { DataSourcesView } from './components/DataSourcesView';
import { UserManagementView } from './components/UserManagementView';
import { AuditLogsView } from './components/AuditLogsView';
import { SettingsView } from './components/SettingsView';
import { GuideView } from './components/GuideView';
import { NewSiteModal } from './components/NewSiteModal';
import { NewScanModal } from './components/NewScanModal';
import { NewUserModal } from './components/NewUserModal';
import { AuditDetailModal } from './components/AuditDetailModal';
import { ScanResultsModal } from './components/ScanResultsModal';
import { scanUrl, analyzeWithAI, ScanResult, AIAnalysis } from './api';
import { 
  getWebsitesFromDb, 
  insertWebsiteToDb, 
  getEvaluationsFromDb, 
  insertEvaluationToDb, 
  getAuditLogsFromDb, 
  insertAuditLogToDb, 
  getUsersFromDb,
  getVulnerabilitiesFromDb,
  insertUserToDb,
  updateUserStatusInDb,
  updateUserRoleInDb,
  updateUserPasswordInDb
} from './supabase';

import { 
  NavigationTab, 
  WebsiteItem, 
  VulnerabilityItem, 
  EvaluationItem, 
  DataSourceItem, 
  SystemUser, 
  AuditLogItem 
} from './types';

import { 
  initialWebsites, 
  initialVulnerabilities, 
  initialEvaluaciones, 
  initialDataSources, 
  initialUsers, 
  initialAuditLogs 
} from './mockData';

import { LoginView, AuthUser } from './components/LoginView';

interface AppProps {
  authUser: AuthUser;
  onLoginUser?: (user: AuthUser) => void;
  onLogout: () => void;
}

export default function App({ authUser, onLoginUser, onLogout }: AppProps) {
  const safeAuthRole = authUser?.role || 'Security Analyst';
  const safeAuthName = authUser?.name || 'Evaluador Invitado (Modo Público)';
  const safeAuthEmail = authUser?.email || 'evaluador.publico@tacnasoc.pe';

  const isGuest = !authUser?.email || 
    authUser.email === 'evaluador.publico@tacnasoc.pe' || 
    (authUser.name && authUser.name.toLowerCase().includes('invitado'));

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState<NavigationTab>(() => {
    try {
      const savedTab = localStorage.getItem('tacna_soc_active_tab') as NavigationTab;
      const validTabs: NavigationTab[] = [
        'scanner', 'vulnerabilities', 'reports', 'admin',
        'dashboard', 'websites', 'evaluaciones', 'evaluations',
        'data-sources', 'user-management', 'audit-logs', 'settings', 'guide'
      ];
      if (savedTab && validTabs.includes(savedTab)) {
        if (isGuest && (savedTab === 'admin' || savedTab === 'user-management' || savedTab === 'audit-logs' || savedTab === 'data-sources' || savedTab === 'settings')) {
          return 'dashboard';
        }
        if (savedTab === 'websites') {
          return 'dashboard';
        }
        if (savedTab === 'evaluaciones' || savedTab === 'evaluations') {
          return 'scanner';
        }
        if (savedTab === 'user-management' || savedTab === 'audit-logs' || savedTab === 'data-sources' || savedTab === 'settings') {
          return 'admin';
        }
        return savedTab;
      }
    } catch {}
    return 'dashboard';
  });
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedVulnCve, setSelectedVulnCve] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActorEmail, setFilterActorEmail] = useState<string | null>(null);
  const [inspectedLog, setInspectedLog] = useState<AuditLogItem | null>(null);

  // Modals state
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real scan modal state
  const [isScanResultsModalOpen, setIsScanResultsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [activeScanResult, setActiveScanResult] = useState<ScanResult | null>(null);
  const [activeAIAnalysis, setActiveAIAnalysis] = useState<AIAnalysis | null>(null);

  // System state
  const [websites, setWebsites] = useState<WebsiteItem[]>(initialWebsites);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityItem[]>(initialVulnerabilities);
  const [evaluaciones, setEvaluaciones] = useState<EvaluationItem[]>(initialEvaluaciones);
  const [dataSources, setDataSources] = useState<DataSourceItem[]>(initialDataSources);
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const stored = localStorage.getItem('sivit_registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const storedEmails = new Set(parsed.map((u: any) => u.email?.toLowerCase()));
          const missingInitials = initialUsers.filter(u => !storedEmails.has(u.email?.toLowerCase()));
          return [...parsed, ...missingInitials];
        }
      }
    } catch {}
    return initialUsers;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);

  // Active user profile — synced from auth with safe defaults
  const [currentUser, setCurrentUser] = useState<SystemUser>(() => {
    const found = initialUsers.find(u => u.role === safeAuthRole) || initialUsers[0];
    return { ...found, name: safeAuthName, email: safeAuthEmail, role: safeAuthRole };
  });

  // Sync currentUser when authUser changes (e.g. from guest to authenticated user or vice versa)
  React.useEffect(() => {
    if (authUser) {
      setCurrentUser(prev => ({
        ...prev,
        name: authUser.name || 'Evaluador Invitado (Modo Público)',
        email: authUser.email || 'evaluador.publico@tacnasoc.pe',
        role: authUser.role || 'Security Analyst'
      }));
    }
  }, [authUser]);

  // Sync live data from Supabase Cloud PostgreSQL
  React.useEffect(() => {
    getWebsitesFromDb().then(sites => {
      if (sites && sites.length > 0) setWebsites(sites);
    });
    getEvaluationsFromDb().then(evals => {
      if (evals && evals.length > 0) setEvaluaciones(evals);
    });
    getAuditLogsFromDb().then(logs => {
      if (logs && logs.length > 0) setAuditLogs(logs);
    });
    getVulnerabilitiesFromDb().then(vulns => {
      if (vulns && vulns.length > 0) setVulnerabilities(vulns);
    });
    getUsersFromDb().then(u => {
      if (u && u.length > 0) {
        setUsers(prev => {
          const merged = u.map(remoteUser => {
            const local = prev.find(p => p.email?.toLowerCase() === remoteUser.email?.toLowerCase());
            return {
              ...remoteUser,
              password: local?.password || remoteUser.password
            };
          });
          const remoteEmails = new Set(u.map(r => r.email?.toLowerCase()));
          const localOnly = prev.filter(p => !remoteEmails.has(p.email?.toLowerCase()));
          const finalUsers = [...merged, ...localOnly];
          try {
            localStorage.setItem('sivit_registered_users', JSON.stringify(finalUsers));
          } catch {}
          return finalUsers;
        });
      }
    });
  }, []);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to append an audit log
  const logAuditEvent = (
    eventType: AuditLogItem['eventType'],
    severity: AuditLogItem['severity'],
    target: string,
    description: string,
    details: Record<string, unknown> = {}
  ) => {
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);

    const newLog: AuditLogItem = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp,
      eventType,
      actor: {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
      },
      severity,
      target,
      ipAddress: currentUser.ipAddress.split(' ')[0] || '190.239.77.102',
      location: 'Tacna, Perú',
      description,
      sha256Checksum: randomHex,
      details
    };

    setAuditLogs(prev => [newLog, ...prev]);
    insertAuditLogToDb(newLog);
  };

  // Switch role for simulation
  const handleSelectUserRole = (newRole: SystemUser['role']) => {
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    logAuditEvent(
      'CONFIG_MODIFIED',
      'INFO',
      `Perfil Activo: ${newRole}`,
      `El usuario conmutó su rol activo a ${newRole} para pruebas de gobernanza.`,
      { previousRole: currentUser.role, newRole }
    );
    showToast(`Rol activo cambiado a: ${newRole}`);
  };

  // Handle adding new site
  const handleAddSite = (newSiteData: Omit<WebsiteItem, 'id' | 'lastEvaluation' | 'vulnCount' | 'criticalCount' | 'highCount' | 'mediumCount' | 'lowCount' | 'riskScore' | 'riskLevel'>) => {
    const newSite: WebsiteItem = {
      ...newSiteData,
      id: `site-${Date.now()}`,
      lastEvaluation: 'Pendiente de Escaneo',
      vulnCount: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      riskScore: 10,
      riskLevel: 'Bajo'
    };

    setWebsites(prev => [newSite, ...prev]);
    insertWebsiteToDb(newSite).then(success => {
      if (success) {
        showToast(`Sitio "${newSite.name}" guardado en Supabase.`);
      } else {
        showToast(`Sitio registrado localmente.`);
      }
    });
    logAuditEvent(
      'CONFIG_MODIFIED',
      'AUDIT',
      newSite.url,
      `Nuevo activo web registrado para monitoreo continuo: ${newSite.name} (${newSite.url})`,
      { siteName: newSite.name, ip: newSite.ip, category: newSite.category }
    );
    showToast(`Sitio "${newSite.name}" registrado correctamente.`);
  };

  // Handle quick scan — REAL security scan via backend API
  const handleQuickScan = async (site: WebsiteItem) => {
    await handleExecuteScan(site.url, site.name, site.category);
  };

  // Handle direct scan from PentestNet Hero Scan Bar (auto-registers domain in Supabase if not existing)
  const handleExecuteScan = async (url: string, institution?: string, category?: WebsiteItem['category']) => {
    let cleanUrl = (url || '').trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    const host = cleanUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    // 1. Auto-register domain in Supabase if it does not exist yet
    let targetSite = websites.find(w => 
      w.url.toLowerCase().replace(/\/$/, '') === cleanUrl.toLowerCase().replace(/\/$/, '') ||
      w.name.toLowerCase() === (institution || host).toLowerCase()
    );

    if (!targetSite) {
      targetSite = {
        id: `site-${Date.now()}`,
        name: institution || host,
        institution: institution || host,
        url: cleanUrl,
        ip: '190.239.77.102',
        category: category || 'Gobierno',
        riskScore: 25,
        riskLevel: 'Bajo',
        vulnCount: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        lastEvaluation: 'En Proceso',
        status: 'Activo'
      };
      setWebsites(prev => [targetSite!, ...prev]);
      insertWebsiteToDb(targetSite).catch(err => console.warn('Supabase website insert error:', err));
    }

    const newEvalId = `EVAL-${Math.floor(100 + Math.random() * 900)}`;
    const newEval: EvaluationItem = {
      id: newEvalId,
      target: host,
      date: 'Ahora mismo',
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      score: 'B',
      status: 'En Progreso',
      progress: 20
    };

    setEvaluaciones(prev => [newEval, ...prev]);
    setIsScanning(true);
    setActiveScanResult(null);
    setActiveAIAnalysis(null);

    logAuditEvent(
      'SCAN_TRIGGERED', 
      'AUDIT', 
      cleanUrl,
      `Escaneo perimetral PentestNet iniciado sobre ${targetSite.name} (${cleanUrl}).`,
      { evaluationId: newEvalId, targetUrl: cleanUrl }
    );
    showToast(`Iniciando escaneo sobre ${targetSite.name}...`);

    try {
      const result = await scanUrl(cleanUrl);
      setActiveScanResult(result);

      // AI Analysis
      let analysis: AIAnalysis | null = null;
      try {
        analysis = await analyzeWithAI(result);
        setActiveAIAnalysis(analysis);
      } catch (aiErr) {
        console.warn('AI analysis fallback:', aiErr);
        const score = Math.max(20, 100 - (result.critical * 25) - (result.high * 15) - (result.medium * 8) - (result.low * 3));
        const riesgo = result.critical > 0 ? 'Crítico' : result.high > 0 ? 'Alto' : result.medium > 0 ? 'Medio' : 'Bajo';
        analysis = {
          resumen: `Diagnóstico DAST perimetral del SOC para ${host}. Se evaluaron cabeceras HTTP y vectores de transporte, identificando ${result.totalFindings} hallazgos de seguridad perimetral.`,
          riesgoGeneral: riesgo,
          puntuacion: score,
          recomendaciones: [
            'Implementar Content-Security-Policy (CSP) para prevenir ataques Cross-Site Scripting (XSS).',
            'Configurar cabecera Strict-Transport-Security (HSTS) para garantizar cifrado de extremo a extremo.',
            'Ocultar información de versiones de servidor y tecnologías en las cabeceras HTTP.',
            'Añadir directiva X-Frame-Options para bloquear vectores de Clickjacking.'
          ],
          vulnerabilidadesPrincipales: (result.findings || []).slice(0, 3).map(f => ({
            nombre: f.name,
            descripcion: f.description,
            impacto: 'Afecta la superficie de ataque perimetral de la aplicación.',
            cvss: f.severity === 'CRITICAL' ? 9.0 : f.severity === 'HIGH' ? 7.5 : f.severity === 'MEDIUM' ? 5.5 : 3.5
          })),
          motor: 'Motor de Inteligencia SOC (Automático)'
        };
        setActiveAIAnalysis(analysis);
      }

      const score: EvaluationItem['score'] = result.critical > 0 ? 'F' : result.high > 2 ? 'D' : result.high > 0 ? 'C' : result.medium > 3 ? 'B' : 'A';

      const completedEval: EvaluationItem = {
        id: newEvalId,
        target: host,
        date: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        critical: result.critical,
        high: result.high,
        medium: result.medium,
        low: result.low,
        score,
        status: 'Completado',
        progress: 100
      };

      setEvaluaciones(prev => [completedEval, ...prev.filter(e => e.id !== newEvalId)]);
      insertEvaluationToDb(completedEval).catch(err => console.warn('Supabase evaluation insert error:', err));

      // Update website risk data with real results
      setWebsites(prev => prev.map(w => (w.id === targetSite!.id || w.url.toLowerCase().replace(/\/$/, '') === cleanUrl.toLowerCase().replace(/\/$/, '')) ? {
        ...w,
        criticalCount: result.critical,
        highCount: result.high,
        mediumCount: result.medium,
        lowCount: result.low,
        vulnCount: result.totalFindings,
        riskScore: Math.min(100, result.critical * 25 + result.high * 10 + result.medium * 5 + result.low),
        riskLevel: result.critical > 0 ? 'Crítico' : result.high > 0 ? 'Alto' : result.medium > 0 ? 'Medio' : 'Bajo',
        lastEvaluation: 'Ahora mismo'
      } : w));

      logAuditEvent(
        'SCAN_COMPLETED', 
        'INFO', 
        cleanUrl,
        `Escaneo PentestNet ${newEvalId} completado: ${result.totalFindings} hallazgos detectados. Puntuación: ${score}`,
        { evaluationId: newEvalId, findings: result.totalFindings, score }
      );
      showToast(`Escaneo completado: ${result.totalFindings} hallazgos en ${targetSite.name}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setEvaluaciones(prev => prev.map(e => e.id === newEvalId ? { ...e, status: 'Fallido', progress: 0 } : e));
      showToast(`Error al escanear ${targetSite.name}: ${msg}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle new scan modal submission
  const handleStartScan = (targetUrl: string, scanType: string) => {
    const newEvalId = `EVAL-${Math.floor(100 + Math.random() * 900)}`;
    const newEval: EvaluationItem = {
      id: newEvalId,
      target: targetUrl.replace('https://', ''),
      date: 'Ahora mismo',
      critical: 1,
      high: 3,
      medium: 5,
      low: 12,
      score: 'B',
      status: 'En Progreso',
      progress: 35
    };

    setEvaluaciones(prev => [newEval, ...prev]);
    setCurrentTab('evaluaciones');
    logAuditEvent(
      'SCAN_TRIGGERED',
      'AUDIT',
      targetUrl,
      `Evaluación ${scanType} iniciada sobre ${targetUrl}.`,
      { scanType, targetUrl }
    );
    showToast(`Evaluación iniciada para ${targetUrl}.`);

    setTimeout(() => {
      setEvaluaciones(prev => prev.map(e => e.id === newEvalId ? { ...e, status: 'Completado', progress: 100 } : e));
    }, 2800);
  };

  // Handle adding new user
  const handleAddUser = (newUserData: Omit<SystemUser, 'id' | 'lastLogin' | 'ipAddress' | 'createdAt'>) => {
    const newUser: SystemUser = {
      ...newUserData,
      id: `usr-${Date.now()}`,
      lastLogin: 'Nunca (Pendiente primer acceso)',
      ipAddress: 'Sin registro previo',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setUsers(prev => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('sivit_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    insertUserToDb(newUser).then(success => {
      if (success) {
        showToast(`Usuario "${newUser.name}" registrado en Supabase con contraseña activa.`);
      } else {
        showToast(`Usuario "${newUser.name}" registrado con contraseña activa.`);
      }
    });

    logAuditEvent(
      'USER_CREATED',
      'CRITICAL',
      newUser.email,
      `Creación de nuevo usuario con rol ${newUser.role} asignado a ${newUser.name}. Contraseña de acceso configurada.`,
      { email: newUser.email, role: newUser.role, department: newUser.department }
    );
  };

  // Handle toggling user status (Active / Suspended)
  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          const nextStatus: 'Activo' | 'Suspendido' = u.status === 'Activo' ? 'Suspendido' : 'Activo';
          updateUserStatusInDb(userId, nextStatus);
          logAuditEvent(
            nextStatus === 'Suspendido' ? 'USER_SUSPENDED' : 'USER_ROLE_UPDATED',
            nextStatus === 'Suspendido' ? 'CRITICAL' : 'WARNING',
            u.email,
            `Estado de usuario ${u.name} cambiado a ${nextStatus}.`,
            { userId: u.id, previousStatus: u.status, newStatus: nextStatus }
          );
          showToast(`Usuario ${u.name}: ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      });
      try {
        localStorage.setItem('sivit_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Handle updating role
  const handleUpdateRole = (userId: string, newRole: SystemUser['role']) => {
    updateUserRoleInDb(userId, newRole);
    setUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          logAuditEvent(
            'USER_ROLE_UPDATED',
            'CRITICAL',
            u.email,
            `Rol de seguridad del usuario ${u.name} actualizado de ${u.role} a ${newRole}.`,
            { userId: u.id, oldRole: u.role, newRole }
          );
          showToast(`Rol de ${u.name} cambiado a ${newRole}`);
          return { ...u, role: newRole };
        }
        return u;
      });
      try {
        localStorage.setItem('sivit_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Handle updating user password
  const handleUpdatePassword = (userId: string, newPassword: string) => {
    updateUserPasswordInDb(userId, newPassword);
    setUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          logAuditEvent(
            'CONFIG_MODIFIED',
            'CRITICAL',
            u.email,
            `Contraseña de acceso actualizada para ${u.name} (${u.email}) por el Administrador.`,
            { userId: u.id, email: u.email }
          );
          return { ...u, password: newPassword };
        }
        return u;
      });
      try {
        localStorage.setItem('sivit_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Contraseña de usuario actualizada exitosamente en Supabase.');
  };

  // View user's audit logs
  const handleViewUserAuditLogs = (userEmail: string) => {
    setFilterActorEmail(userEmail);
    setCurrentTab('audit-logs');
  };

  // Simulate an event in Audit Logs
  const handleSimulateAuditEvent = () => {
    const events = [
      {
        type: 'VULN_STATUS_UPDATED' as const,
        sev: 'WARNING' as const,
        target: 'CVE-2023-28252',
        desc: 'Actualización de ticket de remediación: Parche aplicado en WAF para SQL Injection.'
      },
      {
        type: 'AUTH_LOGIN_SUCCESS' as const,
        sev: 'INFO' as const,
        target: 'API Key SOC Tacna',
        desc: 'Sincronización periódica automática con feed NVD completada con 42 nuevos registros.'
      },
      {
        type: 'AUTH_LOGIN_FAILED' as const,
        sev: 'CRITICAL' as const,
        target: 'Panel de Administración',
        desc: 'Intento de acceso denegado por IP no autorizada desde segmento WAN externo.'
      }
    ];

    const pick = events[Math.floor(Math.random() * events.length)];
    logAuditEvent(pick.type, pick.sev, pick.target, pick.desc, { simulated: true });
    showToast('Evento de auditoría registrado en el log inmutable.');
  };

  // Export report
  const handleExportReport = (format: 'PDF' | 'EXCEL') => {
    logAuditEvent(
      'REPORT_EXPORTED',
      'AUDIT',
      `Informe_Ejecutivo_Tacna_SOC.${format.toLowerCase()}`,
      `Descarga de reporte ejecutivo oficial consolidado en formato ${format}.`,
      { format, scope: 'Consolidado General 150 Activos' }
    );
    showToast(`Reporte ${format} generado y firmado digitalmente.`);
  };

  // Navigation handlers
  const handleSelectSiteFromList = (siteId: string) => {
    setSelectedSiteId(siteId);
  };

  const handleSelectSiteByName = (siteName: string) => {
    const search = String(siteName || '').toLowerCase();
    const found = (websites || []).find(w => 
      String(w?.name || '').toLowerCase().includes(search) || 
      String(w?.url || '').toLowerCase().includes(search)
    );
    if (found) {
      setSelectedSiteId(found.id);
      setCurrentTab('websites');
    } else {
      showToast(`Activo ${siteName} visualizado.`);
    }
  };

  const handleSelectVuln = (cve: string) => {
    setSelectedVulnCve(cve);
  };

  // Active site object with fallback
  const currentSite = websites.find(w => w.id === selectedSiteId) || websites[0] || initialWebsites[0];

  // Active vulnerability object with fallback
  const currentVuln = vulnerabilities.find(v => v.cve === selectedVulnCve) || vulnerabilities[0] || initialVulnerabilities[0];

  // ─── Role-based tab restrictions ─────────────────────────────────────────
  const getAllowedTabs = (role?: AuthUser['role']): NavigationTab[] => {
    // Si no está registrado (modo público/invitado), solo puede ver las vistas operativas públicas
    if (isGuest) {
      return ['dashboard', 'scanner', 'vulnerabilities', 'reports', 'guide'];
    }
    if (role === 'Auditor') return ['dashboard', 'scanner', 'reports', 'admin', 'audit-logs', 'guide'];
    if (role === 'Operator') return ['dashboard', 'scanner', 'vulnerabilities', 'reports', 'websites', 'guide'];
    if (role === 'Security Analyst') return ['dashboard', 'scanner', 'vulnerabilities', 'reports', 'admin', 'data-sources', 'guide'];
    // Super Admin: Acceso total a todas las vistas
    return [
      'dashboard',
      'scanner',
      'vulnerabilities',
      'reports',
      'admin',
      'websites',
      'evaluaciones',
      'evaluations',
      'data-sources',
      'user-management',
      'audit-logs',
      'settings',
      'guide'
    ];
  };

  const allowedTabs = getAllowedTabs(currentUser?.role || safeAuthRole);

  // Validate currentTab against allowedTabs when role or session changes
  React.useEffect(() => {
    if (!allowedTabs.includes(currentTab) && currentTab !== 'evaluaciones' && currentTab !== 'evaluations') {
      setCurrentTab('dashboard');
      try {
        localStorage.setItem('tacna_soc_active_tab', 'dashboard');
      } catch {}
    }
  }, [currentUser?.role, safeAuthRole, isGuest, allowedTabs]);

  const handleTabChange = (tab: NavigationTab) => {
    if (!allowedTabs.includes(tab)) {
      if (isGuest && (tab === 'admin' || tab === 'user-management' || tab === 'audit-logs' || tab === 'settings' || tab === 'data-sources')) {
        setIsLoginModalOpen(true);
        showToast('Debes iniciar sesión con una cuenta autorizada para acceder a esta sección.');
      }
      return;
    }
    setCurrentTab(tab);
    setSelectedSiteId(null);
    setSelectedVulnCve(null);
    try {
      localStorage.setItem('tacna_soc_active_tab', tab);
    } catch {}
  };

  const handleLogoutApp = () => {
    onLogout();
    showToast('Sesión cerrada. Has regresado al Modo Público.');
    logAuditEvent(
      'CONFIG_MODIFIED', 
      'INFO', 
      currentUser.email, 
      'El usuario cerró sesión voluntariamente y regresó al Modo Público.'
    );
  };

  return (
    <div className="h-screen bg-[#f8fafc] text-slate-900 flex font-sans overflow-hidden">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-slate-900 border border-slate-200 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-mono animate-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        currentUser={currentUser}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        allowedTabs={allowedTabs}
        onLogout={handleLogoutApp}
        vulnCount={vulnerabilities.length}
        isGuest={isGuest}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:pl-[260px] min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopHeader
          currentUser={currentUser}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onSelectUserRole={handleSelectUserRole}
          onOpenAuditLogs={() => {
            if (isGuest) {
              setIsLoginModalOpen(true);
              showToast('Debes iniciar sesión como Auditor o Super Admin para inspeccionar la auditoría.');
              return;
            }
            setCurrentTab('admin');
            setFilterActorEmail(null);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={handleLogoutApp}
          onOpenGuide={() => setCurrentTab('guide')}
          isGuest={isGuest}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onNavigateHome={() => handleTabChange('dashboard')}
        />

        {/* Content Area with top header padding & comfortable bottom scrolling */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 max-w-7xl w-full mx-auto overflow-y-auto pb-36">
          {/* Dashboard View (Gráficos Interactivos & KPIs) */}
          {(currentTab === 'dashboard' || currentTab === 'websites') && (
            <DashboardView
              websites={websites}
              onSelectSite={handleSelectSiteByName}
              onNavigateToVulns={() => setCurrentTab('vulnerabilities')}
              onNavigateToSites={() => setCurrentTab('scanner')}
            />
          )}

          {/* Main PentestNet Scanner View (Primary Flow) */}
          {(currentTab === 'scanner' || currentTab === 'evaluaciones' || currentTab === 'evaluations') && (
            selectedSiteId ? (
              <WebsiteDetailView
                site={currentSite}
                vulnerabilities={vulnerabilities}
                onBack={() => setSelectedSiteId(null)}
                onSelectVuln={(cve) => {
                  setSelectedVulnCve(cve);
                  setCurrentTab('vulnerabilities');
                }}
                onReevaluate={handleQuickScan}
              />
            ) : (
              <PentestScanView
                websites={websites}
                evaluaciones={evaluaciones}
                onExecuteScan={handleExecuteScan}
                isScanning={isScanning}
                activeScanResult={activeScanResult}
                activeAIAnalysis={activeAIAnalysis}
                onNavigateToReports={() => setCurrentTab('reports')}
                onNavigateToVulnerabilities={() => setCurrentTab('vulnerabilities')}
                onSelectSiteDetails={handleSelectSiteFromList}
              />
            )
          )}

          {/* Vulnerabilities View & Detail Subview */}
          {currentTab === 'vulnerabilities' && (
            selectedVulnCve ? (
              <VulnerabilityDetailView
                vuln={currentVuln}
                onBack={() => setSelectedVulnCve(null)}
                onSelectSiteByName={handleSelectSiteByName}
              />
            ) : (
              <VulnerabilitiesView
                vulnerabilities={vulnerabilities}
                onSelectVuln={handleSelectVuln}
              />
            )
          )}

          {/* Executive Reports View (100% Preserved with Year, Month, Day temporal slicing) */}
          {currentTab === 'reports' && (
            <ReportsView
              websites={websites}
              evaluaciones={evaluaciones}
              auditLogs={auditLogs}
              onExportReport={handleExportReport}
            />
          )}

          {/* Central Admin & Governance Hub - Protegido: Solo usuarios registrados */}
          {!isGuest && (currentTab === 'admin' || currentTab === 'data-sources' || currentTab === 'user-management' || currentTab === 'audit-logs' || currentTab === 'settings') && (
            <AdminHubView
              users={users}
              onOpenNewUserModal={() => setIsNewUserModalOpen(true)}
              onToggleUserStatus={handleToggleUserStatus}
              onUpdateRole={handleUpdateRole}
              onViewUserAuditLogs={handleViewUserAuditLogs}
              onUpdatePassword={handleUpdatePassword}
              dataSources={dataSources}
              onSyncSource={(id) => {
                logAuditEvent('CONFIG_MODIFIED', 'INFO', `Data Source ${id}`, `Sincronización manual iniciada para conector ${id}.`);
                showToast(`Feed ${id} sincronizado.`);
              }}
              onSyncAll={() => {
                logAuditEvent('CONFIG_MODIFIED', 'INFO', 'All Threat Feeds', 'Sincronización global de todos los feeds de inteligencia.');
                showToast('Todas las fuentes de datos han sido sincronizadas.');
              }}
              auditLogs={auditLogs}
              filterActorEmail={filterActorEmail}
              onClearActorFilter={() => setFilterActorEmail(null)}
              onSimulateEvent={handleSimulateAuditEvent}
              onInspectLog={(log) => setInspectedLog(log)}
              currentUser={currentUser}
              onSaveSettingsNotification={(msg) => {
                logAuditEvent('CONFIG_MODIFIED', 'WARNING', 'Configuración Global SOC', msg);
                showToast(msg);
              }}
              onNavigateTab={(tab) => {
                setCurrentTab(tab);
                setSelectedSiteId(null);
                setSelectedVulnCve(null);
              }}
              onOpenNewScan={() => setCurrentTab('scanner')}
              initialSubTab={
                currentTab === 'user-management' ? 'users' :
                currentTab === 'data-sources' ? 'datasources' :
                currentTab === 'audit-logs' ? 'audit' :
                currentTab === 'settings' ? 'settings' : 'users'
              }
            />
          )}

          {/* Guía Técnica (Accesible para todos los usuarios) */}
          {currentTab === 'guide' && (
            <GuideView
              onNavigateTab={(tab) => handleTabChange(tab)}
              onOpenNewScan={() => handleTabChange('scanner')}
            />
          )}

          {/* Barrera de seguridad si un usuario no autenticado intenta forzar la ruta de administración */}
          {isGuest && (currentTab === 'admin' || currentTab === 'data-sources' || currentTab === 'user-management' || currentTab === 'audit-logs' || currentTab === 'settings') && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Acceso Administrativo Restringido</h3>
              <p className="text-sm text-slate-500">
                Esta sección requiere credenciales con privilegios de gestión (Super Admin, Analista o Auditor).
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all cursor-pointer shadow-sm"
              >
                Iniciar Sesión con Cuenta Autorizada
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewSiteModal
        isOpen={isNewSiteModalOpen}
        onClose={() => setIsNewSiteModalOpen(false)}
        onAddSite={handleAddSite}
      />

      <NewScanModal
        isOpen={isNewScanModalOpen}
        onClose={() => setIsNewScanModalOpen(false)}
        websites={websites}
        onStartScan={handleStartScan}
      />

      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onAddUser={handleAddUser}
      />

      <AuditDetailModal
        log={inspectedLog}
        onClose={() => setInspectedLog(null)}
      />

      {/* Real Scan Results Modal */}
      <ScanResultsModal
        isOpen={isScanResultsModalOpen}
        isScanning={isScanning}
        scanResult={activeScanResult}
        aiAnalysis={activeAIAnalysis}
        isAnalyzingAI={isAnalyzingAI}
        onClose={() => setIsScanResultsModalOpen(false)}
      />

      {/* Login & Register Modal for Public / Guest Users */}
      {isLoginModalOpen && (
        <LoginView
          isModal
          onLogin={(user) => {
            if (onLoginUser) onLoginUser(user);
            setIsLoginModalOpen(false);
            showToast(`Sesión iniciada: Bienvenido ${user.name} (${user.role}).`);
            logAuditEvent('AUTH_LOGIN_SUCCESS', 'INFO', user.email, `Inicio de sesión exitoso como ${user.role}.`);
          }}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}
