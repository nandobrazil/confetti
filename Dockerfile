FROM node:24-alpine AS builder
# better-sqlite3 compiles from source on musl.
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts
EXPOSE 3000
# Apply migrations, ensure the admin exists, then start the adapter-node server.
CMD ["sh", "-c", "node scripts/migrate.ts && node scripts/seed.ts && node build"]
