# 🗺️ Guía Maestra para Agentes y Desarrolladores — Tacna SOC

> **Propósito**: Este archivo es el punto de entrada y mapa central de navegación contextual para agentes autónomos y desarrolladores en el repositorio de **Tacna SOC — Gestión de Vulnerabilidades**.

---

## 📌 Documentación de Negocio y Arquitectura
- **Especificación de Requerimientos de Software (SRS)**: [FD03_SRS_Inteligencia de Negocios.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/FD03_SRS_Inteligencia%20de%20Negocios.md)
  - Define los 4 roles del sistema (`Super Admin`, `Security Analyst`, `Auditor`, `Operator`) y los requerimientos funcionales (RF-01 a RF-17).
- **Documento de Arquitectura de Software (SAD)**: [FD04_SAD_Inteligencia de Negocios.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/FD04_SAD_Inteligencia%20de%20Negocios.md)
  - Describe la arquitectura C4, modelo de base de datos relacional (sección 3.2.4), drivers de arquitectura y mitigación de deuda técnica.
- **Memoria Viva del Repositorio**: [PROJECT_STATE.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/docs/memory/PROJECT_STATE.md)
  - Inventario exhaustivo del origen de datos por componente, estado de persistencia y **Roadmap de Evolución BI, Cloud & DevOps (Requisitos 1 a 6)**.

---

## 📜 Reglas Permanentes del Proyecto (`.agents/rules/`)
Todo agente que interactúe con este repositorio debe cumplir estrictamente con las siguientes reglas:

1. **Protocolo de Cero Suposiciones**: [clarification-protocol.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/.agents/rules/clarification-protocol.md)
   - *Nunca asumir requerimientos ambiguos*. Detenerse y formular preguntas estructuradas con opciones (A, B, C) antes de escribir código.
2. **Reglas de Arquitectura**: [architecture.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/.agents/rules/architecture.md)
   - Separación entre capas, resilencia de fallbacks, persistencia transaccional y preservación de código existente.
3. **Estándares de Código y Calidad**: [code-standards.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/.agents/rules/code-standards.md)
   - TypeScript estricto, React 19, Tailwind CSS v4 y manejo consistente de estados.
4. **Integridad de Datos y Persistencia**: [data-integrity.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/.agents/rules/data-integrity.md)
   - Scripts idempotentes de base de datos, políticas RLS y registro inmutable de auditoría SHA-256.

---

## 🛠️ Habilidades Disponibles (`.agents/skills/`)
- **Implementación de Nuevos Requisitos**: [new-requirement/SKILL.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/.agents/skills/new-requirement/SKILL.md)
  - Flujo de 4 fases para analizar impacto, aclarar dudas, programar y actualizar la memoria del proyecto.
- **Auditoría de Componentes**: [tacna-soc-audit/SKILL.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/.agents/skills/tacna-soc-audit/SKILL.md)
  - Detección de fuentes de datos (Supabase vs Express vs MockData).
- **Migración y Esquemas de Supabase**: [supabase-migration/SKILL.md](file:///C:/Users/W10/Desktop/si885-2026-ii-si885-2026-ii-proyecto-group-5-main%20(1)/.agents/skills/supabase-migration/SKILL.md)
  - Gestión de DDLs, políticas RLS y tablas maestras.

---

## 📂 Estructura del Repositorio

```
.
├── .agents/
│   ├── rules/                       # Reglas activas para agentes de IA
│   │   ├── clarification-protocol.md # Protocolo de cero suposiciones
│   │   ├── architecture.md          # Principios de arquitectura limpia
│   │   ├── code-standards.md        # Estándares de TypeScript/React
│   │   └── data-integrity.md        # Seguridad y persistencia en BD
│   └── skills/                      # Protocolos de ejecución paso a paso
│       ├── new-requirement/         # Flujo obligatorio para nuevos requisitos
│       ├── tacna-soc-audit/         # Auditoría de componentes
│       └── supabase-migration/      # Migraciones SQL y RLS
├── docs/
│   └── memory/
│       └── PROJECT_STATE.md         # Memoria viva del proyecto y estado de componentes
├── media/                           # Diagramas e imágenes referenciadas en SRS/SAD
├── tacna-soc/                       # Código fuente de la aplicación (Frontend + Backend)
│   ├── src/
│   │   ├── components/              # Vistas y modales de React 19
│   │   ├── api.ts                   # Cliente HTTP para endpoints de Express
│   │   ├── supabase.ts              # Cliente y operaciones directas con Supabase
│   │   ├── types.ts                 # Tipos e interfaces globales
│   │   ├── mockData.ts              # Datos iniciales y de fallback
│   │   └── App.tsx                  # Enrutador y contenedor central de estado
│   ├── server.js                    # Servidor Express (escaneo HTTP, DNS, NVD, Gemini AI)
│   ├── vite.config.ts
│   └── package.json
├── FD03_SRS_Inteligencia de Negocios.md  # Especificación de Requerimientos
├── FD04_SAD_Inteligencia de Negocios.md  # Documento de Arquitectura
├── README.md                            # Guía general de instalación y uso
├── supabase_setup.sql                   # Script SQL maestro para Supabase PostgreSQL
└── AGENTS.md                            # Este archivo (mapa maestro)
```

