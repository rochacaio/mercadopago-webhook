# ---------- DEV ----------
FROM node:20-alpine AS dev
WORKDIR /app

# Instala deps (usa package.json/package-lock)
COPY package*.json ./
RUN npm ci

# Copia o código
COPY . .

# Porta da API/Next
EXPOSE 3000

# Em dev, seu server.ts (Express) inicia o Next em modo dev (next({dev:true}))
# Hot reload com ts-node-dev
CMD ["npm", "run", "dev"]


# ---------- BUILD (PROD) ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copia o código
COPY . .

# 1) Compila TypeScript -> dist
# 2) Build do Next (gera .next)
RUN npm run build


# ---------- RUNTIME (PROD) ----------
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Apenas deps necessárias em produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia os artefatos de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# (se você tiver next.config.js, copie também)
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

# Roda o seu custom server (Express + Next)
CMD ["npm", "run", "start"]
