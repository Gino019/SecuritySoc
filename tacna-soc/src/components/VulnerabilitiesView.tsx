import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertOctagon, 
  Clock, 
  CheckCircle2,
  BookOpen,
  X,
  Layers,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  Info,
  ExternalLink,
  ChevronDown,
  Lock,
  Cpu,
  FileCode,
  Shield,
  HelpCircle
} from 'lucide-react';
import { VulnerabilityItem } from '../types';

interface VulnerabilitiesViewProps {
  vulnerabilities: VulnerabilityItem[];
  onSelectVuln: (cve: string) => void;
}

export const VulnerabilitiesView: React.FC<VulnerabilitiesViewProps> = ({
  vulnerabilities,
  onSelectVuln
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('Todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [showTaxonomyModal, setShowTaxonomyModal] = useState<boolean>(false);
  const [activeTaxonomyTab, setActiveTaxonomyTab] = useState<'cvss' | 'owasp' | 'matrix'>('cvss');

  const severities = ['Todas', 'Crítica', 'Alta', 'Media', 'Baja'];

  const categories = [
    { id: 'Todas', label: 'Todas las Categorías', badge: 'OWASP / CWE' },
    { id: 'A01', label: 'A01: Broken Access Control', badge: 'CWE-284' },
    { id: 'A02', label: 'A02: Cryptographic Failures', badge: 'CWE-310' },
    { id: 'A03', label: 'A03: Injection', badge: 'CWE-89' },
    { id: 'A05', label: 'A05: Security Misconfiguration', badge: 'CWE-16' },
    { id: 'A06', label: 'A06: Vulnerable Components', badge: 'CWE-1104' },
    { id: 'Headers', label: 'Cabeceras HTTP / Perímetro', badge: 'HSTS/CSP' }
  ];

  const filteredVulns = vulnerabilities.filter(v => {
    const term = (searchTerm || '').toLowerCase();
    const cve = String(v?.cve || '').toLowerCase();
    const title = String(v?.title || (v as any)?.name || '').toLowerCase();
    const description = String(v?.description || '').toLowerCase();
    const cwe = String(v?.cweId || '').toLowerCase();
    const owasp = String(v?.owaspCategory || '').toLowerCase();

    const matchesSearch = 
      cve.includes(term) ||
      title.includes(term) ||
      description.includes(term) ||
      cwe.includes(term) ||
      owasp.includes(term) ||
      (Array.isArray(v?.affectedSites) && v.affectedSites.some((s: any) => {
        const sName = String(typeof s === 'string' ? s : s?.siteName || s?.ip || '').toLowerCase();
        return sName.includes(term);
      }));

    // Coincidencia de severidad tolerante a terminaciones masculina/femenina
    const matchesSeverity = selectedSeverity === 'Todas' || 
      (v.severity && v.severity.toLowerCase().startsWith(selectedSeverity.toLowerCase().slice(0, 4)));

    // Coincidencia por categoría OWASP / CWE / Cabeceras
    let matchesCategory = true;
    if (selectedCategory !== 'Todas') {
      const catLower = selectedCategory.toLowerCase();
      if (catLower === 'headers') {
        matchesCategory = 
          owasp.includes('cabecera') || 
          owasp.includes('misconfiguration') ||
          title.includes('header') || 
          title.includes('hsts') || 
          title.includes('csp') ||
          description.includes('hsts') || 
          description.includes('csp') || 
          description.includes('x-frame') || 
          cwe.includes('1021') || 
          cwe.includes('1004');
      } else {
        matchesCategory = owasp.includes(catLower) || cwe.includes(catLower) || title.includes(catLower);
      }
    }

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSeverity('Todas');
    setSelectedCategory('Todas');
  };

  const hasActiveFilters = searchTerm !== '' || selectedSeverity !== 'Todas' || selectedCategory !== 'Todas';

  return (
    <div className="space-y-6">
      {/* Header con botón de Taxonomía */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Superficie de Ataque &amp; Catálogo OWASP
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              {vulnerabilities.length} detectadas
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Base de conocimiento sincronizada con NVD/NIST, CISA KEV y el marco internacional OWASP Top 10. Haz clic en cualquier tarjeta para filtrar.
          </p>
        </div>

        {/* Botón destacado Guía de Clasificación y Taxonomía */}
        <button
          onClick={() => setShowTaxonomyModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Ver Matriz Completa de Taxonomía</span>
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono">
            CVSS v3.1 / OWASP
          </span>
        </button>
      </div>

      {/* Grid Interactivo: Qué Escaneamos & Cobertura de Taxonomía */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            Cobertura por Severidad CVSS v3.1 &amp; SLA Recomendado
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Restablecer filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tarjeta Crítica */}
          <div
            onClick={() => setSelectedSeverity(selectedSeverity === 'Crítica' ? 'Todas' : 'Crítica')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedSeverity === 'Crítica'
                ? 'bg-red-50 border-red-500 shadow-md ring-2 ring-red-400'
                : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                Crítica (CVSS 9.0 - 10.0)
              </span>
              <span className="font-mono text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                SLA &lt; 24h
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              RCE remoto, compromiso total de servidor y exposición directa de credenciales maestras.
            </p>
          </div>

          {/* Tarjeta Alta */}
          <div
            onClick={() => setSelectedSeverity(selectedSeverity === 'Alta' ? 'Todas' : 'Alta')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedSeverity === 'Alta'
                ? 'bg-orange-50 border-orange-500 shadow-md ring-2 ring-orange-400'
                : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Alta (CVSS 7.0 - 8.9)
              </span>
              <span className="font-mono text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                SLA &lt; 72h
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Inyecciones SQLi / XSS almacenado, escalada de privilegios y fuga de datos sensibles.
            </p>
          </div>

          {/* Tarjeta Media */}
          <div
            onClick={() => setSelectedSeverity(selectedSeverity === 'Media' ? 'Todas' : 'Media')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedSeverity === 'Media'
                ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                Media (CVSS 4.0 - 6.9)
              </span>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                SLA &lt; 14d
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Clickjacking (sin X-Frame-Options), CORS mal configurado y políticas CSP permisivas.
            </p>
          </div>

          {/* Tarjeta Baja */}
          <div
            onClick={() => setSelectedSeverity(selectedSeverity === 'Baja' ? 'Todas' : 'Baja')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedSeverity === 'Baja'
                ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Baja (CVSS 0.1 - 3.9)
              </span>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                SLA &lt; 30d
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Divulgación de cabeceras de servidor (Server banner), métodos HTTP verbosos y falta de HSTS.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Campo de búsqueda */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por CVE, título, CWE, OWASP o activo..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Severidad */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Severidad:
            </span>
            {severities.map((sev) => {
              const isSelected = selectedSeverity === sev;
              let badgeColor = 'bg-red-600 text-white font-semibold shadow-xs';
              if (sev === 'Alta') badgeColor = 'bg-orange-600 text-white font-semibold shadow-xs';
              if (sev === 'Media') badgeColor = 'bg-amber-600 text-white font-semibold shadow-xs';
              if (sev === 'Baja') badgeColor = 'bg-emerald-600 text-white font-semibold shadow-xs';

              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`
                    px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer
                    ${isSelected 
                      ? badgeColor
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }
                  `}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro por Tipo / Categoría OWASP */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 w-full">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Layers className="w-3.5 h-3.5 text-red-600" />
              Categoría:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5
                    ${isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                    }
                  `}
                >
                  <span>{cat.label}</span>
                  {isSelected && (
                    <span className="text-[9px] font-mono bg-white/20 text-white px-1 rounded">
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Reset button if active */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Mostrando <strong className="text-slate-900">{filteredVulns.length}</strong> de {vulnerabilities.length} vulnerabilidades registradas
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600"></span> Crítica
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Alta
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Media
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Baja
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Identificador CVE</th>
                <th className="py-3 px-3">Título y Vulnerabilidad</th>
                <th className="py-3 px-3 text-center">Score CVSS</th>
                <th className="py-3 px-3 text-center">Severidad</th>
                <th className="py-3 px-3">Categoría OWASP</th>
                <th className="py-3 px-3">Activos Impactados</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVulns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No se encontraron registros con los filtros seleccionados.</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba cambiando la severidad, categoría o término de búsqueda.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Restablecer filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredVulns.map((v) => {
                  const isCrit = v.severity === 'Crítico' || v.severity === 'Crítica';
                  const isHigh = v.severity === 'Alto' || v.severity === 'Alta';
                  const isMed = v.severity === 'Medio' || v.severity === 'Media';
                  const score = v.cvss || v.cvssScore || 0;

                  return (
                    <tr 
                      key={v.id} 
                      onClick={() => onSelectVuln(v.cve)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-red-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{v.cve}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 max-w-sm">
                        <span className="font-semibold text-slate-900 block group-hover:text-red-600 transition-colors">
                          {v.title || v.name}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {v.description}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          score >= 9 ? 'bg-red-100 text-red-800 border border-red-200' :
                          score >= 7 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          score >= 4 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {score.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isCrit ? 'bg-red-50 text-red-700 border border-red-200' :
                          isHigh ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          isMed ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {v.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {v.owaspCategory || 'OWASP General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {(v.affectedSites || []).map((s: any, idx) => (
                            <span 
                              key={idx} 
                              className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded"
                            >
                              {typeof s === 'string' ? s : s?.siteName || s?.ip || 'Activo'}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                          v.status === 'En Remediación' ? 'bg-amber-50 text-amber-800 border border-amber-200 font-medium' :
                          v.status === 'Identificado' ? 'bg-red-50 text-red-700 border border-red-200 font-bold' :
                          'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium'
                        }`}>
                          {v.status || 'Identificado'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVuln(v.cve);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          Ver Guía <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL / PANEL DE CRITERIOS DE CLASIFICACIÓN Y TAXONOMÍA        */}
      {/* ============================================================== */}
      {showTaxonomyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                      Criterios de Clasificación y Taxonomía de Seguridad
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">
                      Tacna SOC v2.1
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Estándares CVSS v3.1 (NVD/NIST) y OWASP Top 10 aplicados a la evaluación de infraestructuras web regionales.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTaxonomyModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTaxonomyTab('cvss')}
                className={`
                  inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                  ${activeTaxonomyTab === 'cvss'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
                  }
                `}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>1. Escala de Severidad CVSS v3.1 &amp; SLAs</span>
              </button>

              <button
                onClick={() => setActiveTaxonomyTab('owasp')}
                className={`
                  inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                  ${activeTaxonomyTab === 'owasp'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
                  }
                `}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Categorías OWASP Top 10 &amp; CWE</span>
              </button>

              <button
                onClick={() => setActiveTaxonomyTab('matrix')}
                className={`
                  inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                  ${activeTaxonomyTab === 'matrix'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
                  }
                `}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>3. Matriz de Impacto vs SLA</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* TAB 1: CVSS v3.1 */}
              {activeTaxonomyTab === 'cvss' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-red-900">
                        ¿Cómo calcula Tacna SOC la Severidad según CVSS v3.1?
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        El Common Vulnerability Scoring System (CVSS v3.1) evalúa métricas de explotabilidad (Vector de Ataque, Complejidad, Privilegios Requeridos e Interacción del Usuario) combinadas con el impacto en la <strong>Confidencialidad, Integridad y Disponibilidad (Tríada CIA)</strong>. Cada nivel determina el Acuerdo de Nivel de Servicio (SLA) de remediación recomendado.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CRÍTICA */}
                    <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                          <span className="font-bold text-sm text-red-900">Severidad Crítica</span>
                        </div>
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-red-600 text-white">
                          9.0 – 10.0
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                        <p><strong>Qué abarca:</strong> Ejecución Remota de Código (RCE), desbordamiento de búfer explotable sin credenciales, compromiso total de la base de datos o acceso root desatendido a través de la red pública.</p>
                        <p><strong>Impacto operativo:</strong> Compromiso catastrófico. Pérdida total de confidencialidad y control del servidor.</p>
                        <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">SLA de Remediación:</span>
                          <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded font-mono">
                            &lt; 24 Horas (Inmediato)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ALTA */}
                    <div className="p-5 rounded-2xl border border-orange-200 bg-orange-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                          <span className="font-bold text-sm text-orange-900">Severidad Alta</span>
                        </div>
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-orange-600 text-white">
                          7.0 – 8.9
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                        <p><strong>Qué abarca:</strong> Inyecciones de código (SQLi), evasión de autenticación (Bypass), escalada de privilegios a Super Admin, fuga masiva de datos confidenciales o caída de servicio crítico (DoS).</p>
                        <p><strong>Impacto operativo:</strong> Riesgo severo. Permite acceso indebido a datos de ciudadanos o alteración de registros institucionales.</p>
                        <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">SLA de Remediación:</span>
                          <span className="font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded font-mono">
                            &lt; 72 Horas (Prioridad Alta)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MEDIA */}
                    <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                          <span className="font-bold text-sm text-amber-900">Severidad Media</span>
                        </div>
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-amber-600 text-white">
                          4.0 – 6.9
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                        <p><strong>Qué abarca:</strong> Cross-Site Scripting (XSS) reflejado, ausencia de cabecera <code className="bg-amber-100 px-1 rounded">X-Frame-Options</code> (susceptible a Clickjacking), cookies de sesión sin directivas <code className="bg-amber-100 px-1 rounded">HttpOnly</code> / <code className="bg-amber-100 px-1 rounded">SameSite</code>, o CSP permisivo.</p>
                        <p><strong>Impacto operativo:</strong> Riesgo moderado. Ataques que requieren interacción del usuario o condiciones de red local.</p>
                        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">SLA de Remediación:</span>
                          <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono">
                            &lt; 14 Días (Planificado)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BAJA */}
                    <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-sm text-emerald-900">Severidad Baja</span>
                        </div>
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-emerald-600 text-white">
                          0.1 – 3.9
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                        <p><strong>Qué abarca:</strong> Fuga de versión de servidor en cabeceras HTTP (<code className="bg-emerald-100 px-1 rounded">Server: Apache/2.4</code>), cabecera <code className="bg-emerald-100 px-1 rounded">Referrer-Policy</code> omitida, o HSTS configurado con tiempo de vida (<code className="bg-emerald-100 px-1 rounded">max-age</code>) inferior a 6 meses.</p>
                        <p><strong>Impacto operativo:</strong> Divulgación técnica informativa. Facilita la labor de reconocimiento a adversarios pero no compromete el sistema directamente.</p>
                        <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">SLA de Remediación:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                            &lt; 30 Días (Ciclo Regular)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OWASP TOP 10 & CWE */}
              {activeTaxonomyTab === 'owasp' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tacna SOC clasifica cada hallazgo bajo el estándar internacional <strong>OWASP Top 10 (Open Web Application Security Project)</strong> y el catálogo de debilidades comunes <strong>CWE (Common Weakness Enumeration)</strong>:
                  </p>

                  <div className="space-y-3">
                    {/* A01 */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-red-100 text-red-800 border border-red-200">
                            A01:2021
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                            Broken Access Control (Pérdida de Control de Acceso)
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          CWE-284, CWE-285, CWE-639 (IDOR)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        <strong>Qué abarca:</strong> Violaciones en la autorización que permiten a un usuario actuar fuera de sus privilegios asignados, accediendo a cuentas ajenas o a funciones de administración protegidas.
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Ejemplo en Tacna SOC:</strong> Acceso a endpoints administrativos sin token Bearer válido, manipulación del parámetro <code className="bg-slate-100 px-1 rounded">user_id</code> en consultas a la base de datos o elevación de privilegios de Operador a Super Admin.
                        </div>
                      </div>
                    </div>

                    {/* A02 */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-orange-100 text-orange-800 border border-orange-200">
                            A02:2021
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                            Cryptographic Failures (Fallas Criptográficas)
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          CWE-310, CWE-319 (Cleartext HTTP), CWE-327
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        <strong>Qué abarca:</strong> Transmisión de datos confidenciales en texto plano (HTTP sin cifrar), algoritmos hash obsoletos (MD5/SHA1), ausencia de HTTPS obligatorio o certificados SSL/TLS caducados.
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Ejemplo en Tacna SOC:</strong> Portales que responden en HTTP plano sin redirección 301 forzada a HTTPS, o ausencia de la cabecera <code className="bg-slate-100 px-1 rounded">Strict-Transport-Security (HSTS)</code> permitiendo ataques Man-in-the-Middle (MITM).
                        </div>
                      </div>
                    </div>

                    {/* A03 */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-red-100 text-red-800 border border-red-200">
                            A03:2021
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                            Injection (Inyección de Código y Comandos)
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          CWE-89 (SQLi), CWE-79 (XSS), CWE-78 (OS Command)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        <strong>Qué abarca:</strong> El envío de datos no sanitizados que son interpretados como comandos o scripts ejecutables por el motor de base de datos SQL o por el navegador del cliente.
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Ejemplo en Tacna SOC:</strong> Parámetros en formularios de búsqueda institucional vulnerables a inyección SQL (CVE-2023-28252) o falta de cabecera <code className="bg-slate-100 px-1 rounded">Content-Security-Policy (CSP)</code> que permita Cross-Site Scripting.
                        </div>
                      </div>
                    </div>

                    {/* A05 */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-100 text-amber-800 border border-amber-200">
                            A05:2021
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                            Security Misconfiguration (Configuración de Seguridad Deficiente)
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          CWE-16, CWE-1004 (Cookie Flags), CWE-1021 (Clickjacking)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        <strong>Qué abarca:</strong> Configuraciones por defecto no seguras, mensajes de error prolijos con stack traces, cabeceras HTTP de protección omitidas o cookies sin banderas de seguridad.
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Ejemplo en Tacna SOC:</strong> Omisión de <code className="bg-slate-100 px-1 rounded">X-Frame-Options: DENY</code> (permitiendo incrustar el sitio en iframes maliciosos), <code className="bg-slate-100 px-1 rounded">X-Content-Type-Options: nosniff</code> ausente o cookies sin flag <code className="bg-slate-100 px-1 rounded">Secure</code>.
                        </div>
                      </div>
                    </div>

                    {/* A06 */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-purple-100 text-purple-800 border border-purple-200">
                            A06:2021
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                            Vulnerable and Outdated Components (Componentes Vulnerables y Obsoletos)
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          CWE-1104, CWE-937 (Third Party Libraries)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        <strong>Qué abarca:</strong> Ejecución de versiones obsoletas de servidores web (Apache, Nginx, IIS), frameworks (PHP, Node, Java Spring) o librerías con fallas de seguridad conocidas y publicadas en NVD.
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Ejemplo en Tacna SOC:</strong> Servidores que exponen versiones vulnerables de OpenSSH (CVE-2023-38408 con CVSS 9.8) o módulos Log4j con vulnerabilidad Log4Shell (CVE-2021-44228 con CVSS 10.0).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MATRIX */}
              {activeTaxonomyTab === 'matrix' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Resumen consolidado de la política de atención a incidentes y remediación del Centro de Operaciones de Seguridad:
                  </p>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 uppercase font-mono text-[10px] text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3">Nivel</th>
                          <th className="py-3 px-3">Rango CVSS</th>
                          <th className="py-3 px-3">Vector de Red</th>
                          <th className="py-3 px-3">Tríada CIA</th>
                          <th className="py-3 px-3">SLA Remediación</th>
                          <th className="py-3 px-3">Acción Recomendada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-red-50/20">
                          <td className="py-3 px-3 font-bold text-red-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span> Crítica
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">9.0 – 10.0</td>
                          <td className="py-3 px-3 font-mono text-[11px]">Network (Remoto sin auth)</td>
                          <td className="py-3 px-3 font-bold text-red-600">Total (C:H / I:H / A:H)</td>
                          <td className="py-3 px-3 font-mono font-bold text-red-700">&lt; 24 horas</td>
                          <td className="py-3 px-3 text-slate-600">Aislamiento de puerto o parche inmediato</td>
                        </tr>
                        <tr className="bg-orange-50/20">
                          <td className="py-3 px-3 font-bold text-orange-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Alta
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">7.0 – 8.9</td>
                          <td className="py-3 px-3 font-mono text-[11px]">Network / Adjacent</td>
                          <td className="py-3 px-3 text-orange-700">Severo (C:H / I:H)</td>
                          <td className="py-3 px-3 font-mono font-bold text-orange-700">&lt; 72 horas</td>
                          <td className="py-3 px-3 text-slate-600">Reglas WAF, saneamiento de código</td>
                        </tr>
                        <tr className="bg-amber-50/20">
                          <td className="py-3 px-3 font-bold text-amber-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Media
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">4.0 – 6.9</td>
                          <td className="py-3 px-3 font-mono text-[11px]">Interacción de usuario (UI:R)</td>
                          <td className="py-3 px-3 text-amber-700">Parcial (C:L / I:L)</td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-700">&lt; 14 días</td>
                          <td className="py-3 px-3 text-slate-600">Inyección de cabeceras en Nginx/Apache</td>
                        </tr>
                        <tr className="bg-emerald-50/20">
                          <td className="py-3 px-3 font-bold text-emerald-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Baja
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">0.1 – 3.9</td>
                          <td className="py-3 px-3 font-mono text-[11px]">Local / Informativo</td>
                          <td className="py-3 px-3 text-emerald-700">Mínimo (C:L)</td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">&lt; 30 días</td>
                          <td className="py-3 px-3 text-slate-600">Ocultar banners de versión de software</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                Normativa de referencia: FIRST CVSS v3.1 Specification &amp; NIST SP 800-115.
              </span>
              <button
                onClick={() => setShowTaxonomyModal(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                Cerrar Guía
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
