# Estándares de Código y Calidad - Tacna SOC

## 1. Stack Tecnológico
- **Frontend**: React 19, TypeScript ~5.8, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js 20+, Express 4.x, ES Modules (`"type": "module"`).
- **Integraciones**: Supabase Client (`@supabase/supabase-js`), Google Gemini SDK (`@google/genai`), NVD NIST REST API v2.0.

## 2. Convenciones de TypeScript y React
- **Tipado Estricto**: Todo componente o función debe tener interfaces definidas en `src/types.ts`. Evitar el uso indiscriminado de `any`.
- **Estructura de Componentes**:
  - Componentes funcionales con interfaces explícitas para Props.
  - Gestión de estado limpia: evitar duplicación de estado entre `App.tsx` y vistas secundarias.
  - Manejo de errores con `ErrorBoundary` en vistas críticas.
- **Estilos**:
  - Utilizar clases utilitarias de Tailwind CSS v4.
  - Mantener la paleta institucional (fondos oscuros tipo SOC / ciberseguridad, acentos rojos para criticidad/riesgo alto, ámbar para medio, verde para mitigado/seguro).

## 3. Manejo de Datos y Estado
- **Transición Mock a Base de Datos**:
  - Al convertir una vista que usa `mockData.ts` a Supabase, mantener `mockData.ts` como valor de inicialización o fallback ante errores de conexión.
  - Mantener la integridad de los contratos de datos existentes para no romper vistas dependientes (ej. `WebsiteItem`, `VulnerabilityItem`, `EvaluationItem`, `SystemUser`, `AuditLogItem`).
- **Auditoría (Audit Logs)**:
  - Toda mutación relevante (creación de sitio, escaneo, cambio de rol, cambio de contraseña) debe emitir un registro de auditoría con checksum SHA-256 mediante `insertAuditLogToDb`.

