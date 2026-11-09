import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldAlert, 
  Plus, 
  Play, 
  ChevronRight,
  Server
} from 'lucide-react';
import { WebsiteItem } from '../types';

interface WebsitesViewProps {
  websites: WebsiteItem[];
  onSelectSite: (siteId: string) => void;
  onOpenNewSiteModal: () => void;
  onQuickScan: (site: WebsiteItem) => void;
}

export const WebsitesView: React.FC<WebsitesViewProps> = ({
  websites,
  onSelectSite,
  onOpenNewSiteModal,
  onQuickScan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedRisk, setSelectedRisk] = useState<string>('Todos');

  const categories = ['Todas', 'Gobierno', 'Educación', 'Salud', 'Finanzas'];
  const riskLevels = ['Todos', 'Crítico', 'Alto', 'Medio', 'Bajo'];

  const filteredSites = (websites || []).filter((site) => {
    const term = (searchTerm || '').toLowerCase();
    const name = String(site?.name || '').toLowerCase();
    const url = String(site?.url || '').toLowerCase();
    const ip = String(site?.ip || '');
    const institution = String(site?.institution || '').toLowerCase();

    const matchesSearch = 
      name.includes(term) ||
      url.includes(term) ||
      ip.includes(term) ||
      institution.includes(term);

    const matchesCategory = selectedCategory === 'Todas' || site?.category === selectedCategory;
    const matchesRisk = selectedRisk === 'Todos' || site?.riskLevel === selectedRisk;

    return matchesSearch && matchesCategory && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header & New Target Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">
            Directorio de Sitios y Activos Monitoreados
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 font-sans">
            Inventario integral de portales web institucionales de la región Tacna y estatus perimetral.
          </p>
        </div>

        <button
          onClick={onOpenNewSiteModal}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Sitio</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por URL, nombre, IP o institución..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer
                ${selectedCategory === cat 
                  ? 'bg-red-600 text-white font-semibold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 font-mono font-medium">Riesgo:</span>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 font-mono"
          >
            {riskLevels.map((rl) => (
              <option key={rl} value={rl}>{rl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Websites Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Portal / Dominio</th>
                <th className="py-3 px-3">IP & Categoría</th>
                <th className="py-3 px-3 text-center">Riesgo Score</th>
                <th className="py-3 px-3">Severidad Vulns</th>
                <th className="py-3 px-3">Última Evaluación</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    No se encontraron activos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredSites.map((site) => (
                  <tr 
                    key={site.id} 
                    onClick={() => onSelectSite(site.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-sm text-slate-900 group-hover:text-red-600 transition-colors flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
                        <span className="truncate max-w-xs">{site.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs mt-0.5">
                        {site.url}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-700 text-xs flex items-center gap-1">
                        <Server className="w-3 h-3 text-slate-400" />
                        {site.ip}
                      </div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {site.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-mono text-sm font-bold ${
                          site.riskScore >= 70 ? 'text-red-600' :
                          site.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {site.riskScore}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                          site.riskLevel === 'Crítico' ? 'bg-red-50 text-red-700 border-red-200 font-bold' :
                          site.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          site.riskLevel === 'Medio' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {site.riskLevel}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {site.criticalCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold" title="Críticas">
                            {site.criticalCount}C
                          </span>
                        )}
                        {site.highCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200" title="Altas">
                            {site.highCount}A
                          </span>
                        )}
                        {site.mediumCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200" title="Medias">
                            {site.mediumCount}M
                          </span>
                        )}
                        {site.lowCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200" title="Bajas">
                            {site.lowCount}B
                          </span>
                        )}
                        {site.vulnCount === 0 && (
                          <span className="text-slate-400 text-xs">Sin vulnerabilidades</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 font-mono text-xs">
                      {site.lastEvaluation}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {site.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onQuickScan(site)}
                          title="Lanzar escaneo rápido"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectSite(site.id)}
                          title="Ver detalle del sitio"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
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
