---
name: new-requirement
description: >-
  Flujo de trabajo obligatorio para planificar, validar e implementar nuevos requisitos o cambios funcionales en Tacna SOC sin suposiciones.
---

# Flujo de Implementación de Nuevos Requisitos — Tacna SOC

Este skill define el protocolo paso a paso que todo agente o desarrollador debe seguir para incorporar cualquier funcionalidad o requerimiento nuevo en la plataforma Tacna SOC.

---

## Fase 1: Análisis de Impacto (SRS, SAD y Base de Datos)
Antes de proponer o tocar una sola línea de código:
1. **Revisar Documentación Base**:
   - Contrastar con [FD03_SRS_Inteligencia de Negocios.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/FD03_SRS_Inteligencia%20de%20Negocios.md) para identificar qué requerimiento funcional (RF) o caso de uso (CU) está involucrado.
   - Contrastar con [FD04_SAD_Inteligencia de Negocios.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/FD04_SAD_Inteligencia%20de%20Negocios.md) para verificar patrones arquitectónicos (sección 3.2.4 para base de datos y 3.2.5 para puertos/adaptadores).
2. **Evaluar Impacto en Persistencia y Contratos**:
   - ¿Requiere nuevas tablas, columnas o funciones PL/pgSQL en Supabase?
   - ¿Afecta las interfaces de TypeScript en `src/types.ts`?
   - ¿Requiere nuevos endpoints en `server.js` o métodos en `src/supabase.ts`?
   - ¿Afecta componentes que actualmente usan `mockData.ts`?

---

## Fase 2: Protocolo de Aclaración (Preguntar Dudas al Usuario)
Si el requerimiento contiene detalles abiertos (roles autorizados, validaciones, comportamiento ante fallos, persistencia vs sesión):
1. **Detener la implementación inmediatamente**.
2. **Formular preguntas estructuradas** con opciones de respuesta múltiple (A, B, C), destacando la recomendada.
3. Esperar la confirmación y decisión explícita del usuario antes de proceder.

---

## Fase 3: Implementación Coherente (Código y SQL)
Una vez aclaradas y acordadas las decisiones con el usuario:
1. **Base de Datos Primero**:
   - Escribir scripts SQL idempotentes en `supabase_setup.sql` o migraciones correspondientes, con políticas RLS y valores por defecto seguros.
2. **Contratos y Tipos**:
   - Actualizar `src/types.ts` manteniendo compatibilidad con tipos existentes.
3. **Capa de Servicios y Backend**:
   - Implementar endpoints en `server.js` o métodos de base de datos en `src/supabase.ts` con manejo de errores y fallbacks seguros.
4. **Capa de Interfaz de Usuario**:
   - Integrar componentes en `src/components/` respetando Tailwind CSS v4, estados de carga, manejo de errores y feedback con toasts/modales.
   - Proteger vistas y botones según el rol del usuario autenticado.
5. **Auditoría Obligatoria**:
   - Si la acción muta el estado del sistema, invocar `insertAuditLogToDb` para garantizar trazabilidad.

---

## Fase 4: Registro y Actualización de Memoria
Inmediatamente después de implementar y verificar:
1. Abrir y actualizar [PROJECT_STATE.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/memory/PROJECT_STATE.md).
2. Actualizar la matriz de componentes y fuentes de datos.
3. Registrar la nueva funcionalidad, la fecha y cualquier decisión de diseño relevante para mantener la memoria viva del repositorio.

