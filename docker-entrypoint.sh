#!/bin/sh
set -e

echo "🔄 Aplicando migrações do Prisma..."
npx --no-install prisma migrate deploy
echo "✅ Migrações aplicadas com sucesso."

echo "🚀 Iniciando o servidor Next.js..."
exec node server.js
