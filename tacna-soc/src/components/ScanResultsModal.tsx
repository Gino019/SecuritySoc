import React from 'react';
import { ScanResult, AIAnalysis } from '../api';

interface ScanResultsModalProps {
  isOpen: boolean;
  isScanning: boolean;
  scanResult: ScanResult | null;
  aiAnalysis: AIAnalysis | null;
  isAnalyzingAI: boolean;
  onClose: () => void;
}

const SEV_CONFIG = {
  CRITICAL: { label: 'Crítico', bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600', light: 'bg-red-50' },
  HIGH:     { label: 'Alto',    bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', light: 'bg-orange-50' },
  MEDIUM:   { label: 'Medio',   bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-400', light: 'bg-yellow-50' },
  LOW:      { label: 'Bajo',    bg: 'bg-blue-500',   text: 'text-blue-600',   border: 'border-blue-400',   light: 'bg-blue-50' },
} as const;

const RISK_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'Crítico': { bg: 'bg-red-600',    text: 'text-white', dot: 'bg-red-300' },
  'Critico': { bg: 'bg-red-600',    text: 'text-white', dot: 'bg-red-300' },
  'Alto':    { bg: 'bg-orange-500', text: 'text-white', dot: 'bg-orange-300' },
  'Medio':   { bg: 'bg-yellow-500', text: 'text-white', dot: 'bg-yellow-300' },
  'Bajo':    { bg: 'bg-green-600',  text: 'text-white', dot: 'bg-green-300' },
};

export function ScanResultsModal({ isOpen, isScanning, scanResult, aiAnalysis, isAnalyzingAI, onClose }: ScanResultsModalProps) {
  if (!isOpen) return null;

  const riskCfg = RISK_CONFIG[aiAnalysis?.riesgoGeneral || ''] || { bg: 'bg-slate-600', text: 'text-white', dot: 'bg-slate-400' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Análisis de Seguridad</p>
              <p className="text-sm text-white font-semibold truncate max-w-md">
                {scanResult?.url || 'Escaneando...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Loading state */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-red-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-800 font-semibold text-lg">Escaneando objetivo...</p>
                <p className="text-slate-500 text-sm mt-1">Analizando cabeceras HTTP, SSL, cookies y configuración de seguridad</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!isScanning && scanResult && (
            <div className="p-6 space-y-6">

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Críticos', value: scanResult.critical, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                  { label: 'Altos',    value: scanResult.high,     color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                  { label: 'Medios',   value: scanResult.medium,   color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
                  { label: 'Bajos',    value: scanResult.low,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4 text-center`}>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Metadata */}
              <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Estado HTTP</p>
                  <p className="font-bold text-slate-800 mt-0.5">{scanResult.statusCode || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Protocolo</p>
                  <p className={`font-bold mt-0.5 ${scanResult.isHttps ? 'text-green-600' : 'text-red-600'}`}>
                    {scanResult.isHttps ? '🔒 HTTPS' : '⚠️ HTTP'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Respuesta</p>
                  <p className="font-bold text-slate-800 mt-0.5">{scanResult.responseTime ? `${scanResult.responseTime}ms` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Servidor</p>
                  <p className="font-bold text-slate-800 mt-0.5 text-xs truncate">{scanResult.server || '—'}</p>
                </div>
              </div>

              {/* Findings list */}
              {scanResult.findings.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Hallazgos ({scanResult.totalFindings})
                  </h3>
                  <div className="space-y-2">
                    {scanResult.findings.map((finding, i) => {
                      const cfg = SEV_CONFIG[finding.severity] || SEV_CONFIG.LOW;
                      return (
                        <div key={i} className={`border rounded-xl p-4 ${cfg.light} ${cfg.border}`}>
                          <div className="flex items-start gap-3">
                            <span className={`${cfg.bg} text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5`}>
                              {cfg.label}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800">{finding.name}</p>
                                {finding.cwe && (
                                  <span className="text-xs text-slate-400 font-mono shrink-0">{finding.cwe}</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{finding.description}</p>
                              {finding.remediation && (
                                <p className="text-xs text-slate-500 mt-1.5 border-l-2 border-slate-300 pl-2 italic">
                                  ✓ {finding.remediation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {scanResult.findings.length === 0 && (
                <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-semibold text-green-700">Sin hallazgos de seguridad detectados</p>
                  <p className="text-sm text-green-600 mt-1">El sitio pasa todas las verificaciones básicas de cabeceras HTTP.</p>
                </div>
              )}

              {/* AI Analysis */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-red-600/40 border border-red-500/50 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">Análisis de Inteligencia Artificial (DAST SOC)</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-900/60 text-red-200 border border-red-700/50 font-medium">
                      {aiAnalysis?.motor || 'Motor SOC IA'}
                    </span>
                  </div>
                  {isAnalyzingAI && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-red-200 font-mono mr-1">Analizando</span>
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 bg-white space-y-4">
                  {isAnalyzingAI ? (
                    <div className="flex items-center gap-3 text-sm text-slate-600 py-3">
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      <p className="text-sm text-slate-600">Correlacionando hallazgos perimetrales y evaluando postura de riesgo...</p>
                    </div>
                  ) : aiAnalysis?.error ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                      <p className="font-semibold">Observación de consulta:</p>
                      <p>{aiAnalysis.error}</p>
                    </div>
                  ) : aiAnalysis ? (
                    <>
                      {/* Risk level + score */}
                      <div className="flex items-center gap-3">
                        <span className={`${riskCfg.bg} ${riskCfg.text} text-xs font-bold px-3 py-1 rounded-full shadow-xs`}>
                          Riesgo: {aiAnalysis.riesgoGeneral}
                        </span>
                        {aiAnalysis.puntuacion !== undefined && (
                          <span className="text-xs text-slate-600 font-mono">
                            Puntuación de blindaje: <span className="font-bold text-slate-900 text-sm">{aiAnalysis.puntuacion}/100</span>
                          </span>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">{aiAnalysis.resumen}</p>
                      </div>

                      {/* Recommendations */}
                      {aiAnalysis.recomendaciones?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600" />
                            Plan de Mitigación y Recomendaciones
                          </p>
                          <ul className="space-y-2">
                            {aiAnalysis.recomendaciones.map((r, i) => (
                              <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                                <span className="text-red-600 font-bold mt-0.5 shrink-0">→</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Key vulnerabilities */}
                      {aiAnalysis.vulnerabilidadesPrincipales?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-700" />
                            Vulnerabilidades Principales Identificadas
                          </p>
                          <div className="space-y-2.5">
                            {aiAnalysis.vulnerabilidadesPrincipales.map((v, i) => (
                              <div key={i} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-red-200 transition-colors">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-slate-900">{v.nombre}</p>
                                  {v.cvss && (
                                    <span className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                                      CVSS {v.cvss}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{v.descripcion}</p>
                                <p className="text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded border border-amber-100 mt-2 font-medium">
                                  <strong>Impacto Operativo:</strong> {v.impacto}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Análisis IA no disponible.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-mono">
            {scanResult ? `Escaneado: ${new Date(scanResult.scanDate).toLocaleString('es-PE')}` : 'Escaneando...'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
