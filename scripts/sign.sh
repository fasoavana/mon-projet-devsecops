#!/bin/bash
set -e
IMAGE=$1
SCRIPT_DIR=$(dirname "$0")
PROJECT_DIR=$(dirname "$SCRIPT_DIR")
echo "✍️  Signature de : $IMAGE"
COSIGN_PASSWORD="" cosign sign \
  --key "$PROJECT_DIR/cosign.key" \
  --signing-config "$PROJECT_DIR/signing-config.json" \
  "$IMAGE"
echo "✅ Image signée"
