import React, { useState } from 'react';
import { X, Play, ShieldAlert, CheckCircle2, RotateCw } from 'lucide-react';
import { WebsiteItem, EvaluationItem } from '../types';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteItem[];
  onStartScan: (targetUrl: string, scanType: string) => void;
}

export const NewScanModal: React.FC<NewScanModalProps> = ({
  isOpen,
  onClose,
  websites,
  onStartScan
}) => {
  const [target, setTarget] = useState(websites[0]?.url || 'https://regiontacna.gob.pe');
  const [scanType, setScanType] = useState('DAST_EXHAUSTIVE');
  const [portScan, setPortScan] = useState(true);
  const [sslAudit, setSslAudit] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartScan(target, scanType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-sm text-slate-900">
              Configurar y Lanzar Nueva Evaluación de Seguridad
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
          <div>
            <label className="text-slate-700 block mb-1 font-medium">
              Activo Objetivo a Escanear
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:border-red-500 focus:outline-none"
            >
              {websites.map(w => (
                <option key={w.id} value={w.url}>
                  {w.name} ({w.url} - {w.ip})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">
              Motor y Perfil de Escaneo
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                <input
                  type="radio"
                  name="scanType"
                  value="DAST_EXHAUSTIVE"
                  checked={scanType === 'DAST_EXHAUSTIVE'}
                  onChange={(e) => setScanType(e.target.value)}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">DAST Exhaustivo OWASP Top 10</span>
                  <span className="text-[11px] text-slate-500">Inyecciones SQL, XSS, CSRF, fallos de control de acceso y fuzzing.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                <input
                  type="radio"
                  name="scanType"
                  value="FAST_AUDIT"
                  checked={scanType === 'FAST_AUDIT'}
                  onChange={(e) => setScanType(e.target.value)}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">Auditoría Rápida de Cabeceras y CVEs Perimetrales</span>
                  <span className="text-[11px] text-slate-500">Verificación de versiones de software web (Nginx, OpenSSH, Apache).</span>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={portScan}
                onChange={(e) => setPortScan(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Escanear puertos TCP 1-1024</span>
            </label>

            <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={sslAudit}
                onChange={(e) => setSslAudit(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Validar Ciphers TLS/SSL</span>
            </label>
          </div>

          <div className="p-3 bg-red-50/60 rounded-lg border border-red-200 text-[11px] text-slate-700">
            El escaneo se ejecutará bajo autorización explícita del SOC institucional y quedará asentado en el log inmutable de auditoría.
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
              <Play className="w-4 h-4" />
              <span>Lanzar Evaluación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
