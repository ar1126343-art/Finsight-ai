import subprocess
import time
import os
import sys

print("Starting FinSight AI Backend & Frontend Servers...")

backend_dir = os.path.join(os.path.dirname(__file__), "backend")
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")

uvicorn_path = r"C:\Users\Ahmed Raza\AppData\Roaming\Python\Python314\Scripts\uvicorn.exe"
if not os.path.exists(uvicorn_path):
    uvicorn_path = "uvicorn"

# Start FastAPI Backend
backend_process = subprocess.Popen(
    [uvicorn_path, "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
    cwd=backend_dir
)

# Start Vite Frontend
frontend_process = subprocess.Popen(
    ["npx", "vite", "--port", "5173"],
    cwd=frontend_dir,
    shell=True
)

print("\n=======================================================")
print(" FinSight AI Platform is Live & Operational!")
print(" Backend API:  http://localhost:8000")
print(" Frontend Web: http://localhost:5173")
print("=======================================================\n")

try:
    backend_process.wait()
    frontend_process.wait()
except KeyboardInterrupt:
    print("Shutting down FinSight AI servers...")
    backend_process.terminate()
    frontend_process.terminate()
