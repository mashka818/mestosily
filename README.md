# Место Силы - Backend API

Backend приложение для платформы "Место Силы" на NestJS, PostgreSQL, Prisma, Docker и Redis.

## 🚀 Технологии

- **NestJS** - фреймворк для построения серверных приложений
- **PostgreSQL** - база данных
- **Prisma** - ORM для работы с БД
- **Docker** - контейнеризация
- **Redis** - кэширование
- **JWT** - аутентификация
- **Swagger** - документация API

## 📦 Установка и запуск

### С Docker (рекомендуется)

```bash
# Создать .env файл
cp .env.example .env

# Запустить все сервисы
docker-compose up -d

# Выполнить миграции
docker-compose exec backend npm run prisma:migrate

# Сгенерировать Prisma Client
docker-compose exec backend npm run prisma:generate
```

### Без Docker

```bash
# Установить зависимости
npm install

# Создать .env файл и настроить
cp .env.example .env

# Запустить PostgreSQL и Redis локально

# Выполнить миграции
npm run prisma:migrate

# Сгенерировать Prisma Client
npm run prisma:generate

# Запустить в режиме разработки
npm run start:dev
```

## 📚 API Документация

После запуска сервера документация Swagger доступна по адресу:
```
http://localhost:3000/api/docs
```

## 🔐 Авторизация

API использует JWT токены для авторизации. После регистрации или входа вы получите токен, который нужно передавать в заголовке:

```
Authorization: Bearer <your-token>
```

## 👥 Роли пользователей

- **USER** - обычный пользователь (дети 12-17 лет)
- **ADMIN** - администратор (может начислять/списывать зерна, принимать чеки)
- **ROOT** - root администратор (полный доступ к редактированию контента)

## 📋 Основные эндпоинты

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Пользователи
- `GET /api/users` - Список пользователей (ADMIN, ROOT)
- `GET /api/users/profile` - Мой профиль
- `GET /api/users/:id` - Пользователь по ID
- `PATCH /api/users/:id` - Обновить пользователя
- `DELETE /api/users/:id` - Удалить пользователя (ROOT)

### Секции
- `GET /api/sections` - Список секций
- `GET /api/sections/:id` - Секция по ID
- `POST /api/sections` - Создать секцию (ROOT)
- `PATCH /api/sections/:id` - Обновить секцию (ROOT)
- `DELETE /api/sections/:id` - Удалить секцию (ROOT)
- `POST /api/sections/:id/enroll` - Записаться на секцию

### Расписание (Sessions)
- `GET /api/sessions` - Расписание занятий
- `GET /api/sessions/:id` - Занятие по ID
- `POST /api/sessions` - Создать занятие (ROOT)
- `PATCH /api/sessions/:id` - Обновить занятие (ROOT)
- `DELETE /api/sessions/:id` - Удалить занятие (ROOT)

### Новости и события
- `GET /api/news` - Список новостей
- `GET /api/news/:id` - Новость по ID
- `POST /api/news` - Создать новость (ROOT)
- `PATCH /api/news/:id` - Обновить новость (ROOT)
- `DELETE /api/news/:id` - Удалить новость (ROOT)
- `POST /api/news/:id/register` - Записаться на событие

### Магазин
- `GET /api/products` - Товары
- `POST /api/products` - Создать товар (ROOT)
- `GET /api/orders` - Мои заказы
- `POST /api/orders` - Создать заказ
- `GET /api/orders/:id/receipt` - Получить чек

### Достижения
- `GET /api/achievements` - Список достижений
- `POST /api/achievements` - Создать достижение (ROOT)
- `POST /api/achievements/:id/grant` - Выдать достижение пользователю (ADMIN)

### Зерна
- `POST /api/grains/add` - Начислить зерна (ADMIN)
- `POST /api/grains/deduct` - Списать зерна (ADMIN)
- `GET /api/grains/history/:userId` - История операций

### Чаты
- `GET /api/chat` - Мои чаты
- `GET /api/chat/:id/messages` - Сообщения чата
- `POST /api/chat/:id/messages` - Отправить сообщение

## 🗄️ Структура базы данных

База данных включает следующие таблицы:
- **users** - пользователи с ролями (USER, ADMIN, ROOT)
- **sections** - секции для детей
- **sessions** - расписание занятий
- **enrollments** - записи на секции
- **teachers** - преподаватели
- **news** - новости и события
- **news_media** - медиафайлы новостей (фото, видео)
- **event_registrations** - записи на события
- **products** - товары магазина за зерна
- **orders** - заказы
- **order_items** - позиции заказов
- **receipts** - чеки для обмена в физическом магазине
- **achievements** - достижения (глобальные и секционные)
- **user_achievements** - достижения пользователей
- **user_grains** - история операций с зернами
- **chats** - чаты (поддержка, секции, события)
- **chat_participants** - участники чатов
- **chat_messages** - сообщения в чатах

## 🔧 Команды разработки

```bash
# Разработка
npm run start:dev

# Production build
npm run build
npm run start:prod

# Тесты
npm run test
npm run test:e2e

# Форматирование кода
npm run format

# Lint
npm run lint

# Prisma Studio (GUI для БД)
npm run prisma:studio
```

## 📁 Структура проекта

```
backend/
├── prisma/
│   └── schema.prisma      # Схема базы данных
├── src/
│   ├── auth/             # Модуль аутентификации
│   ├── users/            # Модуль пользователей
│   ├── sections/         # Модуль секций
│   ├── sessions/         # Модуль расписания
│   ├── news/             # Модуль новостей
│   ├── products/         # Модуль товаров
│   ├── orders/           # Модуль заказов
│   ├── achievements/     # Модуль достижений
│   ├── grains/           # Модуль зерен
│   ├── chat/             # Модуль чатов
│   ├── prisma/           # Prisma сервис
│   ├── app.module.ts     # Главный модуль
│   └── main.ts           # Точка входа
├── uploads/              # Загруженные файлы
├── docker-compose.yml    # Docker конфигурация
├── Dockerfile           # Docker образ
└── package.json         # Зависимости
```

## 🌍 Переменные окружения

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mesto_sily
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## 📝 Лицензия

UNLICENSED

