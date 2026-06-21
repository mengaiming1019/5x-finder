#!/bin/bash
# Persistent dev server keep-alive script
# Restarts the Next.js dev server whenever it dies

LOG="/home/z/my-project/dev.log"

while true; do
  if ! curl -s -o /dev/null -m 3 http://localhost:3000/ 2>/dev/null; then
    echo "[$(date)] Server not responding, starting..." >> "$LOG"
    cd /home/z/my-project && bun run dev >> "$LOG" 2>&1 &
    SERVER_PID=$!
    # Wait for server to be ready
    for i in $(seq 1 30); do
      if curl -s -o /dev/null -m 3 http://localhost:3000/ 2>/dev/null; then
        echo "[$(date)] Server ready (PID $SERVER_PID)" >> "$LOG"
        break
      fi
      sleep 1
    done
  fi
  sleep 3
done
