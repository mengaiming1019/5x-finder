#!/bin/bash
# Persistent dev server keep-alive script
# Restarts the Next.js dev server whenever it dies

LOG="/home/z/my-project/dev.log"

while true; do
  if ! lsof -ti:3000 >/dev/null 2>&1; then
    echo "[$(date)] Starting dev server..." >> "$LOG"
    cd /home/z/my-project && bun run dev >> "$LOG" 2>&1 &
    SERVER_PID=$!
    # Wait for server to be ready
    for i in $(seq 1 20); do
      if curl -s -o /dev/null http://localhost:3000/ 2>/dev/null; then
        echo "[$(date)] Server ready (PID $SERVER_PID)" >> "$LOG"
        break
      fi
      sleep 1
    done
  fi
  sleep 2
done
