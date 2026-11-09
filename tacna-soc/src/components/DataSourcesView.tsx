import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  Radio, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Check
} from 'lucide-react';
import { DataSourceItem } from '../types';

interface DataSourcesViewProps {
  dataSources: DataSourceItem[];
  onSyncSource: (sourceId: string) => void;
  onSyncAll: () => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  dataSources,
  onSyncSource,
  onSyncAll
}) => {
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncAll = () => {
    setSyncingAll(true);
    onSyncAll();
    setTimeout(() => setSyncingAll(false), 2000);
  };

  const handleSingleSync = (id: string) => {
    setSyncingId(id);
    onSyncSource(id);
    setTimeout(() => setSyncingId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Sync Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">
            Fuentes de Datos e Inteligencia de Amenazas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Conectores activos de telemetría, feeds de CVEs oficiales y telemetría interna del SOC.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
          <span>{syncingAll ? 'Sincronizando Feeds...' : 'Sincronizar Todas'}</span>
        </button>
      </div>

      {/* Grid of Data Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dataSources.map((ds) => (
          <div
            key={ds.id}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-red-300 transition-all shadow-xs"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-lg font-bold text-slate-900">
                    {ds.name}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                    style={{
                      backgroundColor: `${ds.badgeColor}15`,
                      color: ds.badgeColor,
                      border: `1px solid ${ds.badgeColor}35`
                    }}
                  >
                    {ds.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: ds.statusColor }} 
                  />
                  <span style={{ color: ds.statusColor }} className="font-semibold">{ds.statusType}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4 min-h-[48px]">
                {ds.description}
              </p>

              {/* Technical Endpoint Specs */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono mb-4">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Conector / Endpoint:</div>
                <div className="text-slate-800 truncate text-[11px] font-semibold">
                  {ds.endpoint}
                </div>
              </div>
            </div>

            {/* Bottom Footer Info & Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-mono text-slate-900 font-bold block">
                  {ds.recordsCount}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {ds.lastSync}
                </span>
              </div>

              <button
                onClick={() => handleSingleSync(ds.id)}
                disabled={syncingId === ds.id}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-mono text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 text-red-600 ${syncingId === ds.id ? 'animate-spin' : ''}`} />
                <span>{syncingId === ds.id ? 'Sync...' : 'Sincronizar'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
