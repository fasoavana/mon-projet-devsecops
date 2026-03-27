#!/bin/bash
set -e
IMAGE=$1
REPORT_DIR=${2:-./reports}
mkdir -p "$REPORT_DIR"
echo "🔍 Scan Trivy de : $IMAGE"
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$REPORT_DIR":/reports \
  aquasec/trivy:latest image \
  --format json \
  --output /reports/trivy-report.json \
  --severity HIGH,CRITICAL \
  --exit-code 0 \
  "$IMAGE"
echo "✅ Rapport dans $REPORT_DIR/trivy-report.json"
