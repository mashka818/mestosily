# 🚀 Инструкция по развертыванию Backend "Место Силы"

## 📋 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка переменных окружения

Файл `.env` уже создан с базовыми настройками. Для production измените:
- `JWT_SECRET` - на безопасный случайный ключ
- `DATABASE_URL` - на реальные данные БД

### 3. Запуск через Docker (рекомендуется)

```bash
# Запустить все сервисы (PostgreSQL, Redis, Backend)
docker-compose up -d

# Выполнить миграции БД
docker-compose exec backend npm run prisma:migrate

# Сгенерировать Prisma Client
docker-compose exec backend npm run prisma:generate

# Посмотреть логи
docker-compose logs -f backend
```

### 4. Запуск локально (без Docker)

```bash
# Убедитесь, что PostgreSQL и Redis запущены локально

# Выполнить миграции
npm run prisma:migrate

# Сгенерировать Prisma Client
npm run prisma:generate

# Запустить в режиме разработки
npm run start:dev
```

## 🌐 Доступ к приложению

После запуска:
- **API**: http://localhost:3000/api
- **Swagger документация**: http://localhost:3000/api/docs
- **Prisma Studio** (GUI для БД): `npm run prisma:studio`

## 👤 Первый пользователь

Создайте ROOT администратора через Swagger:

1. Откройте http://localhost:3000/api/docs
2. Найдите `POST /api/auth/register`
3. Создайте пользователя с данными:
```json
{
  "email": "admin@mesto-sily.ru",
  "password": "Admin123!",
  "firstName": "Админ",
  "lastName": "Администратор"
}
```
4. Затем вручную в БД измените роль на ROOT:
```sql
UPDATE users SET role = 'ROOT' WHERE email = 'admin@mesto-sily.ru';
```

Или через Prisma Studio:
```bash
npm run prisma:studio
```

## 📦 Деплой на продакшн сервер

### Selectel (или другой VPS)

```bash
# 1. Подключитесь к серверу
ssh root@your-server-ip

# 2. Установите Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose

# 3. Склонируйте проект
git clone <your-repo-url>
cd backend

# 4. Настройте .env для production
nano .env
# Измените:
# - DATABASE_URL на production БД
# - JWT_SECRET на случайный ключ
# - NODE_ENV=production

# 5. Запустите
docker-compose up -d

# 6. Выполните миграции
docker-compose exec backend npm run prisma:migrate

# 7. Настройте nginx как reverse proxy
```

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name api.mesto-sily.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 SSL сертификат

```bash
# Установите certbot
apt install certbot python3-certbot-nginx

# Получите сертификат
certbot --nginx -d api.mesto-sily.ru

# Автообновление
crontab -e
# Добавьте: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Мониторинг

```bash
# Логи backend
docker-compose logs -f backend

# Логи PostgreSQL
docker-compose logs -f postgres

# Логи Redis
docker-compose logs -f redis

# Статус контейнеров
docker-compose ps
```

## 🔄 Обновление

```bash
# Остановить
docker-compose down

# Обновить код
git pull

# Пересобрать и запустить
docker-compose up -d --build

# Выполнить новые миграции
docker-compose exec backend npm run prisma:migrate
```

## 🗄️ Бэкапы БД

```bash
# Создать бэкап
docker-compose exec postgres pg_dump -U postgres mesto_sily > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
docker-compose exec -T postgres psql -U postgres mesto_sily < backup_20250120.sql
```

## 🛠️ Полезные команды

```bash
# Перезапуск backend
docker-compose restart backend

# Остановить все
docker-compose down

# Удалить все (включая volumes)
docker-compose down -v

# Просмотр переменных окружения
docker-compose exec backend env

# Консоль PostgreSQL
docker-compose exec postgres psql -U postgres -d mesto_sily

# Redis CLI
docker-compose exec redis redis-cli
```

## ⚠️ Troubleshooting

### Ошибка подключения к БД

```bash
# Проверьте, запущен ли PostgreSQL
docker-compose ps postgres

# Проверьте логи
docker-compose logs postgres

# Перезапустите
docker-compose restart postgres
```

### Prisma ошибки

```bash
# Пересоздайте Prisma Client
docker-compose exec backend npm run prisma:generate

# Сбросьте БД (ОСТОРОЖНО!)
docker-compose exec backend npm run prisma:migrate reset
```

## 📞 Поддержка

Для вопросов по развертыванию обращайтесь к документации:
- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- Docker: https://docs.docker.com

