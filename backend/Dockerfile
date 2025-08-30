# --------------------------
# Etapa 1: Build
# --------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (aprovechar cache)
COPY package.json package-lock.json* ./

RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar TS -> JS
RUN npm run build   # debe compilar a /dist

# --------------------------
# Etapa 2: Runtime
# --------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo necesario desde builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Exponer el puerto del backend
EXPOSE 5000

# Comando de inicio
CMD ["node", "dist/index.js"]
