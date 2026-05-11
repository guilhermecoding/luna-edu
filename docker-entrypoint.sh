#!/bin/sh

echo "🔄 Aplicando migrações do Prisma..."

npx prisma migrate deploy

echo "🚀 Iniciando aplicação..."

node server.js