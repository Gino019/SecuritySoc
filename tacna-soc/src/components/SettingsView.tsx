import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  Database, 
  Key, 
  Save, 
  Check, 
  RotateCw,
  Server,
  Sparkles,
  Cpu
} from 'lucide-react';
import { SystemUser } from '../types';

interface SettingsViewProps {
  currentUser: SystemUser;
  onSaveSettingsNotification: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onSaveSettingsNotification
}) => {
  const [cvssThreshold, setCvssThreshold] = useState('8.0');
  const [scanFrequency, setScanFrequency] = useState('daily');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [autoIpBlock, setAutoIpBlock] = useState(true);
  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('sivit_gemini_api_key') || '';
    setGeminiKey(savedKey);
  }, []);

  const handleSaveGeminiKey = async () => {
    if (geminiKey.trim()) {
      localStorage.setItem('sivit_gemini_api_key', geminiKey.trim());
      try {
        await fetch('/api/ai/config-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: geminiKey.trim() })
        });
      } catch (e) {
        // LocalStorage is also saved
      }
    } else {
      localStorage.removeItem('sivit_gemini_api_key');
    }
    setKeySaved(true);
    onSaveSettingsNotification('Clave API de Gemini actualizada correctamente.');
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    onSaveSettingsNotification(`Configuración del SOC actualizada por ${currentUser.name}. Umbral CVSS: ${cvssThreshold}`);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">
          Configuración del Sistema SOC
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Parámetros operativos de detección, políticas de umbrales CVSS y canales de alerta perimetral.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Security Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="font-mono text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2 font-bold">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Parámetros de Detección y Umbrales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="text-slate-700 block mb-1 font-medium">
                Umbral CVSS Mínimo para Alerta Crítica Inmediata
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5.0"
                  max="10.0"
                  step="0.1"
                  value={cvssThreshold}
                  onChange={(e) => setCvssThreshold(e.target.value)}
                  className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-red-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">
                  Vulnerabilidades con score &ge; {cvssThreshold} disparan notificación push inmediata.
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-medium">
                Frecuencia de Barrido DAST Periódico
              </label>
              <select
                value={scanFrequency}
                onChange={(e) => setScanFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:border-red-500 focus:outline-none"
              >
                <option value="hourly">Cada 6 Horas</option>
                <option value="daily">Diario (Madrugada 02:00 UTC-5)</option>
                <option value="weekly">Semanal (Domingos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Dispatch */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="font-mono text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2 font-bold">
            <Bell className="w-4 h-4 text-amber-600" />
            Canales de Alerta para Incidentes
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <span className="font-medium text-slate-900 block">Alertas por Correo Electrónico (CSIRT)</span>
                <span className="text-[11px] text-slate-500">Envío automático a los administradores y responsables de TI.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <span className="font-medium text-slate-900 block">Webhook Telegram / SOC Bot</span>
                <span className="text-[11px] text-slate-500">Notificación al canal de guardia @SOC_Tacna_Incidentes.</span>
              </div>
              <input
                type="checkbox"
                checked={telegramAlerts}
                onChange={(e) => setTelegramAlerts(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <span className="font-medium text-slate-900 block">Bloqueo Preventivo Automático (WAF Fail2Ban)</span>
                <span className="text-[11px] text-slate-500">Aislar IPs con más de 10 intentos fallidos de autenticación o ataques de inyección.</span>
              </div>
              <input
                type="checkbox"
                checked={autoIpBlock}
                onChange={(e) => setAutoIpBlock(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
            </label>
          </div>
        </div>

        {/* Intelligence Engine & Gemini AI */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-mono text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-red-600" />
              Motor de Inteligencia Artificial (Google Gemini & SOC DAST)
            </h3>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              geminiKey.trim() 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {geminiKey.trim() ? '✓ Gemini Activo' : '● Motor SOC Autónomo'}
            </span>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <p className="text-slate-600 leading-relaxed">
              El sistema evalúa objetivos web con un <strong>motor DAST heurístico autónomo</strong> sin requerir dependencias externas. Opcionalmente, puede vincular su <strong>API Key gratuita de Google Gemini 2.0 Flash</strong> (obtenida en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-red-600 underline font-medium hover:text-red-700">Google AI Studio</a>) para análisis generativo en tiempo real.
            </p>

            <div>
              <label className="text-slate-700 block mb-1 font-medium">
                Google Gemini API Key (Opcional):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:border-red-500 focus:outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveGeminiKey}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shrink-0"
                >
                  {keySaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{keySaved ? 'Guardada' : 'Guardar Clave'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Se guarda en su sesión y en el servidor local. Si se deja vacía, el sistema opera con el motor de diagnóstico SOC integrado.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{saved ? '¡Configuración Guardada!' : 'Guardar Cambios Operativos'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
