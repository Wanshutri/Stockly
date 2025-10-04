#!/bin/bash
set -e

echo "🔎 Verificando si existe la base de datos 'stockly'..."

psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'stockly'" | grep -q 1 || \
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE stockly"

echo "✅ Base de datos lista"
