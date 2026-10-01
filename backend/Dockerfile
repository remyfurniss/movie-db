# --- dev: full deps + ts-node-dev (used by docker-compose.override.yml) ---
FROM node:20-alpine AS dev
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "dev"]

# --- build: compile TypeScript to dist/ ---
FROM dev AS build
RUN npm run build

# --- production: compiled JS + production deps only ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 4000
# Apply pending migrations on every start, then run the compiled server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
