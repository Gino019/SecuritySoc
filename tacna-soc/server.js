import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import dns from 'dns';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ─────────────────────────────────────────────
// CLOUD RUN HEALTH CHECK ENDPOINT
// ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'tacna-soc-web',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────
// DNS IP RESOLUTION ENDPOINT
// ─────────────────────────────────────────────
app.get('/api/resolve-ip', async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: 'host requerido' });
  try {
    const cleanHost = String(host).replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    const lookup = await dns.promises.lookup(cleanHost);
    res.json({ ip: lookup.address, hostname: cleanHost });
  } catch (err) {
    res.status(404).json({ error: 'No se pudo resolver la IP vía DNS: ' + err.message });
  }
});

// ─────────────────────────────────────────────
// REAL SECURITY SCAN ENDPOINT
// ─────────────────────────────────────────────
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });
  try {
    const result = await performSecurityScan(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// NVD CVE SEARCH ENDPOINT
// ─────────────────────────────────────────────
app.get('/api/cve/search', async (req, res) => {
  const { keyword = 'web', limit = 5 } = req.query;
  try {
    const nvdRes = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=${limit}`
    );
    if (!nvdRes.ok) throw new Error('NVD API no disponible');
    const data = await nvdRes.json();
    const cves = (data.vulnerabilities || []).map(v => ({
      id: v.cve.id,
      description: v.cve.descriptions?.find(d => d.lang === 'en')?.value || '',
      severity: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
      score: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || null,
      published: v.cve.published?.slice(0, 10),
    }));
    res.json(cves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// SOC HEURISTIC AI DIAGNOSTIC ENGINE (FALLBACK)
// ─────────────────────────────────────────────
function generateSocAiAnalysis(scanResult, targetUrl) {
  const findings = scanResult?.findings || [];
  const server = scanResult?.server || 'Desconocido';
  const poweredBy = scanResult?.poweredBy || '';
  const isHttps = scanResult?.isHttps ?? true;
  const critical = scanResult?.critical || 0;
  const high = scanResult?.high || 0;
  const medium = scanResult?.medium || 0;
  const low = scanResult?.low || 0;
  const totalFindings = scanResult?.totalFindings || findings.length;

  // Calculate security score (0 - 100)
  let score = 100 - (critical * 25) - (high * 15) - (medium * 8) - (low * 3);
  if (!isHttps) score -= 30;
  score = Math.max(15, Math.min(98, score));

  // Determine general risk level
  let riesgoGeneral = 'Bajo';
  if (critical > 0 || score < 45 || !isHttps) {
    riesgoGeneral = 'Crítico';
  } else if (high > 0 || score < 70) {
    riesgoGeneral = 'Alto';
  } else if (medium > 0 || score < 85) {
    riesgoGeneral = 'Medio';
  }

  const isLegacyPhp = /php\/5\./i.test(server) || /php\/5\./i.test(poweredBy);
  const cleanTarget = (targetUrl || 'el objetivo').replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  // Executive summary
  let resumen = `Evaluación DAST perimetral generada por el Centro de Operaciones de Seguridad (SOC) para el activo institucional ${cleanTarget}. `;
  if (!isHttps) {
    resumen += `ALERTA CRÍTICA: El canal de comunicación no dispone de certificado TLS/HTTPS activo, transmitiendo datos y credenciales en texto plano susceptible a intercepción Man-in-the-Middle (MitM). `;
  } else if (isLegacyPhp) {
    resumen += `El servidor aloja una pila de software desfasada (${server} ${poweredBy ? '/ ' + poweredBy : ''}) en estado End-Of-Life (EOL), con vulnerabilidades críticas registradas en CVE para denegación de servicio y ejecución remota de código (RCE). `;
  } else if (high > 0) {
    resumen += `Se identificaron ${totalFindings} debilidades perimetrales en las cabeceras HTTP de respuesta, destacando la carencia de políticas CSP y HSTS para mitigación de ataques XSS y secuestro de sesiones. `;
  } else {
    resumen += `La superficie perimetral se mantiene estable con ${totalFindings} observaciones de divulgación de banners de software e información del entorno. `;
  }
  resumen += `Se asigna una puntuación de blindaje de ${score}/100 y una calificación de riesgo general ${riesgoGeneral.toUpperCase()}.`;

  // Actionable recommendations
  const recomendaciones = [];
  if (!isHttps) {
    recomendaciones.push("Habilitar certificado SSL/TLS (Let's Encrypt o corporativo) y forzar la redirección permanente HTTP 301 a HTTPS.");
  }
  if (findings.some(f => f.name.includes('CSP') || f.cwe === 'CWE-79')) {
    recomendaciones.push("Implementar la cabecera Content-Security-Policy (CSP) restrictiva con 'default-src self' para neutralizar inyecciones de script malicioso (XSS).");
  }
  if (findings.some(f => f.name.includes('HSTS') || f.cwe === 'CWE-319')) {
    recomendaciones.push("Configurar Strict-Transport-Security (HSTS) con max-age=31536000 e includeSubDomains para forzar navegación cifrada.");
  }
  if (isLegacyPhp) {
    recomendaciones.push("Migrar urgentemente el entorno PHP 5.5 a una versión con soporte de parches de seguridad activo (PHP 8.2+) para eliminar fallos RCE conocidos.");
  }
  if (findings.some(f => f.name.includes('Server') || f.name.includes('X-Powered-By') || f.cwe === 'CWE-200')) {
    recomendaciones.push("Ocultar cabeceras de identificación de software en el servidor web (ServerTokens Prod en Apache / expose_php = Off en php.ini).");
  }
  if (findings.some(f => f.name.includes('X-Frame-Options') || f.cwe === 'CWE-1021')) {
    recomendaciones.push("Añadir X-Frame-Options: SAMEORIGIN o directiva frame-ancestors en CSP para prevenir ataques de Clickjacking.");
  }
  if (findings.some(f => f.name.includes('X-Content-Type-Options') || f.cwe === 'CWE-430')) {
    recomendaciones.push("Configurar X-Content-Type-Options: nosniff para impedir ataques basados en confusión de tipos MIME.");
  }
  if (recomendaciones.length === 0) {
    recomendaciones.push("Mantener el monitoreo continuo de cabeceras de seguridad y análisis DAST periódico en el SOC.");
    recomendaciones.push("Programar auditorías de código estático (SAST) complementarias en los portales institucionales.");
  }

  // Key vulnerabilities with CVSS
  const vulnerabilidadesPrincipales = [];
  if (isLegacyPhp) {
    vulnerabilidadesPrincipales.push({
      nombre: "Software EOL Desactualizado (PHP 5.5 / Apache 2.4 EOL)",
      descripcion: `El servidor web divulga "${server} ${poweredBy}". La versión detectada carece de parches oficiales desde 2016 y cuenta con más de 30 vulnerabilidades públicas documentadas.`,
      impacto: "Posible explotación de fallos de desbordamiento de búfer y ejecución remota de comandos (RCE) por actores maliciosos.",
      cvss: 8.8
    });
  }
  if (findings.some(f => f.name.includes('CSP') || f.cwe === 'CWE-79')) {
    vulnerabilidadesPrincipales.push({
      nombre: "Ausencia de Content Security Policy (CSP)",
      descripcion: "El servidor no especifica restricciones de origen para scripts, estilos o peticiones asíncronas externas.",
      impacto: "Permite la ejecución de scripts arbitrarios en el navegador del cliente mediante Cross-Site Scripting (XSS).",
      cvss: 7.5
    });
  }
  if (findings.some(f => f.name.includes('HSTS') || f.cwe === 'CWE-319')) {
    vulnerabilidadesPrincipales.push({
      nombre: "Falta de Forzado de Encriptación HSTS",
      descripcion: "Ausencia de la cabecera Strict-Transport-Security en las respuestas del servidor.",
      impacto: "Vulnerabilidad a ataques de degradación de cifrado (SSL-Stripping) en redes locales no seguras.",
      cvss: 7.2
    });
  }
  if (findings.some(f => f.name.includes('Server') || f.name.includes('X-Powered-By') || f.cwe === 'CWE-200')) {
    vulnerabilidadesPrincipales.push({
      nombre: "Divulgación de Información de Servidor (Banner Exposure)",
      descripcion: `Exposición pública de versiones detalladas: ${server} ${poweredBy}.`,
      impacto: "Facilita la fase de reconocimiento de atacantes para búsqueda automatizada de exploits compatibles.",
      cvss: 5.3
    });
  }
  if (findings.some(f => f.name.includes('X-Frame-Options') || f.cwe === 'CWE-1021')) {
    vulnerabilidadesPrincipales.push({
      nombre: "Vulnerabilidad a Clickjacking (Sin X-Frame-Options)",
      descripcion: "El aplicativo carece de directivas para impedir que sea cargado en elementos <iframe> de otros sitios.",
      impacto: "Un atacante puede inducir a usuarios a realizar acciones no deseadas superponiendo interfaces transparentes.",
      cvss: 5.4
    });
  }

  if (vulnerabilidadesPrincipales.length === 0 && findings.length > 0) {
    const first = findings[0];
    vulnerabilidadesPrincipales.push({
      nombre: first.name,
      descripcion: first.description,
      impacto: "Aumento de la superficie de ataque perimetral del sistema web.",
      cvss: first.severity === 'CRITICAL' ? 9.0 : first.severity === 'HIGH' ? 7.5 : first.severity === 'MEDIUM' ? 5.5 : 3.5
    });
  }

  return {
    resumen,
    riesgoGeneral,
    puntuacion: score,
    recomendaciones: recomendaciones.slice(0, 5),
    vulnerabilidadesPrincipales: vulnerabilidadesPrincipales.slice(0, 4),
    motor: 'Motor de Inteligencia SOC (Automático)'
  };
}

// ─────────────────────────────────────────────
// GEMINI AI ANALYSIS ENDPOINT (WITH AUTO FALLBACK)
// ─────────────────────────────────────────────
app.post('/api/ai/analyze', async (req, res) => {
  const { scanResult, url, apiKey } = req.body;
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  // If Gemini API Key is configured, attempt call to Google Gemini
  if (activeKey && activeKey !== 'MY_GEMINI_API_KEY') {
    try {
      const findings = (scanResult?.findings || [])
        .map(f => `- [${f.severity}] ${f.name}: ${f.description}`)
        .join('\n');

      const prompt = `Eres un experto en ciberseguridad del SOC de Tacna, Peru. Analiza estos resultados de escaneo de seguridad y responde SOLO con un JSON valido sin markdown.

URL analizada: ${url || scanResult?.url}
Servidor: ${scanResult?.server || 'desconocido'}
HTTPS: ${scanResult?.isHttps ? 'Si' : 'No'}
Tiempo de respuesta: ${scanResult?.responseTime || 0}ms
Hallazgos (${scanResult?.totalFindings || 0}):
${findings || 'Ninguno encontrado'}

Responde con este JSON exacto:
{
  "resumen": "parrafo conciso del estado de seguridad",
  "riesgoGeneral": "Critico o Alto o Medio o Bajo",
  "puntuacion": numero del 0 al 100,
  "recomendaciones": ["recomendacion 1", "recomendacion 2", "recomendacion 3"],
  "vulnerabilidadesPrincipales": [
    {"nombre": "nombre", "descripcion": "descripcion", "impacto": "impacto", "cvss": numero}
  ]
}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
          })
        }
      );
      clearTimeout(timeoutId);

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return res.json({
            ...analysis,
            motor: 'Google Gemini 2.0 Flash'
          });
        }
      } else {
        const errData = await geminiRes.json().catch(() => ({}));
        console.warn('[Gemini API] Error al consultar Google AI:', errData.error?.message || geminiRes.statusText);
      }
    } catch (geminiErr) {
      console.warn('[Gemini API] Fallo en la llamada remota, activando motor heurístico SOC:', geminiErr.message);
    }
  }

  // Graceful Fallback: Generate specialized SOC heuristic analysis report
  const socAnalysis = generateSocAiAnalysis(scanResult, url || scanResult?.url);
  return res.json(socAnalysis);
});

// ─────────────────────────────────────────────
// CONFIG GEMINI KEY ENDPOINT
// ─────────────────────────────────────────────
app.post('/api/ai/config-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'API Key inválida' });
  }
  process.env.GEMINI_API_KEY = apiKey.trim();
  res.json({
    success: true,
    message: 'GEMINI_API_KEY configurada exitosamente en el servidor',
    configured: true
  });
});

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: hasKey,
    motorActivo: hasKey ? 'Google Gemini 2.0 Flash' : 'Motor SOC Heurístico'
  });
});

// ─────────────────────────────────────────────
// SECURITY SCAN ENGINE
// ─────────────────────────────────────────────
function performSecurityScan(targetUrl) {
  return new Promise((resolve) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    } catch {
      return resolve({
        url: targetUrl, error: 'URL invalida', findings: [],
        totalFindings: 0, critical: 0, high: 0, medium: 0, low: 0,
        scanDate: new Date().toISOString(), isHttps: false
      });
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    const startTime = Date.now();
    const findings = [];

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname || '/',
      method: 'HEAD',
      timeout: 12000,
      rejectUnauthorized: false,
      headers: { 'User-Agent': 'TacnaSOC-Scanner/2.0' }
    };

    const reqHttp = client.request(options, (response) => {
      const h = response.headers;

      const headerChecks = [
        { 
          key: 'strict-transport-security', 
          label: 'HSTS (Strict-Transport-Security)', 
          sev: 'HIGH',   
          cwe: 'CWE-319',
          owasp: 'A05:2021-Security Misconfiguration',
          cvss: 7.5,
          meaning: 'Permite a un atacante en la red degradar la conexión de los usuarios de HTTPS a HTTP inseguro (SSL Stripping) sin alertas.',
          evidence: 'Cabecera Strict-Transport-Security no emitida.',
          fix: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
          apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
          nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;'
        },
        { 
          key: 'x-frame-options',           
          label: 'X-Frame-Options (Clickjacking)',      
          sev: 'MEDIUM', 
          cwe: 'CWE-1021',
          owasp: 'A05:2021-Security Misconfiguration',
          cvss: 5.4,
          meaning: 'Una página externa puede incrustar tu web en un iframe invisible y engañar al visitante para pulsar botones sin su consentimiento.',
          evidence: 'Cabecera X-Frame-Options no configurada.',
          fix: 'X-Frame-Options: SAMEORIGIN',
          apache: 'Header always set X-Frame-Options "SAMEORIGIN"',
          nginx: 'add_header X-Frame-Options "SAMEORIGIN" always;'
        },
        { 
          key: 'x-content-type-options',    
          label: 'X-Content-Type-Options',
          sev: 'MEDIUM', 
          cwe: 'CWE-430',
          owasp: 'A05:2021-Security Misconfiguration',
          cvss: 5.0,
          meaning: 'Impide que los navegadores interpreten archivos como tipos MIME distintos (MIME Sniffing), previniendo ejecución de scripts encubiertos.',
          evidence: 'Cabecera X-Content-Type-Options ausente.',
          fix: 'X-Content-Type-Options: nosniff',
          apache: 'Header always set X-Content-Type-Options "nosniff"',
          nginx: 'add_header X-Content-Type-Options "nosniff" always;'
        },
        { 
          key: 'content-security-policy',   
          label: 'Content Security Policy (CSP)', 
          sev: 'HIGH', 
          cwe: 'CWE-79',
          owasp: 'A03:2021-Injection',
          cvss: 7.8,
          meaning: 'Al no tener CSP restrictivo, el navegador ejecutará cualquier script malicioso inyectado (Cross-Site Scripting - XSS) por atacantes.',
          evidence: 'Cabecera Content-Security-Policy no emitida.',
          fix: 'Content-Security-Policy: default-src \'self\'; script-src \'self\'; object-src \'none\';',
          apache: 'Header set Content-Security-Policy "default-src \'self\'; script-src \'self\' https://cdn.jsdelivr.net; style-src \'self\' \'unsafe-inline\'; object-src \'none\';"',
          nginx: 'add_header Content-Security-Policy "default-src \'self\'; script-src \'self\' https://cdn.jsdelivr.net; style-src \'self\' \'unsafe-inline\'; object-src \'none\';" always;'
        },
        { 
          key: 'referrer-policy',           
          label: 'Referrer-Policy',      
          sev: 'LOW',    
          cwe: 'CWE-200',
          owasp: 'A05:2021-Security Misconfiguration',
          cvss: 3.1,
          meaning: 'Protege las URLs internas con tokens o parámetros sensibles para que no se filtren a servicios externos en cabeceras Referer.',
          evidence: 'Cabecera Referrer-Policy ausente.',
          fix: 'Referrer-Policy: strict-origin-when-cross-origin',
          apache: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
          nginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;'
        },
        { 
          key: 'permissions-policy',        
          label: 'Permissions-Policy',   
          sev: 'LOW',    
          cwe: 'CWE-732',
          owasp: 'A05:2021-Security Misconfiguration',
          cvss: 3.0,
          meaning: 'Restringe el acceso no autorizado a hardware sensible del cliente como cámara, micrófono o geolocalización.',
          evidence: 'Cabecera Permissions-Policy no establecida.',
          fix: 'Permissions-Policy: camera=(), microphone=(), geolocation=()',
          apache: 'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
          nginx: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;'
        },
      ];

      for (const check of headerChecks) {
        if (!h[check.key]) {
          findings.push({
            type: 'MISSING_SECURITY_HEADER',
            name: `Cabecera ausente: ${check.label}`,
            severity: check.sev,
            cwe: check.cwe,
            owaspCategory: check.owasp,
            cvssScore: check.cvss,
            evidence: check.evidence,
            meaning: check.meaning,
            description: `El servidor no incluye la cabecera de seguridad "${check.key}". Aumenta la superficie de ataque.`,
            remediation: check.fix,
            apacheSnippet: check.apache,
            nginxSnippet: check.nginx
          });
        }
      }

      if (!isHttps) {
        findings.push({
          type: 'INSECURE_TRANSPORT', 
          name: 'Sin cifrado HTTPS (Transporte Inseguro)',
          severity: 'CRITICAL', 
          cwe: 'CWE-319',
          owaspCategory: 'A02:2021-Cryptographic Failures',
          cvssScore: 9.1,
          evidence: 'Petición atendida en puerto 80 sin protocolo TLS.',
          meaning: 'Las credenciales y datos confidenciales se transmiten en texto claro, permitiendo intercepción directa en la red (MitM).',
          description: 'El sitio no usa HTTPS. Las credenciales y datos viajan en texto claro.',
          remediation: 'Instalar certificado TLS con Let\'s Encrypt y redirigir HTTP a HTTPS.',
          apacheSnippet: 'RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
          nginxSnippet: 'server {\n    listen 80;\n    server_name dominio.pe;\n    return 301 https://$host$request_uri;\n}'
        });
      }

      if (h['server'] && /\d/.test(h['server'])) {
        findings.push({
          type: 'INFORMATION_DISCLOSURE', 
          name: 'Versión de servidor expuesta',
          severity: 'LOW', 
          cwe: 'CWE-200',
          owaspCategory: 'A05:2021-Security Misconfiguration',
          cvssScore: 3.2,
          evidence: `Cabecera HTTP Server: "${h['server']}"`,
          meaning: 'Permite a escáneres maliciosos consultar vulnerabilidades y exploits conocidos para esa versión específica.',
          description: `Cabecera Server revela: "${h['server']}"`,
          remediation: 'Ocultar la versión en la configuración del servidor web.',
          apacheSnippet: 'ServerTokens Prod\nServerSignature Off',
          nginxSnippet: 'server_tokens off;'
        });
      }

      if (h['x-powered-by']) {
        findings.push({
          type: 'INFORMATION_DISCLOSURE', 
          name: 'Cabecera X-Powered-By expuesta',
          severity: 'LOW', 
          cwe: 'CWE-200',
          owaspCategory: 'A05:2021-Security Misconfiguration',
          cvssScore: 3.1,
          evidence: `Cabecera HTTP X-Powered-By: "${h['x-powered-by']}"`,
          meaning: 'Divulga el framework o lenguaje de backend facilitando ataques dirigidos contra el motor web.',
          description: `Tecnología revelada: "${h['x-powered-by']}"`,
          remediation: 'Eliminar X-Powered-By del servidor.',
          apacheSnippet: 'Header unset X-Powered-By',
          nginxSnippet: 'fastcgi_hide_header X-Powered-By;'
        });
      }

      const rawCookies = h['set-cookie'];
      if (rawCookies) {
        const cookieStr = (Array.isArray(rawCookies) ? rawCookies : [rawCookies]).join(' ');
        if (!cookieStr.toLowerCase().includes('httponly')) {
          findings.push({
            type: 'INSECURE_COOKIE', 
            name: 'Cookies sin HttpOnly',
            severity: 'MEDIUM', 
            cwe: 'CWE-1004',
            owaspCategory: 'A01:2021-Broken Access Control',
            cvssScore: 4.8,
            evidence: 'Cabecera Set-Cookie carece de flag HttpOnly.',
            meaning: 'Permite que scripts maliciosos (XSS) roben la cookie de sesión y suplanten al usuario.',
            description: 'Cookies de sesión accesibles vía JavaScript (riesgo XSS).',
            remediation: 'Agregar el atributo HttpOnly a todas las cookies.',
            apacheSnippet: 'Header edit Set-Cookie ^(.*)$ "$1; HttpOnly"',
            nginxSnippet: 'proxy_cookie_flags ~* httponly;'
          });
        }
        if (isHttps && !cookieStr.toLowerCase().includes('secure')) {
          findings.push({
            type: 'INSECURE_COOKIE', 
            name: 'Cookies sin atributo Secure',
            severity: 'MEDIUM', 
            cwe: 'CWE-614',
            owaspCategory: 'A01:2021-Broken Access Control',
            cvssScore: 4.5,
            evidence: 'Cabecera Set-Cookie carece de flag Secure en sitio HTTPS.',
            meaning: 'La cookie puede ser enviada por conexiones HTTP no cifradas en solicitudes secundarias.',
            description: 'Cookies pueden transmitirse por HTTP no cifrado.',
            remediation: 'Agregar el atributo Secure a las cookies sensibles.',
            apacheSnippet: 'Header edit Set-Cookie ^(.*)$ "$1; Secure"',
            nginxSnippet: 'proxy_cookie_flags ~* secure;'
          });
        }
      }

      const duration = Date.now() - startTime;
      resolve({
        url: targetUrl,
        statusCode: response.statusCode,
        responseTime: duration,
        server: h['server'] || 'No revelado',
        poweredBy: h['x-powered-by'] || null,
        isHttps,
        findings,
        totalFindings: findings.length,
        critical: findings.filter(f => f.severity === 'CRITICAL').length,
        high:     findings.filter(f => f.severity === 'HIGH').length,
        medium:   findings.filter(f => f.severity === 'MEDIUM').length,
        low:      findings.filter(f => f.severity === 'LOW').length,
        scanDate: new Date().toISOString(),
      });
    });

    reqHttp.on('timeout', () => {
      reqHttp.destroy();
      resolve({
        url: targetUrl, error: 'Timeout (>12s)',
        findings: [{ type: 'TIMEOUT', name: 'Timeout de conexion', severity: 'HIGH', cwe: 'CWE-400',
          description: 'El sitio no respondio en el tiempo esperado.',
          remediation: 'Verificar disponibilidad y rendimiento del servidor.' }],
        totalFindings: 1, critical: 0, high: 1, medium: 0, low: 0,
        isHttps: false, scanDate: new Date().toISOString(),
      });
    });

    reqHttp.on('error', (err) => {
      resolve({
        url: targetUrl, error: err.message,
        findings: [{ type: 'CONNECTION_ERROR', name: 'Error de conexion', severity: 'CRITICAL', cwe: 'CWE-693',
          description: `No se pudo conectar: ${err.message}`,
          remediation: 'Verificar que el sitio esta en linea y accesible.' }],
        totalFindings: 1, critical: 1, high: 0, medium: 0, low: 0,
        isHttps: false, scanDate: new Date().toISOString(),
      });
    });

    reqHttp.end();
  });
}

// SPA fallback
app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Tacna SOC API</title></head>
        <body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
          <h1>🛡️ Tacna SOC Backend API</h1>
          <p>Servidor Node.js / Express activo en puerto ${PORT}.</p>
          <p>La carpeta <code>dist/</code> no se encuentra construida en este entorno. Ejecute <code>npm run build</code> para servir el frontend de React.</p>
          <p><a href="/api/health" style="color: #38bdf8;">Verificar /api/health</a></p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TacnaSOC Server corriendo en puerto ${PORT}`);
  console.log(`Gemini AI: ${GEMINI_API_KEY ? 'Configurado' : 'Sin API Key'}`);
});
