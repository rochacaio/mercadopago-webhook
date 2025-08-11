# ---------- RUNTIME (PROD) ----------
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Dependências de produção
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# *** CÓPIAS CRÍTICAS (padrão Next standalone) ***
# 1) Copia o standalone para a RAIZ (vai trazer server.js para /app/server.js)
COPY --from=builder /app/.next/standalone ./
# 2) Copia os estáticos exatamente em /.next/static
COPY --from=builder /app/.next/static ./.next/static
# 3) Copia public/
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
