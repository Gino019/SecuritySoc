---
name: tacna-soc-audit
description: >-
  Audita el estado de integración de componentes de Tacna SOC, verificando si consumen Supabase, Express API o mockData.ts.
---

# Auditoría de Componentes - Tacna SOC

Esta habilidad describe el procedimiento para verificar el origen de datos de cada vista y componente del SOC de Tacna.

## Procedimiento de Verificación
1. **Revisar `App.tsx`**:
   - Inspeccionar los `useState` iniciales y las llamadas en `useEffect`.
   - Verificar si la vista recibe props desde un estado alimentado por `supabase.ts` (`getWebsitesFromDb`, `getEvaluationsFromDb`, `getUsersFromDb`, `getAuditLogsFromDb`).
2. **Revisar `src/components/<NombreVista>.tsx`**:
   - Comprobar si importa directamente `supabase.ts`, `api.ts`, o `mockData.ts`.
   - Identificar si las mutaciones invocan callbacks hacia `App.tsx` que persisten en base de datos.
3. **Revisar `server.js`**:
   - Comprobar si la vista depende de endpoints de Express (`/api/scan`, `/api/resolve-ip`, `/api/cve/search`, `/api/ai/analyze`).
4. **Clasificación**:
   - **Conectado a Supabase**: La vista recibe datos sincronizados de PostgreSQL y persiste cambios en Supabase.
   - **Híbrido**: Parte de los datos provienen de Supabase (ej. sitio), pero otros dependen de `mockData.ts` (ej. vulnerabilidades vinculadas).
   - **Solo Mock**: La vista opera exclusivamente con datos en memoria definidos en `src/mockData.ts`.
   - **Solo Backend Express**: La vista consume endpoints del servidor Express sin persistencia relacional directa en Supabase.

