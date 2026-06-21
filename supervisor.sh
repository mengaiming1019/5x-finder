#!/bin/bash
# Persistent supervisor that keeps the dev server alive
# Writes its own PID so it can be found
echo $$ > /home/z/my-project/supervisor.pid
cd /home/z/my-project

while true; do
  # Check if server is responding
  if ! curl -s -o /dev/null -m 3 http://localhost:3000/ 2>/dev/null; then
    # Kill any leftover next processes
    pkill -f "next dev" 2>/dev/null
    sleep 1
    
    # Start fresh
    nohup bun run dev >> /home/z/my-project/dev.log 2>&1 &
    SERVER_PID=$!
    echo "[$(date)] Started server PID=$SERVER_PID" >> /home/z/my-project/supervisor.log
    
    # Wait for it to be ready
    for i in $(seq 1 30); do
      if curl -s -o /dev/null -m 3 http://localhost:3000/ 2>/dev/null; then
        echo "[$(date)] Server ready" >> /home/z/my-project/supervisor.log
        break
      fi
      sleep 1
    done
  fi
  sleep 5
done
