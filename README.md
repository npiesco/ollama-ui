# Ollama UI

A modern, feature-rich user interface for Ollama, providing a seamless experience for interacting with local language models. Built with Next.js 15, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/next.js-15.1.7-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.1-38bdf8.svg)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/docker-24.0.7-2496ED.svg)](https://www.docker.com)
[![ONNX Runtime](https://img.shields.io/badge/onnx--runtime--web-1.17.0-7931C3.svg)](https://onnxruntime.ai)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)

## 🎯 Why Ollama UI?

AI is rapidly evolving with powerful language models like Llama, DeepSeek, Mistral, and Phi now capable of running on consumer-grade GPUs. Tools like Ollama make this possible, but there's still a significant barrier to entry - command line interfaces, AI terminology, and complex model parameters can be intimidating for newcomers.

Ollama UI bridges this gap by providing an intuitive, user-friendly interface that serves as a playground for both beginners and experts. Whether you're running models locally on your machine or hosting in the cloud to share with others, our goal is to make AI exploration accessible to everyone.

## ✨ Key Features

### 🔌 True Offline Support
- **WebAssembly-Powered Inference**: Run models locally in your browser using ONNX Runtime Web
- **Smart Caching**: Models and responses are cached in IndexedDB and Service Worker Cache
- **Offline-First Design**: Continue using previously downloaded models without internet connectivity
- **Progressive Enhancement**: Seamless transition between online and offline modes

### 📱 Progressive Web App (PWA)
- **Installable**: Add to your home screen on desktop or mobile devices
- **App-Like Experience**: Full-screen mode and native-like interface
- **Automatic Updates**: Always get the latest version
- **Push Notifications**: Stay informed about model training and chat updates
- **Background Sync**: Queue actions when offline and execute when back online

## Quick Start

There are two ways to run Ollama UI:

### 1. Local Development

1. Start Ollama:
```bash
ollama serve
```

2. Set up the development environment:
```bash
# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
npm install

# Run the deployment script in local mode
python deploy.py --environment local
```

The UI will be available at `http://localhost:3001`

### 2. Docker Deployment

Run everything in containers:

```bash
python deploy.py --environment docker
```

The UI will be available at `http://localhost:3000`

## Installing as a PWA

Ollama UI can be installed as a Progressive Web App on both desktop and mobile devices:

### Desktop (Chrome, Edge, or other Chromium browsers)
1. Open Ollama UI in your browser
2. Look for the install icon (➕) in the address bar
3. Click "Install" in the prompt
4. The app will install and create a desktop shortcut

### iOS
1. Open Ollama UI in Safari
2. Tap the Share button (📤)
3. Select "Add to Home Screen"
4. Tap "Add" to confirm

### Android
1. Open Ollama UI in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home screen"
4. Follow the prompts to install

Once installed, Ollama UI will work like a native app with full offline capabilities.

## Environment Configuration

The application uses two main environment files:

### `.env` (Docker/Production)
```env
# Base Configuration
NEXT_TELEMETRY_DISABLED=1
MODEL_CACHE_DIR=/root/.ollama/models

# Docker API Configuration
OLLAMA_API_HOST=http://ollama:11434
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000

# Authentication (optional)
AUTH_ENABLED=false
JWT_SECRET=your-secret-key-here
```

### `.env.local` (Local Development)
```env
# Local Development Overrides
PORT=3001
OLLAMA_API_HOST=http://localhost:11434
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Optional Local Authentication
# AUTH_ENABLED=true
# JWT_SECRET=dev-secret-key
```

## Development Commands

```bash
# Start in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Offline Mode

Ollama UI features a robust offline mode that allows you to continue using the application even without internet connectivity:

### How It Works
1. **Model Caching**: Models are automatically cached in IndexedDB when first downloaded
2. **Service Worker**: Static assets and API responses are cached for offline use
3. **WebAssembly Inference**: Models run locally in your browser using ONNX Runtime Web
4. **Smart Fallbacks**: Graceful degradation when resources aren't available offline

### Testing Offline Mode
1. Download and use models while online
2. Disconnect from the internet
3. Continue using previously downloaded models
4. Check the offline testing guide in `docs/offline-testing.md` for detailed instructions

## Authentication

Authentication is disabled by default. To enable it:

1. Set `AUTH_ENABLED=true` in your environment file
2. Set a secure `JWT_SECRET`
3. Restart the application

## Troubleshooting

### Common Issues

1. **"Ollama is not running"**
   - Make sure `ollama serve` is running for local development
   - For Docker, ensure the Ollama container is healthy

2. **Port Conflicts**
   - Local development uses port 3001
   - Docker deployment uses port 3000
   - Ensure these ports are available

3. **Environment Issues**
   - Check you're using the correct `.env` file for your deployment method
   - For local development, ensure `.env.local` exists
   - For Docker, ensure `.env` exists

4. **Offline Mode Issues**
   - Verify that models were successfully cached while online
   - Check browser console for IndexedDB or Service Worker errors
   - Ensure sufficient storage space is available

### Logs

- Local development: Check the terminal output
- Docker: Use `docker-compose logs -f`
- Browser console: Check for Service Worker and IndexedDB messages

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under a Business Source License - see the [LICENSE](LICENSE) file for details.