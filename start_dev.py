import subprocess
import sys
import os
import time
from threading import Thread

def run_backend():
    """Run the FastAPI backend server"""
    os.chdir("backend")
    subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])

def run_frontend():
    """Run the frontend development server"""
    os.chdir("frontend")
    subprocess.run(["npm", "run", "dev"])

if __name__ == "__main__":
    # Store the original directory
    original_dir = os.getcwd()
    
    # Start backend in a separate thread
    backend_thread = Thread(target=run_backend)
    backend_thread.daemon = True
    backend_thread.start()
    
    # Wait a bit for the backend to start
    time.sleep(2)
    
    # Return to original directory
    os.chdir(original_dir)
    
    # Start frontend
    run_frontend() 