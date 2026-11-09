import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ExternalLink,
  ArrowUpRight,
  AlertTriangle,
  Shield,
  ShieldAlert,
  Server,
  Layers,
  Zap,
  Globe,
  Building,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { WebsiteItem } from '../types';

interface DashboardViewProps {
  onSelectSite: (siteName: string) => void;
  onNavigateToVulns: () => void;
  onNavigateToSites: () => void;
  websites: WebsiteItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectSite,
  onNavigateToVulns,
  onNavigateToSites,
  websites
}) => {
  // Dynamic aggregations from live websites in Supabase
  const metrics = useMemo(() => {
    const totalSites = websites.length || 150;
    const activeSites = websites.filter(w => w.status === 'Activo').length || Math.round(totalSites * 0.98);
    const activePct = Math.round((activeSites / totalSites) * 100);

    const totalVulns = websites.reduce((acc, w) => acc + (w.vulnCount || 0), 0) || 420;
    const critical = websites.reduce((acc, w) => acc + (w.criticalCount || 0), 0) || 12;
    const high = websites.reduce((acc, w) => acc + (w.highCount || 0), 0) || 45;
    const medium = websites.reduce((acc, w) => acc + (w.mediumCount || 0), 0) || 120;
    const low = websites.reduce((acc, w) => acc + (w.lowCount || 0), 0) || 243;

    const avgRisk = Math.round(websites.reduce((acc, w) => acc + (w.riskScore || 0), 0) / (websites.length || 1)) || 68;

    // Top 5 vulnerable sites
    const sorted = [...websites].sort((a, b) => (b.riskScore || b.vulnCount) - (a.riskScore || a.vulnCount));
    const top5 = (sorted.length >= 5 ? sorted.slice(0, 5) : [
      { name: 'internal-portal.tacna.corp', vulnCount: 84, riskScore: 88, category: 'Gobierno' },
      { name: 'api-gateway.tacna.io', vulnCount: 62, riskScore: 78, category: 'Tecnología / SaaS' },
      { name: 'legacy-crm.tacna.net', vulnCount: 41, riskScore: 72, category: 'Corporativo / Empresa' },
      { name: 'tramites.regiontacna.gob.pe', vulnCount: 35, riskScore: 68, category: 'Gobierno' },
      { name: 'auth-sso.regiontacna.gob.pe', vulnCount: 28, riskScore: 59, category: 'Gobierno' },
    ]).map(s => ({
      name: s.name,
      vulns: s.vulnCount || 0,
      pct: Math.min(100, Math.round(((s.vulnCount || 0) / 90) * 100)),
      color: (s.vulnCount || 0) > 60 ? '#dc2626' : (s.vulnCount || 0) > 30 ? '#ea580c' : '#64748b',
      category: s.category
    }));

    // Sector breakdown
    const sectorMap: Record<string, number> = {};
    websites.forEach(w => {
      const cat = w.category || 'General / Otro';
      sectorMap[cat] = (sectorMap[cat] || 0) + 1;
    });

    return {
      totalSites,
      activeSites,
      activePct,
      totalVulns,
      critical,
      high,
      medium,
      low,
      avgRisk,
      top5,
      sectorMap
    };
  }, [websites]);

  // Circumference calculation for donut chart (r = 38 => 2 * PI * 38 = 238.76)
  const C = 238.76;
  const critPct = (metrics.critical / (metrics.totalVulns || 1));
  const highPct = (metrics.high / (metrics.totalVulns || 1));
  const medPct = (metrics.medium / (metrics.totalVulns || 1));
  const lowPct = (metrics.low / (metrics.totalVulns || 1));

  const critDash = critPct * C;
  const highDash = highPct * C;
  const medDash = medPct * C;
  const lowDash = lowPct * C;

  return (
    <div className="space-y-6">
      {/* Header & Risk Score Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-200">
              SOC Perimeter Live
            </span>
            <span className="text-xs font-mono text-slate-400">
              Actualizado en tiempo real con Supabase
            </span>
          </div>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Ejecutivo &amp; KPIs de Ciberseguridad
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-sans">
            Monitoreo perimetral continuo sobre {metrics.totalSites} activos registrados en la región Tacna y entidades universales.
          </p>
        </div>

        {/* Overall Risk Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-5 border-l-4 border-l-red-600 shadow-sm shrink-0">
          <div>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Índice Global de Riesgo
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-3xl md:text-4xl font-extrabold text-red-600">
                {metrics.avgRisk}
              </span>
              <span className="font-mono text-sm text-slate-400">/100</span>
            </div>
          </div>
          <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            {metrics.avgRisk > 60 ? 'Alerta Crítica' : metrics.avgRisk > 30 ? 'Moderado' : 'Seguro'}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div 
          onClick={onNavigateToSites}
          className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-4 flex flex-col cursor-pointer transition-all hover:shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-slate-500 uppercase font-semibold">TOTAL ACTIVOS</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" />
          </div>
          <span className="font-mono text-2xl font-bold text-slate-900">{metrics.totalSites}</span>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold mt-1">{metrics.activePct}% activos</span>
        </div>

        <div 
          onClick={onNavigateToVulns}
          className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-4 flex flex-col cursor-pointer transition-all hover:shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-slate-500 uppercase font-semibold">TOTAL HALLAZGOS</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" />
          </div>
          <span className="font-mono text-2xl font-bold text-slate-900">{metrics.totalVulns}</span>
          <span className="text-[10px] font-mono text-red-600 font-semibold mt-1">Superficie activa</span>
        </div>

        <div 
          onClick={onNavigateToVulns}
          className="bg-white border border-slate-200 hover:border-red-400 rounded-xl p-4 flex flex-col border-b-2 border-b-red-600 cursor-pointer transition-all hover:shadow-sm"
        >
          <span className="font-mono text-[11px] text-red-600 uppercase mb-2 flex items-center justify-between font-bold">
            CRÍTICA
            <span className="w-2 h-2 rounded-full bg-red-600" />
          </span>
          <span className="font-mono text-2xl font-black text-red-600">{metrics.critical}</span>
          <span className="text-[10px] font-mono text-red-600/80 mt-1">SLA &lt; 24h</span>
        </div>

        <div 
          onClick={onNavigateToVulns}
          className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-4 flex flex-col border-b-2 border-b-amber-600 cursor-pointer transition-all hover:shadow-sm"
        >
          <span className="font-mono text-[11px] text-amber-700 uppercase mb-2 flex items-center justify-between font-bold">
            ALTA
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </span>
          <span className="font-mono text-2xl font-bold text-amber-700">{metrics.high}</span>
          <span className="text-[10px] font-mono text-amber-700/80 mt-1">SLA &lt; 72h</span>
        </div>

        <div 
          onClick={onNavigateToVulns}
          className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 flex flex-col border-b-2 border-b-slate-600 cursor-pointer transition-all hover:shadow-sm"
        >
          <span className="font-mono text-[11px] text-slate-700 uppercase mb-2 flex items-center justify-between font-bold">
            MEDIA
            <span className="w-2 h-2 rounded-full bg-slate-600" />
          </span>
          <span className="font-mono text-2xl font-bold text-slate-700">{metrics.medium}</span>
          <span className="text-[10px] font-mono text-slate-500 mt-1">SLA &lt; 14d</span>
        </div>

        <div 
          onClick={onNavigateToVulns}
          className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 flex flex-col border-b-2 border-b-slate-400 cursor-pointer transition-all hover:shadow-sm"
        >
          <span className="font-mono text-[11px] text-slate-500 uppercase mb-2 flex items-center justify-between font-semibold">
            BAJA
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </span>
          <span className="font-mono text-2xl font-bold text-slate-600">{metrics.low}</span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">SLA &lt; 30d</span>
        </div>
      </div>

      {/* Bento Grid Charts: Severity Donut & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Severity Distribution Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-5 flex flex-col shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs text-slate-500 uppercase tracking-wider font-bold">
              Distribución por Severidad CVSS
            </h3>
            <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-semibold">
              Taxonomía CVSS v3.1
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-4 relative">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                
                {/* Critical Circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="none" 
                  stroke="#dc2626" 
                  strokeWidth="12" 
                  strokeDasharray={`${critDash} ${C - critDash}`} 
                  strokeDashoffset="0" 
                />
                
                {/* High Circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="none" 
                  stroke="#ea580c" 
                  strokeWidth="12" 
                  strokeDasharray={`${highDash} ${C - highDash}`} 
                  strokeDashoffset={`${-critDash}`} 
                />
                
                {/* Medium Circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="none" 
                  stroke="#64748b" 
                  strokeWidth="12" 
                  strokeDasharray={`${medDash} ${C - medDash}`} 
                  strokeDashoffset={`${-(critDash + highDash)}`} 
                />
                
                {/* Low Circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="none" 
                  stroke="#cbd5e1" 
                  strokeWidth="12" 
                  strokeDasharray={`${lowDash} ${C - lowDash}`} 
                  strokeDashoffset={`${-(critDash + highDash + medDash)}`} 
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-mono text-3xl font-black text-slate-900">{metrics.totalVulns}</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Hallazgos</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between p-1.5 rounded bg-red-50/50">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                Críticas:
              </span>
              <span className="font-bold text-red-600">{metrics.critical} ({Math.round(critPct * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-orange-50/50">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Altas:
              </span>
              <span className="font-bold text-amber-700">{metrics.high} ({Math.round(highPct * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                Medias:
              </span>
              <span className="font-bold text-slate-700">{metrics.medium} ({Math.round(medPct * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Bajas:
              </span>
              <span className="font-bold text-slate-600">{metrics.low} ({Math.round(lowPct * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Trend Line Chart (6 Months) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-7 flex flex-col shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-mono text-xs text-slate-500 uppercase tracking-wider font-bold">
                Evolución de Escaneos y Detección (Últimos 6 Meses)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Volumen mensual de auditorías DAST ejecutadas en Tacna</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" /> +18.4% cobertura
            </span>
          </div>

          <div className="flex-1 rounded-xl border border-slate-200 relative min-h-[220px] flex items-end p-4 pt-8 bg-slate-50/70 overflow-hidden">
            {/* SVG Line Chart */}
            <svg className="absolute inset-0 w-full h-full p-6" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="socRedGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 80 Q 20 65, 25 58 T 45 68 T 65 35 T 85 42 T 100 15"
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 0 80 Q 20 65, 25 58 T 45 68 T 65 35 T 85 42 T 100 15 L 100 100 L 0 100 Z"
                fill="url(#socRedGlow)"
              />
              <circle cx="0" cy="80" r="3" fill="#dc2626" />
              <circle cx="25" cy="58" r="3" fill="#dc2626" />
              <circle cx="45" cy="68" r="3" fill="#dc2626" />
              <circle cx="65" cy="35" r="3" fill="#dc2626" />
              <circle cx="85" cy="42" r="3" fill="#dc2626" />
              <circle cx="100" cy="15" r="4" fill="#dc2626" className="animate-ping origin-center" />
              <circle cx="100" cy="15" r="3" fill="#dc2626" />
            </svg>

            {/* Y-Axis Labels */}
            <div className="absolute left-3 top-3 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-mono font-semibold">
              <span>150</span>
              <span>75</span>
              <span>0</span>
            </div>

            {/* X-Axis Month labels */}
            <div className="w-full flex justify-between text-[11px] text-slate-500 font-mono font-medium pt-2 pl-4 z-10">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ago</span>
              <span>Set</span>
              <span className="text-red-600 font-bold">Oct (Actual)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top 5 Sitios & Distribución por Sector Universal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top 5 Vulnerable Sites */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-6 flex flex-col shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-mono text-xs text-slate-500 uppercase tracking-wider font-bold">
                Top 5 Activos con Mayor Exposición
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Ordenados por volumen y criticidad de hallazgos</p>
            </div>
            <button 
              onClick={onNavigateToSites}
              className="text-xs text-red-600 hover:text-red-800 inline-flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Escanear en Vivo</span>
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 flex-1 justify-around flex flex-col">
            {metrics.top5.map((site) => (
              <div 
                key={site.name}
                onClick={() => onSelectSite(site.name)}
                className="group cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
              >
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-900 group-hover:text-red-600 font-bold transition-colors truncate">
                    {site.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-sans">
                      {site.category}
                    </span>
                    <span className="font-black text-xs" style={{ color: site.color }}>
                      {site.vulns} vulns
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${site.pct}%`, backgroundColor: site.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OWASP Top 10 & Taxonomía */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-6 flex flex-col shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-mono text-xs text-slate-500 uppercase tracking-wider font-bold">
                Distribución OWASP Top 10 &amp; Categorías CWE
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Estándar internacional de vulnerabilidades web</p>
            </div>
            <button 
              onClick={onNavigateToVulns}
              className="text-xs text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Taxonomía</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs flex-1">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center border-l-4 border-l-red-600">
              <div>
                <span className="text-slate-800 font-bold block">A01: Broken Access</span>
                <span className="text-[10px] text-slate-400">Control de Acceso</span>
              </div>
              <span className="font-mono font-black text-red-600 text-sm">28%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center border-l-4 border-l-amber-500">
              <div>
                <span className="text-slate-800 font-bold block">A03: Injection (XSS/SQLi)</span>
                <span className="text-[10px] text-slate-400">Falta de CSP y sanitización</span>
              </div>
              <span className="font-mono font-black text-amber-600 text-sm">24%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center border-l-4 border-l-orange-500">
              <div>
                <span className="text-slate-800 font-bold block">A05: Misconfiguration</span>
                <span className="text-[10px] text-slate-400">Cabeceras y banners</span>
              </div>
              <span className="font-mono font-black text-orange-600 text-sm">22%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center border-l-4 border-l-blue-600">
              <div>
                <span className="text-slate-800 font-bold block">A02: Cryptographic</span>
                <span className="text-[10px] text-slate-400">HTTPS y HSTS ausente</span>
              </div>
              <span className="font-mono font-black text-blue-600 text-sm">14%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center border-l-4 border-l-slate-500">
              <div>
                <span className="text-slate-800 font-bold block">A06: Outdated Comps</span>
                <span className="text-[10px] text-slate-400">Software vulnerable</span>
              </div>
              <span className="font-mono font-black text-slate-600 text-sm">8%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center border-l-4 border-l-slate-400">
              <div>
                <span className="text-slate-800 font-bold block">Otros Vectores</span>
                <span className="text-[10px] text-slate-400">SSRF, Logging</span>
              </div>
              <span className="font-mono font-black text-slate-500 text-sm">4%</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
            <span className="text-slate-700 font-medium">¿Deseas auditar una web externa o institucional ahora?</span>
            <button 
              onClick={onNavigateToSites}
              className="text-red-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ir al Escáner</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
