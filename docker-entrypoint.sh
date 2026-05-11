#!/bin/sh

echo "🔄 Aplicando migrações do Prisma..."

npx --no-install prisma migrate deploy

echo "🚀 Iniciando aplicação..."

node server.js