FROM node:20-slim AS builder

WORKDIR /app

# Установка системных зависимостей для сборки
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Копируем package files
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci

# Копируем Prisma schema
COPY prisma ./prisma/

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем конфиги для сборки
COPY tsconfig.json ./
COPY nest-cli.json ./

# Копируем исходный код
COPY src ./src/

# Собираем приложение
RUN npm run build

# Проверяем что dist создался
RUN ls -la /app/dist

FROM node:20-slim AS production

WORKDIR /app

# Установка runtime зависимостей
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости + build deps временно
RUN apt-get update -y && \
    apt-get install -y python3 make g++ && \
    npm ci --only=production && \
    apt-get purge -y python3 make g++ && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Копируем Prisma schema
COPY prisma ./prisma/

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist

# Копируем дополнительные файлы
COPY docker-entrypoint.sh ./
COPY prisma/seed.js ./prisma/

# Создаем директорию для uploads
RUN mkdir -p /app/uploads

# Преобразуем CRLF в LF (для Windows файлов) и делаем entrypoint исполняемым
RUN sed -i 's/\r$//' docker-entrypoint.sh 2>/dev/null || \
    (tr -d '\r' < docker-entrypoint.sh > docker-entrypoint.sh.tmp && mv docker-entrypoint.sh.tmp docker-entrypoint.sh) && \
    chmod +x docker-entrypoint.sh && \
    chmod +x prisma/seed.js

# Проверяем что все файлы на месте и entrypoint существует
RUN ls -la /app/ && \
    test -f /app/docker-entrypoint.sh && \
    head -n 1 /app/docker-entrypoint.sh

EXPOSE 3000

# Используем sh для надежного запуска (работает даже если файл не исполняемый)
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
