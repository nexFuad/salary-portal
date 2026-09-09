FROM node:22-bookworm-slim

WORKDIR /app/backend

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./

RUN npm install --global pnpm@12.3.4 \
  && pnpm install --frozen-lockfile

COPY backend/ ./

RUN pnpm prisma generate \
  && pnpm build

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/index.js"]
