import React from 'react';
import { X, CheckCircle2, Shield, Copy, Check, Terminal, FileCode } from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditDetailModalProps {
  log: AuditLogItem | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ log, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-900">
                Registro Forense: {log.id}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {log.timestamp} • {log.eventType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Integrity Seal */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-800 font-semibold">Integridad Criptográfica Verificada</span>
            </div>
            <span className="text-[10px] text-slate-500">Algoritmo SHA-256</span>
          </div>

          {/* SHA-256 Checksum display */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hash Inmutable:</span>
            <code className="text-red-700 font-bold text-[11px] break-all block">
              {log.sha256Checksum}
            </code>
          </div>

          {/* Actor & Target Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Actor / Identidad</span>
              <span className="text-slate-900 font-bold block mt-0.5">{log.actor.name}</span>
              <span className="text-slate-500 text-[10px]">{log.actor.email}</span>
              <span className="text-red-600 text-[10px] block mt-1 font-bold">Rol: {log.actor.role}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase font-semibold">Ubicación y Red</span>
              <span className="text-slate-900 font-bold block mt-0.5">{log.ipAddress}</span>
              <span className="text-slate-500 text-[10px]">{log.location}</span>
              <span className="text-slate-700 text-[10px] block mt-1">Target: {log.target}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] block uppercase font-mono font-semibold">Detalle del Evento</span>
            <p className="text-slate-800 font-sans text-xs leading-relaxed">
              {log.description}
            </p>
          </div>

          {/* Raw Payload JSON */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-semibold">
              <span>Metadatos Adicionales (Raw Payload)</span>
              <button
                onClick={handleCopyJSON}
                className="text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiado' : 'Copiar JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-lg text-red-200 text-[11px] overflow-x-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
