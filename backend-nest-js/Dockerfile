# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar y para Prisma
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluyendo devDeps para el build)
RUN npm install

COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar NestJS y el script de Seed
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --lib esnext

# ---
# Final stage
FROM node:20-slim AS runner

WORKDIR /app

# Instalar openssl en la imagen final también
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Solo dependencias de producción
COPY package*.json ./
RUN npm install --only=production

# Copiar el build y los archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Variable de entorno por defecto (Docker Compose la sobrescribirá)
ENV PORT=4000
EXPOSE 4000

# Script para arrancar la app
CMD ["node", "dist/src/main"]
