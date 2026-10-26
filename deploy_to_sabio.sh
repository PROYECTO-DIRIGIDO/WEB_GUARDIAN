#!/usr/bin/env bash
set -e

# ==============================================================================
# Script de Despliegue de WEB_GUARDIAN en server-sabio con Tailscale Funnel
# ==============================================================================

SABIO_HOST="server-sabio.tail2474b3.ts.net"
REMOTE_USER="${1:-juan}"
REMOTE_DIR="/home/${REMOTE_USER}/WEB_GUARDIAN"
PORT="8085"

echo "=================================================="
echo "🚀 Iniciando despliegue de WEB_GUARDIAN a ${SABIO_HOST}"
echo "👤 Usuario: ${REMOTE_USER}"
echo "📁 Directorio destino: ${REMOTE_DIR}"
echo "🔌 Puerto interno: ${PORT}"
echo "=================================================="

# 1. Crear directorio remoto si no existe
echo ">>> [1/5] Verificando directorio en servidor remoto..."
ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${SABIO_HOST}" "mkdir -p ${REMOTE_DIR}"

# 2. Sincronizar archivos (excluyendo target y node_modules para no transferir peso innecesario)
echo ">>> [2/5] Sincronizando archivos del proyecto..."
rsync -avz --progress \
  --exclude 'backend/target' \
  --exclude 'frontend/node_modules' \
  --exclude 'frontend/dist' \
  --exclude '.git' \
  "$(dirname "$0")/" "${REMOTE_USER}@${SABIO_HOST}:${REMOTE_DIR}/"

# 3. Construir y levantar contenedores Docker
echo ">>> [3/5] Levantando base de datos y aplicación con Docker Compose..."
ssh "${REMOTE_USER}@${SABIO_HOST}" "cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml up -d --build"

# 4. Esperar a que el backend responda
echo ">>> [4/5] Esperando inicio de la aplicación en el puerto ${PORT}..."
ssh "${REMOTE_USER}@${SABIO_HOST}" "
for i in \$(seq 1 30); do
  if curl -s http://localhost:${PORT}/api/auth/login > /dev/null 2>&1 || curl -s http://localhost:${PORT} > /dev/null 2>&1; then
    echo '>>> Aplicación WEB_GUARDIAN respondiendo correctamente!'
    exit 0
  fi
  echo 'Esperando arranque del servicio (intento '\$i'/30)...'
  sleep 3
done
echo 'ADVERTENCIA: La aplicación está tardando en responder. Continuando...'
"

# 5. Configurar Tailscale Funnel en el puerto 10000 para acceso público por HTTPS
echo ">>> [5/5] Activando Tailscale Funnel en puerto 10000 hacia localhost:${PORT}..."
ssh "${REMOTE_USER}@${SABIO_HOST}" "tailscale funnel --bg --https=10000 ${PORT} && tailscale funnel status"

echo "=================================================="
echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "🌐 URL Pública (Tailscale Funnel): https://${SABIO_HOST}:10000"
echo "🌐 URL Interna (Tailnet): http://${SABIO_HOST}:${PORT}"
echo "🔑 Credenciales por defecto: admin / admin123  o  inv / inv123"
echo "=================================================="
