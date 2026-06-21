#!/usr/bin/env python3
"""Persistent supervisor that keeps the Next.js dev server alive."""
import subprocess, time, os, signal, sys

PID_FILE = "/home/z/my-project/supervisor.pid"
LOG_FILE = "/home/z/my-project/supervisor.log"

def log(msg):
    with open(LOG_FILE, "a") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")

def server_alive():
    import urllib.request
    try:
        urllib.request.urlopen("http://localhost:3000/", timeout=3)
        return True
    except:
        return False

def write_pid():
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

def main():
    # Double-fork to daemonize
    if os.fork() > 0:
        sys.exit(0)
    os.setsid()
    if os.fork() > 0:
        sys.exit(0)
    
    # Redirect stdio
    sys.stdin.close()
    sys.stdout = open("/dev/null", "w")
    sys.stderr = open("/dev/null", "w")
    
    write_pid()
    log("Supervisor started")
    
    server_pid = None
    
    while True:
        if not server_alive():
            # Kill any leftover
            if server_pid:
                try:
                    os.kill(server_pid, signal.SIGTERM)
                except:
                    pass
            
            log("Starting dev server...")
            proc = subprocess.Popen(
                ["bun", "run", "dev"],
                cwd="/home/z/my-project",
                stdout=open("/home/z/my-project/dev.log", "w"),
                stderr=subprocess.STDOUT,
                preexec_fn=os.setsid
            )
            server_pid = proc.pid
            log(f"Server PID={server_pid}")
            
            # Wait for server to be ready
            for _ in range(30):
                if server_alive():
                    log("Server ready!")
                    break
                time.sleep(1)
            else:
                log("Server failed to start within 30s")
        
        time.sleep(5)

if __name__ == "__main__":
    main()
