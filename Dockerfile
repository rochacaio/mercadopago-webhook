# ---------- BASE ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- DEV ----------
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- BUILD ----------
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# ---------- PROD ----------
FROM base AS prod
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["node", "dist/server.js"]
