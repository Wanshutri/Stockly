#!/bin/bash
set -e

# entrypoint: espera a la BD, aplica migraciones y ejecuta seed.
# Soporta recibir la conexión como DATABASE_URL o con variables DB_*.

# Si se pasó DATABASE_URL y no hay DB_* definidos, hacemos parsing simple:
if [ -n "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
  # DATABASE_URL esperado: postgres://user:password@host:port/dbname
  tmp=${DATABASE_URL#*://}
  userpass=${tmp%%@*}
  hostdb=${tmp#*@}
  DB_USER=${userpass%%:*}
  DB_PASS=${userpass#*:}
  DB_HOST=${hostdb%%/*}
  DB_NAME=${hostdb#*/}
  DB_PORT=5432
  if [[ "$DB_HOST" == *:* ]]; then
    DB_PORT=${DB_HOST#*:}
    DB_HOST=${DB_HOST%%:*}
  fi
fi

# Validar que las variables necesarias estén definidas (DB_PASS puede estar vacía en algunos casos)
REQUIRED_VARS=(DB_HOST DB_PORT DB_NAME DB_USER)
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: Falta la variable de entorno $var"
    exit 1
  fi
done

echo "-------------------------------------------"
echo "🔧 Variables de entorno detectadas:"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
echo "DB_PASS: ${DB_PASS:0:2}******"
echo "-------------------------------------------"

export PGPASSWORD="$DB_PASS"

# Esperar a que la BD acepte conexiones (hasta ~60s)
echo "⏳ Esperando a que la base de datos esté disponible..."
for i in {1..30}; do
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' >/dev/null 2>&1; then
    echo "✅ Base de datos accesible"
    break
  fi
  echo "Esperando DB... intento $i/30"
  sleep 2
  if [ $i -eq 30 ]; then
    echo "❌ No se pudo conectar a la DB en el tiempo esperado"
    exit 1
  fi
done

echo "🔁 Ejecutando migraciones de Prisma..."
npm run prisma:deploy

echo "🔁 Ejecutando seed de Prisma (si aplica)..."
# Ejecutar seed; el script de seed debe manejar casos idempotentes
npm run prisma:seed || true

# Limpiar variable sensible
unset PGPASSWORD

# Ejecutar el comando final del contenedor (CMD)
exec "$@"
