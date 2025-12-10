FROM node:20-slim AS builder

WORKDIR /app

# Установка системных зависимостей для сборки
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl libssl3 ca-certificates python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Копируем package files
COPY package.json ./
COPY package-lock.json* ./

# Проверяем наличие файлов и устанавливаем зависимости
RUN echo "Checking package files..." && \
    ls -la package*.json && \
    if [ -f package-lock.json ]; then \
      echo "package-lock.json found, using npm ci" && \
      npm ci --prefer-offline; \
    else \
      echo "package-lock.json not found, using npm install" && \
      npm install; \
    fi

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

# Проверяем что dist создался и имеет правильную структуру
RUN ls -la /app/dist && \
    echo "Checking main.js location:" && \
    (test -f /app/dist/main.js && echo "✅ Found /app/dist/main.js" || echo "❌ /app/dist/main.js not found") && \
    (test -f /app/dist/src/main.js && echo "✅ Found /app/dist/src/main.js" || echo "❌ /app/dist/src/main.js not found")

FROM node:20-slim AS production

WORKDIR /app

# Установка runtime зависимостей
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Копируем package files
COPY package.json ./
COPY package-lock.json* ./

# Устанавливаем только production зависимости + build deps временно
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    echo "Checking package files in production stage..." && \
    ls -la package*.json && \
    (if [ -f package-lock.json ]; then \
      echo "package-lock.json found, using npm ci" && \
      npm ci --only=production --prefer-offline; \
    else \
      echo "package-lock.json not found, using npm install" && \
      npm install --only=production; \
    fi) && \
    apt-get purge -y python3 make g++ && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /root/.npm

# Копируем Prisma schema
COPY prisma ./prisma/

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist

# Проверяем что dist правильно скопировался
RUN echo "Checking copied dist:" && \
    ls -la /app/dist && \
    (test -f /app/dist/main.js && echo "✅ /app/dist/main.js exists in production stage" || echo "❌ /app/dist/main.js missing in production stage")

# Копируем дополнительные файлы
COPY docker-entrypoint.sh ./
COPY wait-for-db.js ./
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
