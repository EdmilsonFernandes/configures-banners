#!/bin/bash
# Encerrar por nome do processo
pkill -9 -f 'python src/main.py'
pkill -9 -f 'pnpm run dev'

# Liberar portas ocupadas
sudo lsof -ti :5173 | xargs -I {} kill -9 {}
sudo lsof -ti :8000 | xargs -I {} kill -9 {}

# Limpar arquivo PID
rm .pids.txt 2>/dev/null

# Resetar socket do Python
find /tmp -type s -name 'tmp*' -exec rm {} \; 2>/dev/null