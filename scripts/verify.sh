#!/bin/bash
set -e
IMAGE=$1
SCRIPT_DIR=$(dirname "$0")
PROJECT_DIR=$(dirname "$SCRIPT_DIR")
echo "🔍 Vérification signature de : $IMAGE"
COSIGN_INSECURE_IGNORE_TLOG=1 cosign verify \
  --key "$PROJECT_DIR/cosign.pub" \
  "$IMAGE" \
  && echo "✅ Signature valide !" \
  || { echo "❌ Signature invalide !"; exit 1; }
