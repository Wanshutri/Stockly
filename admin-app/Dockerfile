# Etapa 1: Dependencias
FROM node:20-bullseye-slim AS deps
WORKDIR /app

# Instala dependencias del sistema necesarias para compilar módulos nativos y OpenSSL
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    libssl-dev \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copiamos los archivos de dependencias
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Instalamos dependencias según el gestor disponible
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else echo "No se encontró lockfile" && exit 1; fi


# Etapa 2: Build de la app
FROM node:20-bullseye-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno de build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generamos el cliente de Prisma
RUN npm run prisma:generate
# Nota: no ejecutamos las migraciones en tiempo de build porque requieren
# la variable de entorno DATABASE_URL disponible y conexión a la DB.
# Las migraciones se aplicarán en tiempo de arranque desde el entrypoint.

# Build de producción
RUN npm run build

# Etapa 3: Imagen final (producción)
FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 81

# Crea usuario no root por seguridad
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home nextjs

# Instala librerías de runtime necesarias (OpenSSL)
RUN apt-get update \
  && apt-get install -y --no-install-recommends libssl1.1 ca-certificates postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Copiamos lo necesario desde el builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Copiar entrypoint desde el builder y hacerlo ejecutable (hacerlo antes de cambiar a usuario no-root)
COPY --from=builder /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Ajustes de permisos
USER nextjs

# Puerto en el que corre Next.js (ahora 80 dentro del contenedor)
EXPOSE 81

# Copiar entrypoint desde el builder y hacerlo ejecutable
# Comando final (el entrypoint ejecutará migraciones/seed antes de iniciar)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]
