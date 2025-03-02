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
    # For testing: check MOCK_DOCKERENV_PATH environment variable
    mock_path = os.environ.get('MOCK_DOCKERENV_PATH')
    if mock_path:
        return os.path.exists(mock_path)
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

def check_service_health(max_attempts: int = 30, interval: int = 5) -> bool:
    """Check if services are healthy."""
    # For testing: skip health check if SKIP_HEALTH_CHECK is set
    if os.environ.get('SKIP_HEALTH_CHECK') == 'true':
        return True

    print("Waiting for services to be healthy...")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:3000/api/health")
            if response.status_code == 200 and response.json().get("status") == "healthy":
                return True
        except requests.RequestException:
            pass
        
        print(f"Attempt {attempt + 1}/{max_attempts}: Waiting for services to be ready...")
        time.sleep(interval)
    
    return False

def check_ollama_running(host: str = "http://localhost:11434") -> bool:
    """Check if Ollama is running locally."""
    try:
        response = requests.get(f"{host}/api/version")
        return response.status_code == 200
    except requests.RequestException:
        return False

def main():
    parser = argparse.ArgumentParser(description="Deploy Ollama UI")
    parser.add_argument(
        "--environment", 
        choices=["local", "docker"], 
        default="local",
        help="Deployment environment (default: local)"
    )
    args = parser.parse_args()

    # Check if we're in a Docker container
    if is_running_in_docker():
        print("Running inside Docker container, forcing Docker environment")
        args.environment = "docker"

    # Check for required commands
    required_commands = ["curl"]
    if args.environment == "docker":
        required_commands.extend(["docker", "docker-compose"])
    
    missing_commands = [cmd for cmd in required_commands if not check_command(cmd)]
    if missing_commands:
        print(f"Error: The following required commands are missing: {', '.join(missing_commands)}")
        sys.exit(1)

    # For Docker environment, check GPU and handle Docker-specific setup
    if args.environment == "docker":
        # Check for NVIDIA GPU
        has_gpu = check_nvidia_gpu()
        if has_gpu:
            print("NVIDIA GPU detected")
            code, stdout, _ = run_command("nvidia-smi")
            if code == 0:
                print(stdout)
        else:
            print("Warning: NVIDIA GPU not detected. The application will run in CPU-only mode.")

        # Create .env file for Docker
        create_env_file("docker")

        # Pull latest images
        print("Pulling latest Docker images...")
        run_command("docker-compose pull")

        # Build and start services
        print("Building and starting services...")
        run_command("docker-compose up --build -d")

    else:  # Local environment
        # Create .env file for local setup
        create_env_file("local")
        
        # Check if Ollama is running locally
        if not check_ollama_running():
            print("Error: Ollama is not running locally. Please start Ollama first.")
            print("You can start it by running: ollama serve")
            sys.exit(1)

        # For local development, you might want to start your Next.js app
        print("Starting Next.js application...")
        run_command("npm run dev", shell=True)

    # Check service health
    if not check_service_health():
        print("Error: Services failed to become healthy within the timeout period")
        if args.environment == "docker":
            run_command("docker-compose logs")
        sys.exit(1)

    print(f"""
✨ Deployment successful! ({args.environment} environment) ✨

📝 Access the application:
   - Web UI: http://localhost:3000
   - Ollama API: http://localhost:11434

🔍 Useful commands:""")
    
    if args.environment == "docker":
        print("""   - View logs: docker-compose logs -f
   - Stop services: docker-compose down
   - Restart services: docker-compose restart""")
    else:
        print("""   - Stop the application: Ctrl+C
   - Restart Ollama: ollama serve
   - View Ollama logs: Check your terminal running 'ollama serve'""")

    print("\nFor more information, check the README.md file.")

if __name__ == "__main__":
    main() 