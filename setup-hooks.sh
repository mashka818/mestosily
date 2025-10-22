#!/bin/bash

echo "🚀 Настройка Git Hooks и инструментов разработки..."

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Инициализация Husky
echo "🐶 Инициализация Husky..."
npx husky install

# Делаем hooks исполняемыми
echo "🔧 Настройка прав доступа для hooks..."
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# Форматирование кода
echo "🎨 Форматирование существующего кода..."
npm run format

# Генерация Prisma Client
echo "🗄️  Генерация Prisma Client..."
npm run prisma:generate

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📝 Доступные команды:"
echo "  npm run restart        - Полный перезапуск (Docker + Prisma + Build)"
echo "  npm run docker:down    - Остановить контейнеры"
echo "  npm run docker:build   - Собрать образы"
echo "  npm run docker:up      - Запустить контейнеры"
echo "  npm run lint           - Проверить и исправить код"
echo "  npm run test           - Запустить тесты"
echo "  npm run format         - Отформатировать код"
echo ""
echo "🎉 Готово к работе!"

