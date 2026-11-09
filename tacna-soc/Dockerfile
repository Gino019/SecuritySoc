# ==============================================================================
# TACNA SOC - DOCKERFILE MULTI-STAGE DE PRODUCCIÓN (GOOGLE CLOUD RUN)
# ==============================================================================

# STAGE 1: Build de React 19 Frontend con Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias completas para compilación TypeScript y Vite
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copiar código fuente y compilar estáticos en /app/dist
COPY . .
RUN npm run build

# STAGE 2: Contenedor Minimalista de Producción (Node.js Express + Dist)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Instalar únicamente dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit && npm cache clean --force

# Copiar el backend Express y los estáticos compilados de React
COPY server.js ./
COPY --from=builder /app/dist ./dist

# Usuario sin privilegios por seguridad
USER node

EXPOSE 8080

# Health check HTTP para Cloud Run / Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]

