FROM node:20-alpine AS base

WORKDIR /app

# Evita que puppeteer descargue un Chromium completo durante la instalación,
# lo cual puede colgar o alargar muchísimo el build.
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar el resto del proyecto y compilar
COPY . .
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
