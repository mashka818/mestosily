#!/bin/sh

set -e

echo "🚀 Starting application initialization..."

# Ждем, пока БД будет готова
echo "⏳ Waiting for database to be ready..."
node wait-for-db.js

echo "📦 Running Prisma migrations..."
if ! npx prisma migrate deploy; then
  echo "⚠️  No migrations found or migration failed. Trying to sync database schema..."
  if ! npx prisma db push --accept-data-loss; then
    echo "❌ Failed to sync database schema"
    exit 1
  fi
  echo "✅ Database schema synced successfully"
fi

echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seeding failed or already completed"

echo "✅ Initialization complete! Starting application..."

# Проверяем что dist/main.js существует
if [ ! -f "dist/main.js" ]; then
  echo "❌ Error: dist/main.js not found!"
  echo "Contents of dist directory:"
  ls -la dist/ || echo "dist directory does not exist"
  exit 1
fi

exec node dist/main.js
