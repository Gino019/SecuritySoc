import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  SlidersHorizontal, 
  Terminal, 
  KeyRound, 
  UserCheck, 
  Play, 
  Check, 
  Copy,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogsViewProps {
  logs: AuditLogItem[];
  filterActor?: string;
  onClearActorFilter?: () => void;
  onSimulateEvent: () => void;
  onInspectLog: (log: AuditLogItem) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  filterActor,
  onClearActorFilter,
  onSimulateEvent,
  onInspectLog
}) => {
  const [searchTerm, setSearchTerm] = useState(filterActor || '');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('Todas');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  const severities = ['Todas', 'INFO', 'WARNING', 'CRITICAL', 'AUDIT'];

  const filteredLogs = (logs || []).filter(log => {
    const term = (searchTerm || '').toLowerCase();
    const desc = String(log?.description || '').toLowerCase();
    const actorName = String(log?.actor?.name || '').toLowerCase();
    const actorEmail = String(log?.actor?.email || '').toLowerCase();
    const evt = String(log?.eventType || '').toLowerCase();
    const ip = String(log?.ipAddress || '');
    const checksum = String(log?.sha256Checksum || '').toLowerCase();

    const matchesSearch = 
      desc.includes(term) ||
      actorName.includes(term) ||
      actorEmail.includes(term) ||
      evt.includes(term) ||
      ip.includes(term) ||
      checksum.includes(term);

    const matchesSeverity = selectedSeverity === 'Todas' || log?.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  const copyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportAudit = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">
              Logs y Auditoría de Actividad del Sistema
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              INMUTABLE SHA-256
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro criptográficamente sellado de eventos administrativos, inicio de sesiones, escaneos y cambios en políticas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSimulateEvent}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-red-600" />
            <span>Simular Evento SOC</span>
          </button>
          <button
            onClick={handleExportAudit}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exported ? '¡Registro Exportado!' : 'Exportar Traza Forense'}</span>
          </button>
        </div>
      </div>

      {/* Filter notification if filtered by user */}
      {filterActor && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs font-mono">
          <span className="text-red-700">
            Filtrando logs por actor: <strong>{filterActor}</strong>
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              onClearActorFilter?.();
            }}
            className="text-xs text-red-700 underline font-semibold"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {/* Search & Severity Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por evento, actor, IP, hash SHA256 o descripción..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
          {severities.map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`
                px-2.5 py-1 text-xs rounded-md font-mono font-medium transition-colors cursor-pointer
                ${selectedSeverity === sev 
                  ? 'bg-red-600 text-white font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }
              `}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-3">Severidad</th>
                <th className="py-3 px-3">Tipo de Evento</th>
                <th className="py-3 px-3">Actor / Identidad</th>
                <th className="py-3 px-3">Dirección IP & Origen</th>
                <th className="py-3 px-3">Descripción de la Actividad</th>
                <th className="py-3 px-3">Checksum SHA-256</th>
                <th className="py-3 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                    No se encontraron registros de auditoría para el criterio seleccionado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => onInspectLog(log)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                        log.severity === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        log.severity === 'AUDIT' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {log.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-xs font-semibold text-slate-900">
                      {log.eventType}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-900">{log.actor.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.actor.email}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <span className="text-slate-800 font-bold block">{log.ipAddress}</span>
                      <span className="text-[10px] text-slate-400">{log.location}</span>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs text-xs text-slate-600 leading-snug">
                      {log.description}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="truncate w-24">
                          {log.sha256Checksum.slice(0, 12)}...
                        </span>
                        <button
                          onClick={(e) => copyHash(log.sha256Checksum, e)}
                          title="Copiar Hash SHA-256 completo"
                          className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                        >
                          {copiedHash === log.sha256Checksum ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectLog(log);
                        }}
                        className="p-1.5 text-slate-400 group-hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
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
