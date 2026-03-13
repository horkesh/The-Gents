FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy package manifests
COPY shared/package.json shared/
COPY server/package.json server/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source
COPY shared/ shared/
COPY server/ server/

# Build shared + server
RUN pnpm run build --filter=@the-toast/shared --filter=@the-toast/server

# Production stage
FROM node:20-slim AS production
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY shared/package.json shared/
COPY server/package.json server/

RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/shared/dist shared/dist
COPY --from=base /app/shared/package.json shared/
COPY --from=base /app/server/dist server/dist
COPY --from=base /app/server/package.json server/

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "server/dist/index.js"]
