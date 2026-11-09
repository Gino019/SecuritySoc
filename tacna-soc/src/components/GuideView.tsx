import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ShieldAlert,
  Users,
  ScrollText,
  Sparkles,
  HelpCircle,
  Activity
} from 'lucide-react';
import { NavigationTab } from '../types';

interface GuideViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenNewScan?: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onNavigateTab, onOpenNewScan }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Cómo realiza Tacna SOC el escaneo de seguridad en sitios web?',
      a: 'El motor del SOC efectúa una petición HTTP/HTTPS real sobre el portal objetivo, analizando la presencia y configuración de cabeceras críticas de seguridad (HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options) y atributos seguros de cookies (HttpOnly, Secure, SameSite). Con base en las directivas detectadas, calcula una puntuación cuantitativa (0 a 100) y su correspondiente letra de calificación (A a F).'
    },
    {
      q: '¿Cómo asiste la Inteligencia Artificial (Google Gemini) en los resultados?',
      a: 'Una vez detectadas las debilidades técnicas, Gemini AI 2.0 Flash evalúa el contexto de la entidad, redacta una explicación comprensible para directivos no técnicos y proporciona los fragmentos de configuración listos para aplicar en servidores web Apache (.htaccess) y Nginx (nginx.conf).'
    },
    {
      q: '¿Qué garantizan los Logs de Auditoría con hash criptográfico SHA-256?',
      a: 'Cada acción crítica (inicio de sesión, escaneo perimetral o modificación de usuarios) genera un registro inmutable con firma criptográfica SHA-256. Esto asegura la no-repudiación y garantiza que la bitácora no haya sido manipulada, cumpliendo con estándares como ISO/IEC 27001.'
    },
    {
      q: '¿Cómo accedo a la suite de Inteligencia de Negocios (6 Reportes)?',
      a: 'En el menú lateral haz clic en "Reportes BI". Dispones de una barra de filtros superior para analizar métricas históricas filtrando por Año (2025 o 2026), Mes y Día, con opción de exportar a formato Excel (CSV) o imprimir en PDF.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Encabezado Principal */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Guía Esencial de Usuario y Metodología SOC
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Conceptos clave, flujo de escaneo perimetral y parámetros de evaluación de seguridad.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewScan ? onOpenNewScan() : onNavigateTab('scanner')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Ir al Escáner Web</span>
        </button>
      </div>

      {/* SECCIÓN 1: FLUJO RÁPIDO EN 3 PASOS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-bold text-slate-900">
            Flujo de Evaluación en 3 Pasos
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-mono font-bold text-sm flex items-center justify-center">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">Ingresar la URL Objetivo</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pega cualquier dirección web en la barra del Escáner. El sistema detectará automáticamente el sector institucional o universal.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-mono font-bold text-sm flex items-center justify-center">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">Análisis Perimetral en Vivo</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              El motor inspecciona cabeceras HTTP de seguridad, certificados SSL/TLS, stack tecnológico y vectores críticos de riesgo OWASP.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-mono font-bold text-sm flex items-center justify-center">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">Diagnóstico &amp; Remediación</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Revisa la calificación de seguridad (A-F), el desglose de severidad y las reglas de remediación listas para copiar en Apache o Nginx.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ESCALA DE CALIFICACIÓN DE SEGURIDAD (A - F) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-bold text-slate-900">
            Escala de Calificación de Seguridad (A – F)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 text-center space-y-1">
            <div className="text-2xl font-black text-emerald-600 font-mono">A</div>
            <div className="text-[11px] font-bold text-slate-800">90 - 100 pts</div>
            <div className="text-[10px] text-emerald-700 font-medium">Excelente Seguridad</div>
          </div>

          <div className="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/40 text-center space-y-1">
            <div className="text-2xl font-black text-teal-600 font-mono">B</div>
            <div className="text-[11px] font-bold text-slate-800">75 - 89 pts</div>
            <div className="text-[10px] text-teal-700 font-medium">Seguro con Notas</div>
          </div>

          <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 text-center space-y-1">
            <div className="text-2xl font-black text-amber-600 font-mono">C</div>
            <div className="text-[11px] font-bold text-slate-800">50 - 74 pts</div>
            <div className="text-[10px] text-amber-700 font-medium">Riesgo Moderado</div>
          </div>

          <div className="p-3.5 rounded-2xl border border-orange-200 bg-orange-50/40 text-center space-y-1">
            <div className="text-2xl font-black text-orange-600 font-mono">D</div>
            <div className="text-[11px] font-bold text-slate-800">30 - 49 pts</div>
            <div className="text-[10px] text-orange-700 font-medium">Alto Riesgo</div>
          </div>

          <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 text-center space-y-1 col-span-2 sm:col-span-1">
            <div className="text-2xl font-black text-rose-600 font-mono">F</div>
            <div className="text-[11px] font-bold text-slate-800">&lt; 30 pts</div>
            <div className="text-[10px] text-rose-700 font-medium">Crítico / Inseguro</div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: ROLES Y PERMISOS DEL SISTEMA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-bold text-slate-900">
            Perfiles y Niveles de Acceso (RBAC)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
              Super Admin
            </span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Gestión Central Total</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Administración de analistas, asignación de roles, gestión de credenciales y configuración global del SOC.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              Security Analyst
            </span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Operaciones de Seguridad</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Auditorías DAST, inspección de debilidades técnicas, análisis asistido por IA y consulta de ciberinteligencia.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
              Auditor
            </span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Cumplimiento y Forense</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Revisión inmutable de bitácoras de auditoría SHA-256 y verificación de trazabilidad para normativas de seguridad.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Operator
            </span>
            <h4 className="text-xs font-bold text-slate-900 pt-1">Monitoreo Operativo</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Seguimiento continuo de disponibilidad perimetral y visualización de dashboards y métricas de riesgo.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: PREGUNTAS FRECUENTES (FAQ) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-bold text-slate-900">
            Preguntas Frecuentes
          </h3>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left bg-slate-50/70 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 pr-4">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
