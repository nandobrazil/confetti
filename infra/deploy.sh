#!/usr/bin/env bash
# Build + deploy of Confetti from the code in /opt/confetti/src (synced via
# rsync). Runs on the VPS itself, following the titan/europa pattern.
set -euo pipefail
cd /opt/confetti/src
docker build -t confetti/app:latest .
docker save confetti/app:latest | k3s ctr images import -
kubectl apply -f infra/confetti.yaml
kubectl rollout restart deploy/app -n confetti
kubectl rollout status deploy/app -n confetti --timeout=300s
