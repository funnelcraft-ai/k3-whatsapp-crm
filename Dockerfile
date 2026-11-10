# ---- build the Angular (Material 3) web app ----
FROM node:22-alpine AS web
WORKDIR /src/web
COPY web/package*.json ./
RUN npm ci --no-audit --no-fund
COPY web/ ./
RUN npx ng build --configuration production --output-path /out

# ---- runtime ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 UPLOAD_DIR=/data/uploads BACKUP_DIR=/data/backups
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY server.js ./
COPY server/ server/
COPY --from=web /out/browser/ server/public/
RUN rm -rf server/node_modules && mkdir -p /data/uploads /data/backups && chown -R node:node /data
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["node", "server.js"]
