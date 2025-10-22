#!/usr/bin/env pwsh

Write-Host "🚀 Настройка Git Hooks и инструментов разработки..." -ForegroundColor Cyan

# Установка зависимостей
Write-Host "`n📦 Установка зависимостей..." -ForegroundColor Yellow
npm install

# Инициализация Husky
Write-Host "`n🐶 Инициализация Husky..." -ForegroundColor Yellow
npx husky install

# Форматирование кода
Write-Host "`n🎨 Форматирование существующего кода..." -ForegroundColor Yellow
npm run format

# Генерация Prisma Client
Write-Host "`n🗄️  Генерация Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

Write-Host "`n✅ Настройка завершена!" -ForegroundColor Green
Write-Host "`n📝 Доступные команды:" -ForegroundColor Cyan
Write-Host "  npm run restart        - Полный перезапуск (Docker + Prisma + Build)" -ForegroundColor White
Write-Host "  npm run docker:down    - Остановить контейнеры" -ForegroundColor White
Write-Host "  npm run docker:build   - Собрать образы" -ForegroundColor White
Write-Host "  npm run docker:up      - Запустить контейнеры" -ForegroundColor White
Write-Host "  npm run lint           - Проверить и исправить код" -ForegroundColor White
Write-Host "  npm run test           - Запустить тесты" -ForegroundColor White
Write-Host "  npm run format         - Отформатировать код" -ForegroundColor White
Write-Host "`n🎉 Готово к работе!" -ForegroundColor Green

