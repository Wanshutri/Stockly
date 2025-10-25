# Etapa 1: Construcción
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --omit=dev
# Copiar el resto del código fuente
COPY . .

# Etapa 2: Ejecución
FROM node:20-alpine

WORKDIR /app

# Copiar desde la etapa de build solo lo necesario
COPY --from=build /app ./

# Definir variable de entorno
ENV NODE_ENV=production

# Exponer el puerto que usa tu app (por defecto 3000)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "build"]
