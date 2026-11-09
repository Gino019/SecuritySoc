# Reglas de Arquitectura - Tacna SOC

## 1. Contexto y Visión Arquitectural
Este repositorio alberga la plataforma **Tacna SOC — Gestión de Vulnerabilidades**, desarrollada según las especificaciones del **FD03 (SRS)** y el **FD04 (SAD)** de Inteligencia de Negocios (Universidad Privada de Tacna, 2026).

## 2. Principios de Diseño Obligatorios
- **Desacoplamiento Frontend / Backend**: El frontend (`React 19 + TypeScript + Vite`) debe delegar las operaciones de red, escaneo y enriquecimiento con IA al backend Express (`server.js`).
- **Persistencia Transaccional (Supabase / PostgreSQL)**:
  - Todo cambio en base de datos debe contemplar políticas de Row Level Security (RLS).
  - Los componentes de interfaz de usuario en `src/components/` no deben llamar directamente a consultas complejas de base de datos ni dispersar lógica de negocio; deben canalizarse a través de módulos de servicio (`src/supabase.ts`, `src/api.ts` o servicios backend dedicados).
  - Manejo de Fallback Resiliente: Cuando Supabase no esté accesible o las tablas no existan, la aplicación debe degradarse elegantemente sin crashear, usando fallbacks seguros.
- **Seguridad y Confidencialidad**:
  - Ninguna clave privada o de servicio de Supabase (`service_role`) ni claves de Gemini deben incrustarse en el frontend de forma pública.
  - La clave pública anónima de Supabase (`anon_key`) solo debe poseer permisos restringidos vía RLS.
  - Las contraseñas de usuario nunca deben almacenarse en texto claro; deben migrarse al sistema nativo de autenticación de Supabase (`auth.users`) o hashearse con bcrypt / Argon2 en el backend.

## 3. Preservación de Código Funcional
- **Regla de Oro**: NO borrar ni refactorizar de forma destructiva componentes funcionales existentes sin autorización explícita.
- Toda nueva funcionalidad debe agregarse respetando los tipos de datos unificados en `src/types.ts`.

