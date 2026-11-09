import React from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Server, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertTriangle,
  Lock,
  Cpu
} from 'lucide-react';
import { WebsiteItem, VulnerabilityItem } from '../types';

interface WebsiteDetailViewProps {
  site: WebsiteItem;
  vulnerabilities: VulnerabilityItem[];
  onBack: () => void;
  onSelectVuln: (cve: string) => void;
  onReevaluate: (site: WebsiteItem) => void;
}

export const WebsiteDetailView: React.FC<WebsiteDetailViewProps> = ({
  site,
  vulnerabilities,
  onBack,
  onSelectVuln,
  onReevaluate
}) => {
  if (!site) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <p className="text-sm text-slate-600">Activo web no encontrado o sincronizando con Supabase...</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
        >
          Volver a la Lista
        </button>
      </div>
    );
  }

  const siteVulns = (vulnerabilities || []).filter(v => {
    if (!v?.affectedSites || !Array.isArray(v.affectedSites)) return false;
    const targetName = String(site?.name || '').toLowerCase();
    const targetUrl = String(site?.url || '').toLowerCase();
    const targetIp = String(site?.ip || '');

    return v.affectedSites.some((s: any) => {
      const sName = String(typeof s === 'string' ? s : s?.siteName || '').toLowerCase();
      const sIp = String(typeof s === 'object' && s ? s.ip || '' : '');
      
      return (
        (targetName && sName && sName.includes(targetName)) ||
        (targetUrl && sName && targetUrl.includes(sName)) ||
        (targetIp && sIp && targetIp === sIp)
      );
    });
  });

  return (
    <div className="space-y-6">
      {/* Back Button & Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
            title="Volver a Sitios Web"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">
                {site.name}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                site.riskLevel === 'Crítico' ? 'bg-red-50 text-red-700 border border-red-200' :
                site.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                Nivel {site.riskLevel}
              </span>
            </div>
            <a 
              href={site.url} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-red-600 font-mono inline-flex items-center gap-1 mt-0.5 transition-colors"
            >
              {site.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onReevaluate(site)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>Re-evaluar con DAST</span>
        </button>
      </div>

      {/* Top Bento Cards: Risk Score & Server Specs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Risk Assessment Score Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:col-span-4 flex flex-col justify-between shadow-xs">
          <div>
            <span className="font-mono text-xs text-slate-500 uppercase tracking-wider font-bold">
              Calificación de Seguridad Perimetral
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`font-mono text-5xl font-black ${
                site.riskScore >= 70 ? 'text-red-600' :
                site.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {site.riskScore}
              </span>
              <span className="font-mono text-sm text-slate-400">/100</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Índice ponderado según vectores CVSS, exposición de cabeceras HTTP y puertos descubiertos.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-4 mt-4 border-t border-slate-100 text-center font-mono text-xs">
            <div className="bg-red-50 p-2 rounded-lg border border-red-200">
              <span className="text-[10px] text-red-600 block uppercase font-bold">Crit</span>
              <span className="text-sm font-black text-red-700">{site.criticalCount}</span>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
              <span className="text-[10px] text-orange-600 block uppercase font-bold">Alto</span>
              <span className="text-sm font-bold text-orange-700">{site.highCount}</span>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] text-amber-600 block uppercase font-bold">Med</span>
              <span className="text-sm font-bold text-amber-700">{site.mediumCount}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Bajo</span>
              <span className="text-sm font-bold text-slate-700">{site.lowCount}</span>
            </div>
          </div>
        </div>

        {/* Server Specs & Perimeter Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:col-span-8 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs text-slate-500 uppercase tracking-wider font-bold">
                Telemetría y Huella de Infraestructura
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Activo en Producción
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">Dirección IP</span>
                <span className="text-slate-900 font-bold text-xs mt-0.5 block">{site.ip}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">Servidor Web</span>
                <span className="text-slate-900 font-bold text-xs mt-0.5 block">Nginx 1.22 (Vuln)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">Cifrado SSL/TLS</span>
                <span className="text-amber-700 font-bold text-xs mt-0.5 block">TLS 1.2 (Débil)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block">WAF Perimetral</span>
                <span className="text-red-700 font-bold text-xs mt-0.5 block">No detectado</span>
              </div>
            </div>
          </div>

          {/* Quick Remediations Guidance */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-4 text-xs">
            <span className="text-slate-900 font-semibold block mb-1">
              Plan de Acción Urgente Recomendado por el SOC:
            </span>
            <p className="text-slate-600 leading-relaxed font-sans">
              1. Aislar las rutas `/admin` y `/wp-json` mediante bloqueo en proxy inverso. <br />
              2. Actualizar el binario OpenSSH al release parcheado v9.8p1 y deshabilitar TLS 1.0/1.1 en cabeceras de Nginx.
            </p>
          </div>
        </div>
      </div>

      {/* Vulnerabilities Table for this site */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h3 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
              Vulnerabilidades Detectadas en este Activo ({siteVulns.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Filtradas de la base de datos nacional
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Código CVE</th>
                <th className="py-3 px-3">Título y Resumen</th>
                <th className="py-3 px-3 text-center">Score CVSS</th>
                <th className="py-3 px-3 text-center">Severidad</th>
                <th className="py-3 px-3">Categoría OWASP</th>
                <th className="py-3 px-3">Estado de Mitigación</th>
                <th className="py-3 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siteVulns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    No se han registrado vulnerabilidades activas en este portal.
                  </td>
                </tr>
              ) : (
                siteVulns.map((v) => (
                  <tr 
                    key={v.id} 
                    onClick={() => onSelectVuln(v.cve)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600 whitespace-nowrap">
                      {v.cve}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-900 block text-xs">
                        {v.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {v.description}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-xs">
                      <span className={`px-2 py-0.5 rounded ${
                        v.cvss >= 9 ? 'bg-red-100 text-red-800' :
                        v.cvss >= 7 ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {v.cvss}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        v.severity === 'Crítico' ? 'bg-red-50 text-red-700 border border-red-200' :
                        v.severity === 'Alto' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {v.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                      {v.owaspCategory}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        v.status === 'En Remediación' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        v.status === 'Identificado' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => onSelectVuln(v.cve)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                      >
                        Ver Guía &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
