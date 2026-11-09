import React from 'react';
import { 
  Play, 
  BarChart3, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileCheck,
  Search
} from 'lucide-react';
import { EvaluationItem } from '../types';

interface EvaluationsViewProps {
  evaluaciones: EvaluationItem[];
  onOpenNewScanModal: () => void;
  onRerunScan: (item: EvaluationItem) => void;
}

export const EvaluationsView: React.FC<EvaluationsViewProps> = ({
  evaluaciones,
  onOpenNewScanModal,
  onRerunScan
}) => {
  return (
    <div className="space-y-6">
      {/* Header & New Scan Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">
            Historial de Evaluaciones y Escaneos DAST
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro de ejecuciones automáticas, pruebas dinámicas de penetración y auditorías de seguridad.
          </p>
        </div>

        <button
          onClick={onOpenNewScanModal}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>Nueva Evaluación</span>
        </button>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID Evaluación</th>
                <th className="py-3 px-3">Activo Objetivo</th>
                <th className="py-3 px-3">Fecha y Hora</th>
                <th className="py-3 px-3 text-center">Score Letra</th>
                <th className="py-3 px-3">Vulnerabilidades Halladas</th>
                <th className="py-3 px-3 text-center">Estado / Progreso</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluaciones.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                    {e.id}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-900 font-semibold">
                    {e.target}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {e.date}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-mono font-black text-xs ${
                      e.score === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      e.score === 'B' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {e.score}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {e.critical > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
                          {e.critical} Crit
                        </span>
                      )}
                      {e.high > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                          {e.high} Alt
                        </span>
                      )}
                      {e.medium > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {e.medium} Med
                        </span>
                      )}
                      {e.low > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {e.low} Baj
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {e.status === 'En Progreso' ? (
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-[11px] font-mono text-amber-700 font-semibold flex items-center gap-1">
                          <RotateCw className="w-3 h-3 animate-spin" /> Escaneando {e.progress}%
                        </span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${e.progress || 25}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completado
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onRerunScan(e)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    >
                      Re-ejecutar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
