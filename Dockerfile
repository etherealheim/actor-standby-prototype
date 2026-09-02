# next.config.ts pins Turbopack's root to process.cwd(), so build and run must share
# the same working directory. Set WORKDIR once and never cd.
FROM apify/actor-node:22

WORKDIR /usr/src/app

# Install dependencies from the lockfile first so this layer caches across code changes.
# Dev dependencies are needed at build time (typescript, @types/*) for `next build`.
COPY package.json package-lock.json ./
RUN npm ci --include=dev \
    && echo "Installed:" \
    && npm ls --omit=dev --all=false || true

COPY . ./

# `next build` fetches the Google fonts declared via next/font at build time.
RUN npm run build

ENV NODE_ENV=production

CMD ["node", "server.mjs"]
