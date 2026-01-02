#!/bin/bash
# Script di deploy rapido per Cloud Run

# Vai nella root del progetto
cd "$(dirname "$0")"

# Aggiorna il codice (pull da Git)
git pull origin main

# Pulizia vecchia build
rm -rf dist

# Build frontend
npm run build

# Deploy Cloud Run
gcloud run deploy libreriadigitale \
  --source . \
  --region us-west1 \
  --platform managed \
  --allow-unauthenticated
