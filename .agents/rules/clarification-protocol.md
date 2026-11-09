---
trigger: always_on
description: Protocolo de Cero Suposiciones y Aclaración Obligatoria antes de programar
---

# Protocolo de Cero Suposiciones (Zero-Assumption Protocol)

> **REGLA DE ORO**: Nunca des por sentado ningún detalle de un requisito funcional o regla de negocio. Si falta definir roles, validaciones, estructura de tablas o comportamiento de UI/Backend, detente y hazme preguntas concretas con opciones (A, B, C) antes de escribir código.

---

## 1. Mandato Fundamental
Cuando el usuario solicite un nuevo requisito, modificación de lógica de negocio o cambio en la persistencia de datos:
1. **NO asumas** valores por defecto no documentados, nombres de columnas arbitrarios ni reglas de autorización implícitas.
2. **NO inventes** comportamiento para casos borde sin consultarlo previamente.
3. **NO escribas código ni scripts de base de datos** si existen ambigüedades sobre:
   - Permisos y roles autorizados (según los 4 perfiles del FD03: Super Admin, Security Analyst, Auditor, Operator).
   - Validaciones de entrada y manejo de errores.
   - Estructura y tipos de datos en PostgreSQL / Supabase.
   - Si la funcionalidad debe persistir en base de datos o manejarse en memoria / backend Express.
   - Experiencia de usuario (UX) o feedback en pantalla (toasts, modales, redirecciones).

---

## 2. Formato Obligatorio para Preguntas de Aclaración
Al detectar una duda o detalle pendiente, debes formular preguntas concretas estructuradas de la siguiente manera:
- **Contexto del Requisito**: Breve explicación de por qué surge la duda y qué componente o tabla afecta.
- **Opciones Estructuradas (A, B, C...)**:
  - **Opción A (Recomendada)**: La solución óptima alineada con el SRS (FD03) y SAD (FD04).
  - **Opción B**: Alternativa simplificada o estándar.
  - **Opción C**: Alternativa personalizada o conservadora.
- **Impacto**: Qué implicancias tiene cada opción en el frontend, backend o base de datos.

---

## 3. Puntos de Control Obligatorios (Checkpoints)
Antes de generar código, verifica:
- [ ] ¿Está cubierto por el FD03 (SRS) o es un requerimiento nuevo?
- [ ] ¿Afecta el modelo de datos relacional de Supabase (tablas, RLS, relaciones)?
- [ ] ¿Requiere endpoints en `server.js` o llamadas directas en `src/supabase.ts`?
- [ ] ¿Se especificó qué roles tienen acceso y cuáles deben ver la acción bloqueada o deshabilitada?
- [ ] ¿Se definieron las validaciones de error y estados de carga?

Si cualquiera de estas respuestas no está 100% clara, **detente y pregunta primero**.

