FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8787
ENV HOSTNAME=0.0.0.0
ENV DRY_RUN=true
ENV DESTINATIONS_FILE=/app/config/destinations.json
RUN addgroup -S reception && adduser -S reception -G reception
COPY --from=builder /app/public ./public
COPY --from=builder --chown=reception:reception /app/.next/standalone ./
COPY --from=builder --chown=reception:reception /app/.next/static ./.next/static
COPY --from=builder --chown=reception:reception /app/config ./config
USER reception
EXPOSE 8787
CMD ["node", "server.js"]
