#!/bin/bash
# Iniciar backend
trap './kill.sh' SIGINT SIGTERM

cd /Users/gabrielbotega/projetos/image-uploader/aws-image-uploader && python src/main.py &
BACKEND_PID=$!
pgrep -P $BACKEND_PID >> .pids.txt

# Iniciar frontend
cd /Users/gabrielbotega/projetos/image-uploader/aws-uploader-frontend && pnpm run dev --host &
FRONTEND_PID=$!
pgrep -P $FRONTEND_PID >> .pids.txt

# Abrir navegador após 5s (ajuste conforme necessidade)
sleep 5 && open http://localhost:5173/

wait
