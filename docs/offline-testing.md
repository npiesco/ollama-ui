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

# Testing Ollama UI Offline Functionality

## UI Testing Guide

### 1. Initial Setup
1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser
3. Verify you can see the models list and chat interface

### 2. Pre-Offline Setup
1. Go to the Models page
2. Make sure `phi3:mini` is installed
   - If not, click "Install" next to phi3:mini
   - Wait for installation to complete
3. Test the model is working:
   - Go to Chat
   - Select `phi3:mini` from the model dropdown
   - Send a test message like "Hello"
   - Verify you get a response

### 3. Testing Offline Mode
1. Disconnect your network:
   - Turn off Wi-Fi, OR
   - Unplug ethernet cable
2. Test the following features:
   - Navigate between pages (Models, Chat, etc.)
   - Start a new chat
   - Send messages using phi3:mini
   - Check model settings
   - Try different prompts

### 4. Common Issues & Solutions

If you see "Failed to fetch models" error:
1. Check the Network tab in DevTools
2. Verify OLLAMA_API_HOST is set to `http://localhost:11434`
3. Ensure Ollama is running (`ollama serve`)
4. Try refreshing the page

If chat doesn't work offline:
1. Make sure you tested the model while online first
2. Check if model is properly installed in Models page
3. Try restarting the Ollama server and UI

### 5. Restoring Online Mode
1. Reconnect your network
2. Refresh the page
3. Verify all functionality returns to normal

## Environment Configuration

Make sure your `.env.local` has these settings:
```env
OLLAMA_API_HOST=http://localhost:11434
NODE_ENV=development
DEFAULT_MODEL=phi3:mini
```

## Troubleshooting Tips
1. Use browser DevTools (F12):
   - Check Console for errors
   - Network tab to verify requests
   - Application tab to check service worker status
2. Check Ollama server logs
3. Verify model files exist in `~/.ollama/models` 