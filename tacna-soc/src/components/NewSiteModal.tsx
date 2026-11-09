import React, { useState } from 'react';
import { X, Globe, Plus, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { WebsiteItem } from '../types';
import { resolveDomainIp } from '../api';

interface NewSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSite: (site: Omit<WebsiteItem, 'id' | 'lastEvaluation' | 'vulnCount' | 'criticalCount' | 'highCount' | 'mediumCount' | 'lowCount' | 'riskScore' | 'riskLevel'>) => void;
}

export const NewSiteModal: React.FC<NewSiteModalProps> = ({ isOpen, onClose, onAddSite }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [ip, setIp] = useState('');
  const [institution, setInstitution] = useState('');
  const [category, setCategory] = useState<WebsiteItem['category']>('Gobierno');
  const [isResolvingIp, setIsResolvingIp] = useState(false);

  const handleFillExample = () => {
    setName('Portal de Trámites y Licencias');
    setUrl('https://servicios.tacna.gob.pe');
    setIp('190.119.200.45');
    setInstitution('Gobierno Regional de Tacna');
    setCategory('Gobierno');
  };

  const handleDetectIp = async () => {
    if (!url) return;
    setIsResolvingIp(true);
    try {
      const resolved = await resolveDomainIp(url);
      if (resolved) {
        setIp(resolved);
      } else {
        setIp('190.119.200.45');
      }
    } finally {
      setIsResolvingIp(false);
    }
  };

  // Auto-detect IP when user finishes typing a valid URL if IP is empty
  const handleUrlBlur = async () => {
    if (url && !ip && url.includes('.')) {
      handleDetectIp();
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    let finalIp = ip.trim();
    if (!finalIp) {
      setIsResolvingIp(true);
      try {
        finalIp = (await resolveDomainIp(url)) || '190.119.200.45';
      } finally {
        setIsResolvingIp(false);
      }
    }

    onAddSite({
      name,
      url,
      ip: finalIp,
      institution: institution || 'Gobierno Regional de Tacna',
      category,
      status: 'Activo'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-sm text-slate-900">
              Registrar Nuevo Sitio Web para Monitoreo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center bg-blue-50/70 border border-blue-200/80 rounded-lg p-2.5 text-blue-900 text-[11px]">
            <span>💡 Ingresa los datos del portal institucional o usa el botón de autocompletar:</span>
            <button
              type="button"
              onClick={handleFillExample}
              className="ml-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              ⚡ Autocompletar Ejemplo
            </button>
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">
              Nombre del Portal o Sistema *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Portal de Trámites Licencias"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">
              URL / Dominio FQDN *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://servicios.tacna.gob.pe"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-medium">
                  Dirección IP Primaria
                </label>
                <button
                  type="button"
                  onClick={handleDetectIp}
                  disabled={!url || isResolvingIp}
                  className="text-[10px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-0.5 disabled:opacity-40 cursor-pointer"
                  title="Detectar IP automáticamente por DNS"
                >
                  {isResolvingIp ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                  <span>{isResolvingIp ? 'Buscando...' : 'Detectar'}</span>
                </button>
              </div>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Auto-detectable por DNS"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                💡 Opcional: Se resuelve vía DNS desde la URL.
              </p>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-medium">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WebsiteItem['category'])}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:outline-none"
              >
                <option value="Gobierno">Gobierno</option>
                <option value="Educación">Educación</option>
                <option value="Salud">Salud</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Tecnología / SaaS">Tecnología / SaaS</option>
                <option value="E-Commerce / Retail">E-Commerce / Retail</option>
                <option value="Corporativo / Empresa">Corporativo / Empresa</option>
                <option value="Medios / Blog">Medios / Blog</option>
                <option value="General / Otro">General / Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">
              Entidad / Institución Responsable
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Gobierno Regional de Tacna / Gerencia de Tecnologías"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar e Iniciar Monitoreo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
