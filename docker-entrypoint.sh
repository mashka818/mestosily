#!/bin/sh

set -e

echo "🚀 Starting application initialization..."

echo "📦 Running Prisma migrations..."
npx prisma migrate deploy || echo "⚠️  Migration failed or no migrations to apply"

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seeding failed or already completed"

echo "✅ Initialization complete! Starting application..."
exec node dist/src/main.js
