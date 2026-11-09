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

      {/* SECCIÓN 2: ESCALA DE CALIFICACIÓN DE SEGURIDAD (A - F) Y PONDERACIÓN */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">
              Escala de Calificación de Seguridad (A – F) y Ponderación de Puntos
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            El Security Score inicia en una base de 100 puntos y evalúa el blindaje perimetral según las cabeceras HTTP emitidas y los vectores de riesgo detectados.
          </p>
        </div>

        {/* Grilla de Calificaciones con Requisitos y Contenido de Cada Letra */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-emerald-600 font-mono">A</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800 font-bold">90 - 100 pts</span>
              </div>
              <h4 className="text-xs font-bold text-emerald-950 mt-1">Excelente Seguridad</h4>
            </div>
            <div className="text-[11px] text-emerald-900 leading-relaxed border-t border-emerald-200/60 pt-2">
              <p className="font-semibold text-emerald-950 mb-0.5">Qué la conforma:</p>
              0 vulnerabilidades críticas y 0 altas. Dispone de HTTPS forzado, HSTS, política CSP y cookies con flags <span className="font-mono text-[10px]">HttpOnly</span> y <span className="font-mono text-[10px]">Secure</span>.
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-teal-300 bg-teal-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-teal-600 font-mono">B</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-200/70 text-teal-800 font-bold">75 - 89 pts</span>
              </div>
              <h4 className="text-xs font-bold text-teal-950 mt-1">Seguro con Observaciones</h4>
            </div>
            <div className="text-[11px] text-teal-900 leading-relaxed border-t border-teal-200/60 pt-2">
              <p className="font-semibold text-teal-950 mb-0.5">Qué la conforma:</p>
              0 críticas, 0 altas. Presenta de 1 a 3 observaciones medias o bajas (ej. falta cabecera <span className="font-mono text-[10px]">X-Content-Type-Options</span> o divulgación de banner de servidor).
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-amber-600 font-mono">C</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-800 font-bold">50 - 74 pts</span>
              </div>
              <h4 className="text-xs font-bold text-amber-950 mt-1">Riesgo Moderado</h4>
            </div>
            <div className="text-[11px] text-amber-900 leading-relaxed border-t border-amber-200/60 pt-2">
              <p className="font-semibold text-amber-950 mb-0.5">Qué la conforma:</p>
              0 críticas, pero presenta 1 o 2 defectos de severidad alta (ej. ausencia total de CSP frente a XSS o falta de HSTS en portal con login).
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-orange-300 bg-orange-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-orange-600 font-mono">D</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-200/70 text-orange-800 font-bold">30 - 49 pts</span>
              </div>
              <h4 className="text-xs font-bold text-orange-950 mt-1">Alto Riesgo</h4>
            </div>
            <div className="text-[11px] text-orange-900 leading-relaxed border-t border-orange-200/60 pt-2">
              <p className="font-semibold text-orange-950 mb-0.5">Qué la conforma:</p>
              Acumula más de 2 fallos de severidad alta simultáneos (sin CSP, sin HSTS y cookies de sesión expuestas a robo directo vía JavaScript).
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50/50 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-rose-600 font-mono">F</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800 font-bold">&lt; 30 pts</span>
              </div>
              <h4 className="text-xs font-bold text-rose-950 mt-1">Crítico / Inseguro</h4>
            </div>
            <div className="text-[11px] text-rose-900 leading-relaxed border-t border-rose-200/60 pt-2">
              <p className="font-semibold text-rose-950 mb-0.5">Qué la conforma:</p>
              Cualquier sitio web con al menos 1 vulnerabilidad Crítica (CVE conocido de RCE / SQLi, o conexión sin HTTPS transmitiendo credenciales en texto claro).
            </div>
          </div>
        </div>

        {/* Tabla Detallada: Ponderación de Puntos y Controles Evaluados */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ponderación del Motor de Escaneo (Puntos por Control y Penalizaciones)
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/40 text-slate-500 font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Control / Cabecera Evaluada</th>
                  <th className="py-2.5 px-3 font-bold text-center">Puntos que Aporta</th>
                  <th className="py-2.5 px-3 font-bold text-center">Penalización si Falta</th>
                  <th className="py-2.5 px-4 font-bold">Impacto en la Seguridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-slate-700">
                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-900">Protocolo HTTPS / TLS Cifrado</span>
                    <span className="block text-[11px] text-slate-500 font-mono">Puerto 443 con certificado válido</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">+30 pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">-30 pts (Nota F)</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Evita intercepción de credenciales en redes públicas (Man-in-the-Middle).</td>
                </tr>

                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-900">Strict-Transport-Security (HSTS)</span>
                    <span className="block text-[11px] text-slate-500 font-mono">max-age=31536000; includeSubDomains</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">+15 pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-orange-600">-15 pts (Alta)</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Fuerza a los navegadores a conectarse solo por HTTPS, impidiendo ataques de downgrade.</td>
                </tr>

                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-900">Content-Security-Policy (CSP)</span>
                    <span className="block text-[11px] text-slate-500 font-mono">default-src 'self'; script-src ...</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">+15 pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-orange-600">-15 pts (Alta)</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Restringe los orígenes autorizados para scripts; bloquea ataques Cross-Site Scripting (XSS).</td>
                </tr>

                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-900">X-Frame-Options</span>
                    <span className="block text-[11px] text-slate-500 font-mono">DENY o SAMEORIGIN</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">+10 pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600">-8 pts (Media)</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Impide que atacantes embeban el portal en iframes invisibles para secuestro de clics (Clickjacking).</td>
                </tr>

                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-900">X-Content-Type-Options</span>
                    <span className="block text-[11px] text-slate-500 font-mono">nosniff</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">+10 pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600">-8 pts (Media)</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Evita que el navegador ejecute archivos con tipos MIME incorrectos o disfrazados de imágenes.</td>
                </tr>

                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-900">Directivas Seguras de Cookies</span>
                    <span className="block text-[11px] text-slate-500 font-mono">HttpOnly; Secure; SameSite</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">+10 pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600">-8 pts (Media)</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Impide la lectura de la cookie de sesión desde JavaScript y restringe el envío por canal no cifrado.</td>
                </tr>

                <tr className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-900">Ocultamiento de Cabeceras Informativas</span>
                    <span className="block text-[11px] text-slate-500 font-mono">Server / X-Powered-By</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">+10 pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">-3 pts (Baja)</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Oculta versiones de software (Apache, PHP) reduciendo el reconocimiento inicial a atacantes.</td>
                </tr>

                {/* Penalizaciones por Severidad de Hallazgos */}
                <tr className="bg-red-50/40">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-red-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                      Vulnerabilidad Crítica detectada (CVE / Sin HTTPS)
                    </span>
                    <span className="block text-[11px] text-red-800/80 font-mono">CVSS 9.0 - 10.0 / RCE, SQLi, Auth Bypass</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">--</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-red-600">-25 a -30 pts (Nota F)</td>
                  <td className="py-2.5 px-4 text-[11px] text-red-900">Riesgo inminente de compromiso. Degrada automáticamente la calificación perimetral a <strong>F</strong>.</td>
                </tr>

                <tr className="bg-orange-50/40">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-orange-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                      Vulnerabilidad Alta detectada
                    </span>
                    <span className="block text-[11px] text-orange-800/80 font-mono">CVSS 7.0 - 8.9 / Sin CSP, Sin HSTS</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">--</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-orange-600">-15 pts c/u</td>
                  <td className="py-2.5 px-4 text-[11px] text-orange-900">Permite ataques de inyección o degradación SSL. Más de 2 fallos altos reducen la nota a <strong>D</strong>.</td>
                </tr>

                <tr className="bg-amber-50/40">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                      Vulnerabilidad Media detectada
                    </span>
                    <span className="block text-[11px] text-amber-800/80 font-mono">CVSS 4.0 - 6.9 / X-Frame, MIME sniffing, Cookies</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">--</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600">-8 pts c/u</td>
                  <td className="py-2.5 px-4 text-[11px] text-amber-900">Exposición a Clickjacking o lectura de cookies. Si acumula más de 3 medias, califica como <strong>B</strong> o <strong>C</strong>.</td>
                </tr>

                <tr className="bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                      Vulnerabilidad Baja / Informativa
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono">CVSS 0.1 - 3.9 / Server Banner disclosure</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">--</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">-3 pts c/u</td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600">Divulgación de versiones o cabeceras informativas sin vector de explotación directa.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Banner de Fórmula de Cálculo */}
          <div className="p-3.5 bg-slate-100/70 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 font-mono">Fórmula SOC:</span>
              <span className="font-mono text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Score = 100 − (Críticas × 25) − (Altas × 15) − (Medias × 8) − (Bajas × 3) − (30 si falta HTTPS)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 italic">
              Base 100 pts · Mínimo 15 pts · Máximo 98 pts
            </span>
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
