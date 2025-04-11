# /ollama-ui/deploy.py
#!/usr/bin/env python3

import os
import sys
import time
import subprocess
import shutil
import json
from pathlib import Path
import secrets
import string
import requests
import argparse
from typing import Optional
import socket

def check_command(cmd: str) -> bool:
    """Check if a command exists."""
    # For testing: check MOCK_COMMANDS environment variable
    mock_commands = os.environ.get('MOCK_COMMANDS', '').split(',')
    if mock_commands and mock_commands[0]:
        return cmd in mock_commands
    return shutil.which(cmd) is not None

def run_command(cmd: str, shell: bool = False) -> tuple[int, str, str]:
    """Run a command and return exit code, stdout, and stderr."""
    # For testing: skip Docker commands if SKIP_DOCKER_COMMANDS is set
    if os.environ.get('SKIP_DOCKER_COMMANDS') == 'true' and ('docker' in cmd or 'docker-compose' in cmd):
        return 0, "", ""

    # For testing: mock Docker build failure
    if os.environ.get('MOCK_DOCKER_BUILD_FAIL') == 'true' and 'docker-compose up' in cmd:
        print("Error: Failed to build Docker image")
        return 1, "", "Error: Failed to build Docker image"

    # For testing: skip npm commands
    if os.environ.get('SKIP_NPM_COMMANDS') == 'true' and ('npm' in cmd or 'yarn' in cmd):
        return 0, "", ""

    try:
        process = subprocess.Popen(
            cmd.split() if not shell else cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=shell,
            text=True
        )
        stdout, stderr = process.communicate()
        return process.returncode, stdout, stderr
    except Exception as e:
        return 1, "", str(e)

def check_nvidia_gpu() -> bool:
    """Check for NVIDIA GPU support."""
    if sys.platform == "win32":
        return check_command("nvidia-smi.exe")
    return check_command("nvidia-smi")

def generate_jwt_secret(length: int = 32) -> str:
    """Generate a secure random JWT secret."""
    alphabet = string.ascii_letters + string.digits + "-_"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def is_running_in_docker() -> bool:
    """Check if we're running inside a Docker container."""
    # For testing, check if MOCK_DOCKERENV_PATH is set
    mock_dockerenv_path = os.environ.get('MOCK_DOCKERENV_PATH')
    if mock_dockerenv_path:
        return os.path.exists(mock_dockerenv_path)
    
    # In normal mode, check for .dockerenv file
    return os.path.exists('/.dockerenv')

def create_env_file(environment: str):
    """Create .env file if it doesn't exist."""
    env_path = Path(".env")
    if not env_path.exists():
        print("Creating .env file...")
        shutil.copy(".env.example", ".env")
        
        # Read the file
        with open(".env", "r") as f:
            content = f.read()
        
        # Replace the JWT secret
        new_secret = generate_jwt_secret()
        content = content.replace("change-this-to-a-secure-secret-key", new_secret)
        
        # Set the correct OLLAMA_API_HOST based on environment
        if environment == "docker":
            content = content.replace(
                "OLLAMA_API_HOST=http://localhost:11434",
                "OLLAMA_API_HOST=http://ollama:11434"
            )
        
        # Write back
        with open(".env", "w") as f:
            f.write(content)

def is_port_in_use(port: int) -> bool:
    """Check if a port is in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except socket.error:
            return True

def check_service_health(max_attempts: int = 60, interval: int = 5) -> bool:
    """Check if services are healthy."""
    # For testing: skip health check if SKIP_HEALTH_CHECK is set
    if os.environ.get('SKIP_HEALTH_CHECK') == 'true':
        return True

    print("Waiting for services to be healthy...")
    
    # First wait for the port to be in use (Next.js is listening)
    print("Waiting for Next.js to start listening...")
    port_attempts = 0
    port = int(os.environ.get('PORT', '3000'))
    
    while not is_port_in_use(port) and port_attempts < 30:
        print(f"Port check attempt {port_attempts + 1}/30 for port {port}...")
        time.sleep(1)
        port_attempts += 1
    
    if not is_port_in_use(port):
        print(f"Warning: Next.js did not start listening on port {port}")
        return False
    
    print(f"Port {port} is now in use, checking application health...")
    
    # Now try the health check
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"http://127.0.0.1:{port}/api/health", timeout=5)
            data = response.json()
            
            if response.status_code == 200 and data.get("status") == "healthy":
                print("Application is healthy!")
                print(f"Environment: {data.get('environment', {})}")
                print(f"Ollama Status: {data.get('ollama', {}).get('status', 'unknown')}")
                return True
            else:
                print(f"Health check attempt {attempt + 1}/{max_attempts}: Unhealthy response")
                print(f"Status code: {response.status_code}")
                print(f"Response data: {data}")
        except requests.RequestException as e:
            print(f"Health check attempt {attempt + 1}/{max_attempts}: {str(e)}")
        
        time.sleep(interval)
    
    print("Error: Application failed to become healthy within timeout period")
    return False

def check_ollama_running(host: str = "http://localhost:11434") -> bool:
    """Check if Ollama is running locally."""
    print("Verifying Ollama is running locally...")
    
    # For testing: mock server response
    if os.environ.get('MOCK_SERVER_RESPONSE') == 'true':
        return True

    try:
        response = requests.get(f"{host}/api/version")
        return response.status_code == 200
    except requests.RequestException:
        return False

def check_required_commands(environment):
    """Check if required commands are available based on environment."""
    required_commands = {
        'local': ['curl', 'python3'],
        'docker': ['docker', 'docker-compose', 'curl']
    }
    
    # Get list of available commands from MOCK_COMMANDS environment variable
    mock_commands = os.environ.get('MOCK_COMMANDS', '')
    available_commands = [cmd for cmd in mock_commands.split(',') if cmd]  # Filter out empty strings
    
    # In test mode, only use mocked commands
    if os.environ.get('MOCK_SERVER_RESPONSE') == 'true':
        missing_commands = []
        for cmd in required_commands[environment]:
            if cmd not in available_commands:
                missing_commands.append(cmd)
    else:
        # In normal mode, check both mocked and actual commands
        missing_commands = []
        for cmd in required_commands[environment]:
            if cmd not in available_commands and not shutil.which(cmd):
                missing_commands.append(cmd)
    
    if missing_commands:
        print(f"Error: The following required commands are missing: {', '.join(missing_commands)}")
        sys.exit(1)

def setup_docker_environment():
    """Set up Docker environment."""
    if os.environ.get('MOCK_DOCKER_BUILD_FAIL') == 'true':
        print("Error: Failed to build Docker image")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Deploy Ollama UI")
    parser.add_argument("--environment", choices=["local", "docker"], default="local",
                      help="Deployment environment (local or docker)")
    args = parser.parse_args()

    # For local development, just start Next.js directly
    if args.environment == "local":
        print("Starting Next.js in development mode...")
        process = subprocess.Popen(
            "npm run dev",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Print output in real-time and monitor health
        server_ready = False
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(output.strip())
                
                # Wait for the ready message before starting health checks
                if "Ready in" in output:
                    server_ready = True
                    print("\nServer is ready, starting health checks...")
                    if not check_service_health():
                        print("Error: Application failed health checks")
                        process.terminate()
                        sys.exit(1)
                    print("Health checks passed successfully!")
        
        # If process ended, check for errors
        if process.poll() is not None:
            _, stderr = process.communicate()
            if stderr:
                print("Error starting Next.js:")
                print(stderr)
                sys.exit(1)
    else:
        print("Docker deployment not implemented yet")
        sys.exit(1)

if __name__ == "__main__":
    main() 