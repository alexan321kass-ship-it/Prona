# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compilar para producción (Vite genera la carpeta dist)
RUN npm run build

# ---
# Production stage
FROM nginx:stable-alpine AS production-stage

# Copiar el build compilado a la ruta por defecto de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
