#!/bin/bash

# Make script exit on any error
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
echo "Checking prerequisites..."
for cmd in docker docker-compose curl; do
    if ! command_exists "$cmd"; then
        echo "Error: $cmd is required but not installed."
        exit 1
    fi
done

# Check for NVIDIA GPU and drivers
echo "Checking for NVIDIA GPU support..."
if command_exists nvidia-smi; then
    echo "NVIDIA GPU detected"
    nvidia-smi
else
    echo "Warning: NVIDIA GPU not detected. The application will run in CPU-only mode."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/change-this-to-a-secure-secret-key/$JWT_SECRET/" .env
    rm -f .env.bak
fi

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose pull

# Build and start services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
attempt=1
max_attempts=30
until curl -s http://localhost:3000/api/health | grep -q "healthy" || [ $attempt -eq $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Waiting for services to be ready..."
    sleep 5
    ((attempt++))
done

if [ $attempt -eq $max_attempts ]; then
    echo "Error: Services failed to become healthy within the timeout period"
    docker-compose logs
    exit 1
fi

echo "
✨ Deployment successful! ✨

📝 Access the application:
   - Web UI: http://localhost:3000
   - Ollama API: http://localhost:11434

🔍 Useful commands:
   - View logs: docker-compose logs -f
   - Stop services: docker-compose down
   - Restart services: docker-compose restart

For more information, check the README.md file.
" 