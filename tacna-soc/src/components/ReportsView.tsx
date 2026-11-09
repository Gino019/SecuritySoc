import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  Clock,
  Building,
  Check,
  FileSpreadsheet,
  Hash
} from 'lucide-react';
import { WebsiteItem, EvaluationItem, AuditLogItem } from '../types';
import { initialWebsites, initialEvaluaciones, initialAuditLogs, initialVulnerabilities } from '../mockData';

interface ReportsViewProps {
  websites?: WebsiteItem[];
  evaluaciones?: EvaluationItem[];
  auditLogs?: AuditLogItem[];
  onExportReport: (format: 'PDF' | 'EXCEL') => void;
}

type ReportTab = 
  | 'posture' 
  | 'severity' 
  | 'entities' 
  | 'top_vulns' 
  | 'mttr' 
  | 'audit';

// Historical seed data fallback for evaluations in 2025 and 2026
const extendedHistoricalEvaluaciones: EvaluationItem[] = [
  // 2025
  { id: 'eval-2025-01', target: 'regiontacna.gob.pe', date: '2025-02-14', score: 'D', critical: 3, high: 8, medium: 12, low: 18, status: 'Completado' },
  { id: 'eval-2025-02', target: 'mptacna.gob.pe', date: '2025-03-22', score: 'C', critical: 1, high: 4, medium: 7, low: 12, status: 'Completado' },
  { id: 'eval-2025-03', target: 'unjbg.edu.pe', date: '2025-05-18', score: 'B', critical: 0, high: 2, medium: 4, low: 8, status: 'Completado' },
  { id: 'eval-2025-04', target: 'diresatacna.gob.pe', date: '2025-06-30', score: 'F', critical: 5, high: 9, medium: 14, low: 22, status: 'Completado' },
  { id: 'eval-2025-05', target: 'epstacna.com.pe', date: '2025-08-12', score: 'C', critical: 2, high: 5, medium: 8, low: 10, status: 'Completado' },
  { id: 'eval-2025-06', target: 'cmactacna.com.pe', date: '2025-10-04', score: 'A', critical: 0, high: 0, medium: 2, low: 4, status: 'Completado' },
  { id: 'eval-2025-07', target: 'zofratacna.com.pe', date: '2025-11-20', score: 'D', critical: 3, high: 6, medium: 9, low: 15, status: 'Completado' },

  // 2026
  { id: 'eval-2026-01', target: 'regiontacna.gob.pe', date: '2026-01-15', score: 'C', critical: 2, high: 6, medium: 8, low: 14, status: 'Completado' },
  { id: 'eval-2026-02', target: 'mptacna.gob.pe', date: '2026-02-18', score: 'B', critical: 1, high: 3, medium: 5, low: 9, status: 'Completado' },
  { id: 'eval-2026-03', target: 'diresatacna.gob.pe', date: '2026-03-12', score: 'D', critical: 4, high: 7, medium: 10, low: 16, status: 'Completado' },
  { id: 'eval-2026-04', target: 'unjbg.edu.pe', date: '2026-04-20', score: 'A', critical: 0, high: 1, medium: 2, low: 5, status: 'Completado' },
  { id: 'eval-2026-05', target: 'dretacna.gob.pe', date: '2026-05-14', score: 'C', critical: 1, high: 4, medium: 6, low: 8, status: 'Completado' },
  { id: 'eval-2026-06', target: 'epstacna.com.pe', date: '2026-06-22', score: 'C', critical: 2, high: 4, medium: 5, low: 7, status: 'Completado' },
  { id: 'eval-2026-07', target: 'cmactacna.com.pe', date: '2026-07-08', score: 'A', critical: 0, high: 0, medium: 1, low: 2, status: 'Completado' },
  { id: 'eval-2026-08', target: 'zofratacna.com.pe', date: '2026-08-19', score: 'C', critical: 2, high: 3, medium: 5, low: 8, status: 'Completado' },
  { id: 'eval-2026-09', target: 'diresatacna.gob.pe', date: '2026-09-30', score: 'D', critical: 4, high: 6, medium: 5, low: 3, status: 'Completado' },
  { id: 'eval-2026-10', target: 'mptacna.gob.pe', date: '2026-10-20', score: 'B', critical: 1, high: 2, medium: 2, low: 1, status: 'Completado' },
  { id: 'eval-2026-11', target: 'regiontacna.gob.pe', date: '2026-10-24', score: 'D', critical: 3, high: 5, medium: 4, low: 3, status: 'Completado' }
];

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  websites = initialWebsites, 
  evaluaciones = initialEvaluaciones, 
  auditLogs = initialAuditLogs,
  onExportReport 
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('posture');
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('Todos');
  const [selectedDay, setSelectedDay] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [downloading, setDownloading] = useState<string | null>(null);

  // Combine live evaluaciones with extended historical dataset for rich BI analysis
  const allEvaluations = useMemo(() => {
    const combined = [...evaluaciones];
    for (const h of extendedHistoricalEvaluaciones) {
      if (!combined.some(e => e.id === h.id)) {
        combined.push(h);
      }
    }
    return combined;
  }, [evaluaciones]);

  // Months dictionary
  const months = [
    { value: 'Todos', label: 'Todos los Meses' },
    { value: '01', label: '01 - Enero' },
    { value: '02', label: '02 - Febrero' },
    { value: '03', label: '03 - Marzo' },
    { value: '04', label: '04 - Abril' },
    { value: '05', label: '05 - Mayo' },
    { value: '06', label: '06 - Junio' },
    { value: '07', label: '07 - Julio' },
    { value: '08', label: '08 - Agosto' },
    { value: '09', label: '09 - Setiembre' },
    { value: '10', label: '10 - Octubre' },
    { value: '11', label: '11 - Noviembre' },
    { value: '12', label: '12 - Diciembre' },
  ];

  // Filter evaluations by Year, Month, Day, and Category
  const filteredEvaluations = useMemo(() => {
    return allEvaluations.filter(e => {
      const rawDate = e.date || '';
      // Extract YYYY-MM-DD
      let y = '', m = '', d = '';
      if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
        const parts = rawDate.split('-');
        y = parts[0];
        m = parts[1];
        d = parts[2].substring(0, 2);
      } else if (rawDate.includes('2025')) {
        y = '2025';
      } else if (rawDate.includes('2026')) {
        y = '2026';
      }

      if (selectedYear !== 'Todos' && y && y !== selectedYear) return false;
      if (selectedMonth !== 'Todos' && m && m !== selectedMonth) return false;
      if (selectedDay !== 'Todos' && d && Number(d) !== Number(selectedDay)) return false;

      // Category filter matching website
      if (selectedCategory !== 'Todas') {
        const site = websites.find(w => w.url.includes(e.target) || e.target.includes(w.url.replace(/^https?:\/\//, '')));
        if (site && site.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [allEvaluations, selectedYear, selectedMonth, selectedDay, selectedCategory, websites]);

  // Filter audit logs by Year, Month, Day
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const ts = log.timestamp || '';
      let y = '', m = '', d = '';
      if (/^\d{4}-\d{2}-\d{2}/.test(ts)) {
        const parts = ts.split('-');
        y = parts[0];
        m = parts[1];
        d = parts[2].substring(0, 2);
      } else if (ts.includes('2025')) {
        y = '2025';
      } else if (ts.includes('2026')) {
        y = '2026';
      }

      if (selectedYear !== 'Todos' && y && y !== selectedYear) return false;
      if (selectedMonth !== 'Todos' && m && m !== selectedMonth) return false;
      if (selectedDay !== 'Todos' && d && Number(d) !== Number(selectedDay)) return false;

      return true;
    });
  }, [auditLogs, selectedYear, selectedMonth, selectedDay]);

  // Aggregate Metrics for Active Filter
  const stats = useMemo(() => {
    const totalEvals = filteredEvaluations.length;
    const totalCrit = filteredEvaluations.reduce((sum, e) => sum + (e.critical || 0), 0);
    const totalHigh = filteredEvaluations.reduce((sum, e) => sum + (e.high || 0), 0);
    const totalMed = filteredEvaluations.reduce((sum, e) => sum + (e.medium || 0), 0);
    const totalLow = filteredEvaluations.reduce((sum, e) => sum + (e.low || 0), 0);
    const totalFindings = totalCrit + totalHigh + totalMed + totalLow;

    // Score breakdown
    const scoreCounts = { A: 0, 'B+': 0, B: 0, C: 0, D: 0, F: 0 };
    filteredEvaluations.forEach(e => {
      if (e.score && scoreCounts[e.score] !== undefined) {
        scoreCounts[e.score]++;
      }
    });

    const avgRiskIndex = totalFindings > 0 
      ? Math.min(100, Math.round(((totalCrit * 10 + totalHigh * 6 + totalMed * 3 + totalLow * 1) / (totalEvals || 1)) * 1.5))
      : 0;

    return { totalEvals, totalCrit, totalHigh, totalMed, totalLow, totalFindings, scoreCounts, avgRiskIndex };
  }, [filteredEvaluations]);

  // Export to CSV Function
  const handleExportCSV = () => {
    setDownloading('EXCEL');
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeTab === 'posture' || activeTab === 'severity') {
      csvContent += 'ID,Objetivo,Fecha,Score,Criticas,Altas,Medias,Bajas,Estado\r\n';
      filteredEvaluations.forEach(e => {
        csvContent += `"${e.id}","${e.target}","${e.date}","${e.score}",${e.critical},${e.high},${e.medium},${e.low},"${e.status}"\r\n`;
      });
    } else if (activeTab === 'entities') {
      csvContent += 'ID,Nombre,Institucion,Categoria,URL,IP,Vulnerabilidades,RiskScore,NivelRiesgo\r\n';
      websites.forEach(w => {
        csvContent += `"${w.id}","${w.name}","${w.institution}","${w.category}","${w.url}","${w.ip}",${w.vulnCount},${w.riskScore},"${w.riskLevel}"\r\n`;
      });
    } else if (activeTab === 'audit') {
      csvContent += 'ID,Timestamp,Actor,Email,Rol,Evento,Severidad,Target,SHA256\r\n';
      filteredAuditLogs.forEach(l => {
        csvContent += `"${l.id}","${l.timestamp}","${l.actor.name}","${l.actor.email}","${l.actor.role}","${l.eventType}","${l.severity}","${l.target}","${l.sha256Checksum}"\r\n`;
      });
    } else {
      csvContent += 'CVE,Nombre,Severidad,CVSS,OWASP,Impacto\r\n';
      initialVulnerabilities.forEach(v => {
        csvContent += `"${v.cve}","${v.name}","${v.severity}",${v.cvssScore},"${v.owaspCategory}","${v.attackVector}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tacna_SOC_Reporte_${activeTab}_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onExportReport('EXCEL');
    setTimeout(() => setDownloading(null), 1500);
  };

  const handlePrint = () => {
    setDownloading('PDF');
    onExportReport('PDF');
    setTimeout(() => {
      window.print();
      setDownloading(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans text-2xl font-extrabold text-slate-900 tracking-tight">
                Módulo BI: Inteligencia de Ciberseguridad & Reportes
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Plataforma Analítica SOC Tacna • Filtros Multidimensionales de Tiempo (Año, Mes, Día)
              </p>
            </div>
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={downloading !== null}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{downloading === 'EXCEL' ? 'Generando CSV...' : 'Exportar CSV / Excel'}</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={downloading !== null}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{downloading === 'PDF' ? 'Preparando...' : 'Descargar PDF / Imprimir'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filter Bar (Year, Month, Day, Category) */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-red-500" />
            <span>Filtros Analíticos de Tiempo y Entidad (Cubo OLAP)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Registros Coincidentes: <strong className="text-red-400">{filteredEvaluations.length} evaluaciones</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Año */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Año Fiscal</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="Todos">Todos los Años (2025 - 2026)</option>
              <option value="2026">2026 (En Curso)</option>
              <option value="2025">2025 (Histórico)</option>
            </select>
          </div>

          {/* Mes */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Día */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Día del Mes</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="Todos">Todos los Días</option>
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = String(i + 1).padStart(2, '0');
                return <option key={dayNum} value={dayNum}>Día {dayNum}</option>;
              })}
            </select>
          </div>

          {/* Categoría Institucional Universal */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Sector Institucional</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todos los Sectores</option>
              <option value="Gobierno">🏛️ Gobierno Regional y Provincial</option>
              <option value="Salud">🏥 Salud (DIRESA / Hospitales)</option>
              <option value="Educación">🎓 Educación (UNJBG / DRET)</option>
              <option value="Finanzas">🏦 Finanzas (Caja Tacna)</option>
              <option value="Tecnología / SaaS">💻 Tecnología / SaaS</option>
              <option value="E-Commerce / Retail">🛒 E-Commerce / Retail</option>
              <option value="Corporativo / Empresa">🏢 Corporativo / Empresa</option>
              <option value="Medios / Blog">📰 Medios / Blog</option>
              <option value="General / Otro">🌐 General / Otro</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Reset */}
        {(selectedYear !== 'Todos' || selectedMonth !== 'Todos' || selectedDay !== 'Todos' || selectedCategory !== 'Todas') && (
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400">Filtros Activos:</span>
              {selectedYear !== 'Todos' && <span className="bg-red-950 border border-red-800 text-red-200 px-2 py-0.5 rounded-md font-mono text-[11px]">Año: {selectedYear}</span>}
              {selectedMonth !== 'Todos' && <span className="bg-red-950 border border-red-800 text-red-200 px-2 py-0.5 rounded-md font-mono text-[11px]">Mes: {selectedMonth}</span>}
              {selectedDay !== 'Todos' && <span className="bg-red-950 border border-red-800 text-red-200 px-2 py-0.5 rounded-md font-mono text-[11px]">Día: {selectedDay}</span>}
              {selectedCategory !== 'Todas' && <span className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">Sector: {selectedCategory}</span>}
            </div>
            <button
              onClick={() => {
                setSelectedYear('Todos');
                setSelectedMonth('Todos');
                setSelectedDay('Todos');
                setSelectedCategory('Todas');
              }}
              className="text-red-400 hover:text-red-300 font-mono text-xs underline cursor-pointer"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Ribbon based on Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">Evaluaciones Totales</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-slate-900">{stats.totalEvals}</span>
            <span className="text-xs text-slate-500 font-sans">en el periodo</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono mt-1 block font-semibold">100% Verificadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">Vulnerabilidades Críticas</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-red-600">{stats.totalCrit}</span>
            <span className="text-xs text-slate-500 font-sans">CVSS &ge; 9.0</span>
          </div>
          <span className="text-[11px] text-red-700 font-mono mt-1 block font-semibold">Prioridad Inmediata P1</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">Vulnerabilidades Altas</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-amber-600">{stats.totalHigh}</span>
            <span className="text-xs text-slate-500 font-sans">CVSS 7.0 - 8.9</span>
          </div>
          <span className="text-[11px] text-amber-700 font-mono mt-1 block font-semibold">Remediación en 72h</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">Índice Global de Riesgo</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`font-mono text-3xl font-black ${stats.avgRiskIndex > 60 ? 'text-red-600' : stats.avgRiskIndex > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {stats.avgRiskIndex} / 100
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">
            {stats.avgRiskIndex > 60 ? 'Riesgo Crítico Regional' : stats.avgRiskIndex > 30 ? 'Riesgo Moderado' : 'Zona Segura'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs for the 6 Reports */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 pb-1">
        {[
          { id: 'posture', label: '1. Tendencia de Postura (A-F)', icon: TrendingUp },
          { id: 'severity', label: '2. Matriz de Severidad', icon: PieChart },
          { id: 'entities', label: '3. Ranking de Exposición Entidades', icon: Building },
          { id: 'top_vulns', label: '4. Top 10 CVEs y OWASP', icon: ShieldAlert },
          { id: 'mttr', label: '5. Mitigación y MTTR', icon: Clock },
          { id: 'audit', label: '6. Bitácora de Auditoría SHA-256', icon: Hash }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-red-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report 1: Tendencia Histórica de Postura de Seguridad */}
      {activeTab === 'posture' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-sans text-lg font-bold text-slate-900">
                Reporte 1: Tendencia Histórica de Postura de Seguridad
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribución de calificaciones de seguridad (Score A, B+, B, C, D, F) en el rango temporal seleccionado.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400">Total Evaluaciones: {filteredEvaluations.length}</span>
          </div>

          {/* Calificaciones Score Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { score: 'A', label: 'Excelente (0 Vulns)', count: stats.scoreCounts.A, color: 'emerald' },
              { score: 'B+', label: 'Muy Bueno', count: stats.scoreCounts['B+'], color: 'emerald' },
              { score: 'B', label: 'Aceptable', count: stats.scoreCounts.B, color: 'blue' },
              { score: 'C', label: 'Riesgo Moderado', count: stats.scoreCounts.C, color: 'amber' },
              { score: 'D', label: 'Deficiente', count: stats.scoreCounts.D, color: 'orange' },
              { score: 'F', label: 'Crítico / Falla', count: stats.scoreCounts.F, color: 'red' },
            ].map(item => (
              <div key={item.score} className={`p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between`}>
                <span className="font-mono text-2xl font-black text-slate-900">{item.score}</span>
                <span className="font-mono text-xl font-bold text-slate-700 mt-2">{item.count}</span>
                <span className="text-[10px] text-slate-500 font-sans mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Gráfico Visual: Histograma de Postura de Seguridad */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-red-600" />
                <span>Gráfico de Frecuencia de Calificaciones de Seguridad</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">Distribución en el periodo</span>
            </div>
            <div className="h-28 flex items-end gap-3 pt-4 px-2">
              {[
                { score: 'A', count: stats.scoreCounts.A, color: 'bg-emerald-500' },
                { score: 'B+', count: stats.scoreCounts['B+'], color: 'bg-emerald-400' },
                { score: 'B', count: stats.scoreCounts.B, color: 'bg-blue-500' },
                { score: 'C', count: stats.scoreCounts.C, color: 'bg-amber-500' },
                { score: 'D', count: stats.scoreCounts.D, color: 'bg-orange-500' },
                { score: 'F', count: stats.scoreCounts.F, color: 'bg-red-600' },
              ].map(b => {
                const maxCount = Math.max(...Object.values(stats.scoreCounts), 1);
                const heightPct = Math.max(12, Math.round((b.count / maxCount) * 100));
                return (
                  <div key={b.score} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-slate-600">{b.count}</span>
                    <div 
                      style={{ height: `${heightPct}%` }} 
                      className={`w-full rounded-t-lg transition-all duration-300 ${b.color}`} 
                    />
                    <span className="text-xs font-mono font-bold text-slate-800">{b.score}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evaluations Historical Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Objetivo Monitoreado</th>
                  <th className="py-2.5 px-3">Fecha Evaluación</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3 text-center">Críticas</th>
                  <th className="py-2.5 px-3 text-center">Altas</th>
                  <th className="py-2.5 px-3 text-center">Medias</th>
                  <th className="py-2.5 px-3 text-center">Bajas</th>
                  <th className="py-2.5 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvaluations.slice(0, 10).map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono">{e.target}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{e.date}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        e.score === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        e.score === 'B' || e.score === 'B+' ? 'bg-blue-100 text-blue-800' :
                        e.score === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {e.score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-red-600 font-bold">{e.critical}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-600 font-semibold">{e.high}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{e.medium}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{e.low}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Matriz de Severidad de Hallazgos */}
      {activeTab === 'severity' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans text-lg font-bold text-slate-900">
              Reporte 2: Matriz Acumulada de Severidad y Criticidad CVSS
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Volumen y proporciones de vulnerabilidades por impacto perimetral en el periodo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-red-700 uppercase">Críticas (CVSS 9-10)</span>
              <span className="font-mono text-3xl font-black text-red-600 block mt-2">{stats.totalCrit}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Riesgo de compromiso total</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-amber-700 uppercase">Altas (CVSS 7-8.9)</span>
              <span className="font-mono text-3xl font-black text-amber-600 block mt-2">{stats.totalHigh}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Exfiltración y evasión</span>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase">Medias (CVSS 4-6.9)</span>
              <span className="font-mono text-3xl font-black text-blue-600 block mt-2">{stats.totalMed}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Fallas de configuración</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-slate-700 uppercase">Bajas (CVSS 0.1-3.9)</span>
              <span className="font-mono text-3xl font-black text-slate-700 block mt-2">{stats.totalLow}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Divulgación de cabeceras</span>
            </div>
          </div>

          {/* Proportion Visual Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-600">
              <span>Distribución Relativa:</span>
              <span>Total Hallazgos: {stats.totalFindings}</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: `${(stats.totalCrit / (stats.totalFindings || 1)) * 100}%` }} className="bg-red-600" title="Críticas" />
              <div style={{ width: `${(stats.totalHigh / (stats.totalFindings || 1)) * 100}%` }} className="bg-amber-500" title="Altas" />
              <div style={{ width: `${(stats.totalMed / (stats.totalFindings || 1)) * 100}%` }} className="bg-blue-500" title="Medias" />
              <div style={{ width: `${(stats.totalLow / (stats.totalFindings || 1)) * 100}%` }} className="bg-slate-400" title="Bajas" />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span className="text-red-600 font-bold">● Críticas ({Math.round((stats.totalCrit / (stats.totalFindings || 1)) * 100)}%)</span>
              <span className="text-amber-600 font-bold">● Altas ({Math.round((stats.totalHigh / (stats.totalFindings || 1)) * 100)}%)</span>
              <span className="text-blue-600 font-bold">● Medias ({Math.round((stats.totalMed / (stats.totalFindings || 1)) * 100)}%)</span>
              <span className="text-slate-500 font-bold">● Bajas ({Math.round((stats.totalLow / (stats.totalFindings || 1)) * 100)}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Report 3: Ranking de Exposición por Entidad Regional */}
      {activeTab === 'entities' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans text-lg font-bold text-slate-900">
              Reporte 3: Ranking de Exposición de Entidades Regionales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Matriz priorizada de activos web según Índice de Riesgo (Risk Score 0 - 100) y categoría.
            </p>
          </div>

          {/* Gráfico Visual: Top 5 Activos con Mayor Exposición */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-red-600" />
              <span>Gráfico Comparativo de Nivel de Riesgo (Risk Score 0 - 100)</span>
            </span>
            <div className="space-y-2 pt-1">
              {[...websites]
                .filter(w => selectedCategory === 'Todas' || w.category === selectedCategory)
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 5)
                .map(w => (
                  <div key={w.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-bold text-slate-800 truncate">{w.name} ({w.category})</span>
                      <span className="font-black text-red-600">{w.riskScore} / 100</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${w.riskScore}%` }} 
                        className={`h-full rounded-full transition-all duration-300 ${w.riskScore > 75 ? 'bg-red-600' : w.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3"># Ranking</th>
                  <th className="py-2.5 px-3">Activo Web</th>
                  <th className="py-2.5 px-3">Institución</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3 text-center">Risk Score</th>
                  <th className="py-2.5 px-3 text-center">Nivel de Riesgo</th>
                  <th className="py-2.5 px-3 text-center">Vulns Activas</th>
                  <th className="py-2.5 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...websites]
                  .filter(w => selectedCategory === 'Todas' || w.category === selectedCategory)
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .map((w, idx) => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{w.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{w.institution}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                          {w.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-sm font-black text-red-600">
                        {w.riskScore}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.riskLevel === 'Crítico' ? 'bg-red-100 text-red-800' :
                          w.riskLevel === 'Alto' ? 'bg-amber-100 text-amber-800' :
                          w.riskLevel === 'Medio' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {w.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">{w.vulnCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">{w.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 4: Top 10 Vulnerabilidades Recurrentes y OWASP */}
      {activeTab === 'top_vulns' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans text-lg font-bold text-slate-900">
              Reporte 4: Top CVEs Recurrentes y Categorías OWASP
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Vulnerabilidades de mayor prevalencia en la infraestructura regional de Tacna.
            </p>
          </div>

          {/* Gráfico Visual: Distribución de Frecuencia OWASP Top 10 */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-red-600" />
              <span>Gráfico de Frecuencia por Categoría OWASP Top 10</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs pt-1">
              {[
                { label: 'A01 Broken Access', pct: 28, color: 'bg-red-600' },
                { label: 'A03 Injection', pct: 24, color: 'bg-amber-500' },
                { label: 'A05 Misconfig', pct: 22, color: 'bg-orange-500' },
                { label: 'A02 Cryptographic', pct: 14, color: 'bg-blue-600' },
                { label: 'A06 Outdated Comp', pct: 12, color: 'bg-slate-600' },
              ].map(cat => (
                <div key={cat.label} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">{cat.label}</span>
                  <div className="flex items-center justify-between">
                    <div className="h-2 flex-1 mr-2 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${cat.pct * 3}%` }} className={`h-full rounded-full ${cat.color}`} />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{cat.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialVulnerabilities.map(v => (
              <div key={v.cve} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-red-600">{v.cve}</span>
                    <h4 className="font-sans text-sm font-bold text-slate-900 mt-0.5">{v.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                    v.cvssScore >= 9.0 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    CVSS {v.cvssScore}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{v.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                  <span>OWASP: {v.owaspCategory.split('-')[0]}</span>
                  <span>Vector: {v.attackVector}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report 5: Mitigación y Tiempo Medio de Remediación (MTTR) */}
      {activeTab === 'mttr' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans text-lg font-bold text-slate-900">
              Reporte 5: Eficacia de Mitigación y Tiempo de Respuesta (MTTR)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rendimiento del equipo CSIRT Tacna en la resolución de incidentes y parches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">MTTR Crítico Promedio</span>
              <span className="font-mono text-3xl font-black text-slate-900 block mt-2">3.4 Días</span>
              <span className="text-[11px] text-emerald-600 font-mono font-semibold mt-1 block">-22% vs histórico 2025</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Tasa de Cierre de CVEs</span>
              <span className="font-mono text-3xl font-black text-emerald-600 block mt-2">78.5%</span>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Meta regional: &ge; 75%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Reincidencia de Falla</span>
              <span className="font-mono text-3xl font-black text-amber-600 block mt-2">8.2%</span>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Concentrada en puertos legacy</span>
            </div>
          </div>

          {/* Gráfico Visual: SLAs de Cumplimiento de MTTR */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>Gráfico de Cumplimiento de SLAs de Mitigación por Criticidad</span>
            </span>
            <div className="space-y-2 text-xs font-mono pt-1">
              {[
                { sev: 'Crítica (< 24h)', pct: 92, count: '3.4 días promedio', color: 'bg-red-600' },
                { sev: 'Alta (< 72h)', pct: 86, count: '5.2 días promedio', color: 'bg-amber-500' },
                { sev: 'Media (< 14d)', pct: 95, count: '8.1 días promedio', color: 'bg-blue-600' },
                { sev: 'Baja (< 30d)', pct: 98, count: '14.5 días promedio', color: 'bg-slate-500' },
              ].map(sla => (
                <div key={sla.sev} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-800">{sla.sev}</span>
                    <span className="text-slate-500">{sla.pct}% resuelto en SLA ({sla.count})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div style={{ width: `${sla.pct}%` }} className={`h-full rounded-full ${sla.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Conclusiones de Cumplimiento Técnico</span>
            </h4>
            <p>
              Durante el periodo analizado, el tiempo medio de resolución de vulnerabilidades críticas en el Gobierno Regional y Direcciones Regionales se redujo a menos de 4 días laborables, cumpliendo con los estándares de la Secretaría de Gobierno y Transformación Digital (SGTD).
            </p>
          </div>
        </div>
      )}

      {/* Report 6: Bitácora Analítica de Auditoría SHA-256 */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans text-lg font-bold text-slate-900">
              Reporte 6: Bitácora Analítica de Auditoría y Trazabilidad Criptográfica
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro inmutable de acciones administrativas con verificación de suma SHA-256.
            </p>
          </div>

          {/* Gráfico Visual: Frecuencia de Eventos en Bitácora */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-red-600" />
              <span>Gráfico de Actividad por Tipo de Evento en Bitácora</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs pt-1">
              {[
                { type: 'SCAN_COMPLETED', label: 'Escaneos Ejecutados', count: filteredAuditLogs.filter(l => l.eventType === 'SCAN_COMPLETED' || l.eventType === 'SCAN_TRIGGERED').length || 12, color: 'bg-emerald-500' },
                { type: 'AUTH_LOGIN', label: 'Inicios de Sesión', count: filteredAuditLogs.filter(l => l.eventType?.includes('LOGIN') || l.eventType?.includes('AUTH')).length || 8, color: 'bg-blue-500' },
                { type: 'USER_MGMT', label: 'Gestión de Usuarios', count: filteredAuditLogs.filter(l => l.eventType?.includes('USER')).length || 4, color: 'bg-purple-500' },
                { type: 'CONFIG', label: 'Ajustes y Exportes', count: filteredAuditLogs.filter(l => l.eventType?.includes('CONFIG') || l.eventType?.includes('REPORT')).length || 6, color: 'bg-amber-500' },
              ].map(ev => (
                <div key={ev.type} className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center shadow-xs">
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">{ev.label}</span>
                    <span className="text-[10px] text-slate-400">{ev.type}</span>
                  </div>
                  <span className="font-mono text-base font-black text-slate-900">{ev.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Actor / Rol</th>
                  <th className="py-2.5 px-3">Acción Ejecutada</th>
                  <th className="py-2.5 px-3">Objetivo</th>
                  <th className="py-2.5 px-3 text-center">Severidad</th>
                  <th className="py-2.5 px-3 text-right">Integridad (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>{log.actor.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.actor.role}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{log.eventType}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.target}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        log.severity === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                        log.severity === 'AUDIT' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-400" title={log.sha256Checksum}>
                      {log.sha256Checksum ? `${log.sha256Checksum.slice(0, 10)}...${log.sha256Checksum.slice(-6)}` : 'Sin hash'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
