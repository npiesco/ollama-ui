# Offline Functionality Testing Guide

This guide provides step-by-step instructions for testing the offline capabilities of Ollama UI using CLI commands.

## Prerequisites

1. Build and start the application:
```bash
npm run build
npm start
```

2. Start Ollama server:
```bash
ollama serve
```

## Testing Steps

### 1. Service Worker Registration

1. Start Chrome with remote debugging enabled:
```bash
# On macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# On Linux
google-chrome --remote-debugging-port=9222
```

2. Check service worker registration:
```bash
# Using Chrome DevTools Protocol
curl http://localhost:9222/json/version
curl http://localhost:9222/json/protocol
```

### 2. Static Asset Caching

1. Load the application while online:
```bash
# Check if application is accessible
curl -I http://localhost:3000

# Check service worker cache
curl http://localhost:9222/json/protocol/ServiceWorker
```

2. Verify cache storage:
```bash
# Check cache storage
curl http://localhost:9222/json/protocol/CacheStorage
```

### 3. Model Caching

1. Download a model while online:
```bash
# Pull a small model (phi-mini is ~1.3GB)
curl -X POST http://localhost:11434/api/pull -d '{"name": "phi-mini"}'

# Check model status
curl http://localhost:11434/api/tags
```

2. Verify model storage:
```bash
# Check IndexedDB storage
curl http://localhost:9222/json/protocol/IndexedDB
```

### 4. Offline Testing

1. Disable network:
```bash
# On macOS
sudo ifconfig en0 down

# On Linux
sudo ifconfig eth0 down
```

2. Test offline functionality:
```bash
# Check if application is still accessible
curl -I http://localhost:3000

# Try to use a cached model
curl -X POST http://localhost:11434/api/chat -d '{
  "model": "phi-mini",
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

3. Re-enable network:
```bash
# On macOS
sudo ifconfig en0 up

# On Linux
sudo ifconfig eth0 up
```

### 5. Performance Testing

1. Test offline performance:
```bash
# Measure response time
time curl -X POST http://localhost:11434/api/chat -d '{
  "model": "phi-mini",
  "messages": [{"role": "user", "content": "Hello"}]
}'

# Check memory usage
ps aux | grep ollama
```

### 6. Cleanup

1. Clear caches:
```bash
# Clear service worker cache
curl -X POST http://localhost:9222/json/protocol/CacheStorage/clear

# Clear IndexedDB
curl -X POST http://localhost:9222/json/protocol/IndexedDB/clear
```

2. Stop services:
```bash
# Stop Ollama server
pkill ollama

# Stop Next.js server
pkill -f "next start"
```

## Troubleshooting

### Service Worker Issues

1. Check service worker status:
```bash
curl http://localhost:9222/json/protocol/ServiceWorker
```

2. Clear service worker:
```bash
curl -X POST http://localhost:9222/json/protocol/ServiceWorker/unregister
```

### Model Caching Issues

1. Check model storage:
```bash
# Check IndexedDB
curl http://localhost:9222/json/protocol/IndexedDB

# Check Ollama models
curl http://localhost:11434/api/tags
```

2. Clear model cache:
```bash
# Remove model from Ollama
curl -X DELETE http://localhost:11434/api/delete -d '{"name": "phi-mini"}'
```

### Network Issues

1. Check network status:
```bash
# Check if Ollama is accessible
curl -I http://localhost:11434/api/version

# Check if UI is accessible
curl -I http://localhost:3000
```

2. Reset network:
```bash
# Restart network interface
sudo ifconfig en0 down && sudo ifconfig en0 up
```

## Browser Support Testing

Test the offline functionality in different browsers:

```bash
# Chrome
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Firefox (requires different debugging port)
firefox --remote-debugging-port=9223

# Safari (requires enabling developer tools)
defaults write com.apple.Safari IncludeDevelopMenu -bool true
```

## Reporting Issues

When reporting issues, include:
1. Browser version and OS
2. Network status
3. Service worker status
4. Model cache status
5. Error messages from:
   - Browser console
   - Ollama logs
   - Network requests 