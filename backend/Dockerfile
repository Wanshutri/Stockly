# Etapa 1: Build
FROM node:20-alpine AS builder

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json primero (para aprovechar cache)
COPY package*.json tsconfig.json ./

# Instalar dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Run
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario del build
COPY package*.json ./
RUN npm install --only=production

# Copiar los archivos compilados desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponer el puerto (ejemplo: 5000)
EXPOSE 5000

# Comando de inicio
CMD ["node", "dist/server.js"]
