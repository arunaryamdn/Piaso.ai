import os
import subprocess
import threading
import shutil
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from config import (
    MSG_MCP_NO_MESSAGE, MSG_MCP_NO_STDIN, MSG_MCP_NO_RESPONSE
)
import logging

print("Go executable found at:", shutil.which("go"))
print("Current working directory:", os.getcwd())
print("Target cwd for Go MCP:", "C:/Users/arung/Paiso.ai/kite-mcp-server")
print("main.go exists:", os.path.exists("C:/Users/arung/Paiso.ai/kite-mcp-server/main.go"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use absolute path to Go if needed
GO_PATH = shutil.which("go") or r"C:\Go\bin\go.exe"

# Start the Go MCP server in stdio mode
def start_mcp():
    """Start the Go MCP server as a subprocess."""
    return subprocess.Popen(
        [GO_PATH, "run", "main.go"],
        cwd="C:/Users/arung/Paiso.ai/kite-mcp-server",  # Adjust path as needed
        env={**os.environ, "APP_MODE": "stdio", "KITE_API_KEY": "laql5ne82n78cuip", "KITE_API_SECRET": "lebeha15pmvtnl6dj05knc2be59tv78d"},
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

mcp_proc = start_mcp()

# Thread-safe buffer for responses
response_buffer = []

def read_stdout():
    """Read lines from MCP process stdout and append to response buffer."""
    while True:
        if mcp_proc.stdout is not None:
            line = mcp_proc.stdout.readline()
            if line:
                response_buffer.append(line.strip())

def read_stderr():
    """Read lines from MCP process stderr and print as error."""
    while True:
        if mcp_proc.stderr is not None:
            line = mcp_proc.stderr.readline()
            if line:
                print("MCP STDERR:", line.strip())

threading.Thread(target=read_stdout, daemon=True).start()
threading.Thread(target=read_stderr, daemon=True).start()

@app.post("/api/mcp-chat")
async def mcp_chat(request: Request):
    """Proxy chat message to MCP Go server via stdio."""
    data = await request.json()
    message = data.get("message", "")
    if not message:
        return {"error": MSG_MCP_NO_MESSAGE}
    # Write message to MCP process
    if mcp_proc.stdin is not None:
        mcp_proc.stdin.write(message + "\n")
        mcp_proc.stdin.flush()
    else:
        return {"error": MSG_MCP_NO_STDIN}
    # Wait for a response (simple version: just pop the next line)
    import time
    for _ in range(100):  # Wait up to 5 seconds
        if response_buffer:
            reply = response_buffer.pop(0)
            return {"reply": reply}
        time.sleep(0.05)
    return {"error": MSG_MCP_NO_RESPONSE}

# To run: uvicorn mcp_bridge:app --reload --port 7000 