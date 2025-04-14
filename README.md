# Ollama UI

A modern, feature-rich user interface for Ollama with true offline capabilities, providing a seamless experience for interacting with local language models. Powered by WebAssembly, ONNX Runtime, and Progressive Web App technology, it works both online and offline. Built with Next.js 15, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/next.js-15.1.7-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.1-38bdf8.svg)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/docker-24.0.7-2496ED.svg)](https://www.docker.com)
[![ONNX Runtime](https://img.shields.io/badge/onnx--runtime--web-1.17.0-7931C3.svg)](https://onnxruntime.ai)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)

## 🎥 Demo Video

<iframe width="100%" height="480" src="https://www.youtube.com/embed/DYPxKaW3mis" title="Ollama UI Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 🎯 Why Ollama UI?

AI is rapidly evolving with powerful language models like Llama, DeepSeek, Mistral, and Phi now capable of running on consumer-grade GPUs. Tools like Ollama make this possible, but there's still a significant barrier to entry - command line interfaces, AI terminology, and complex model parameters can be intimidating for newcomers.

Ollama UI bridges this gap by providing an intuitive, user-friendly interface that serves as a playground for both beginners and experts. What sets it apart is its true offline capabilities - powered by WebAssembly and ONNX Runtime Web, you can run models directly in your browser without an internet connection. As a Progressive Web App, it can be installed on any device and functions like a native application while maintaining full offline functionality.

Whether you're running models locally on your machine or hosting in the cloud to share with others, our goal is to make AI exploration accessible to everyone - online or offline, desktop or mobile.

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

## 🗺️ Development Roadmap

### Q2 2024 - Vector Database Integration
- **Browser-Based VectorDB with Offline RAG**
  - HNSW-based vector indexing in WebAssembly
  - Local document processing and embedding
  - Offline semantic search capabilities
  - Progressive loading with Web Workers
  - IndexedDB for persistent storage
  - Integration with existing chat system

### Q3 2024 - Enhanced RAG Capabilities
- **Advanced Document Processing**
  - Multi-format document support (PDF, DOCX, TXT)
  - Automatic chunking and embedding
  - Smart document organization
  - Version control for processed documents

- **Improved Search Experience**
  - Hybrid search (semantic + keyword)
  - Advanced filtering capabilities
  - Search history and favorites
  - Custom search templates

### Q4 2024 - Performance & Scale
- **Performance Optimizations**
  - WebGPU acceleration for embeddings
  - Optimized memory management
  - Batch processing improvements
  - Cache-aware storage layouts

- **Scale & Distribution**
  - Sharded vector pools
  - Multi-worker parallel processing
  - Cross-origin resource sharing
  - Cloud synchronization

### 2025 - Advanced Features
- **AI-Powered Enhancements**
  - Automatic document summarization
  - Smart document clustering
  - Context-aware search
  - Personalized search results

- **Enterprise Features**
  - Role-based access control
  - Audit logging
  - API rate limiting
  - Custom plugin system

## 🚀 Getting Started

### Quick Start Options

There are two ways to run Ollama UI:

#### 1. Local Development

1. Start Ollama:
```bash
ollama serve
```

2. Set up the development environment:
```bash
# Create and activate a Python virtual environment
python -m venv venv --clear
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
npm install
pip install -r requirements.txt

# Run the deployment script in local mode
python deploy.py --environment local
```

The UI will be available at `http://localhost:3001`

### Model Name and Tag Handling

Ollama UI properly handles model names and tags according to Ollama's conventions:

1. **Basic Model Names**
   - Simple model names like `llama2` or `mistral` are used as-is
   - Example: `llama2`

2. **Model Names with Tags**
   - Tags are appended to model names with a colon separator
   - Format: `model_name:tag`
   - Example: `llama2:7b`, `mistral:instruct`

3. **Parameter Sizes**
   - Parameter sizes are treated as tags
   - Examples:
     - `llama2:7b` (7 billion parameters)
     - `llama2:13b` (13 billion parameters)
     - `llama2:70b` (70 billion parameters)

4. **Default Tags**
   - Some models use the `default` tag
   - When `default` is the only available tag, it's omitted from the model name
   - Example: `nomic-embed-text` (uses default tag)

5. **API Handling**
   - The UI automatically formats model names with tags when making API calls
   - When pulling models, the full name (with tag) is sent to Ollama
   - Example: `POST /api/pull` with `{ "name": "llama2:7b" }`

6. **Error Prevention**
   - The UI validates model names and tags before making API calls
   - Invalid combinations are caught and reported with clear error messages
   - Duplicate model installations are prevented

7. **Model Discovery**
   - The `/api/models` endpoint uses HTML scraping from `ollama.com/library` to discover available models
   - This provides more detailed model information than the JSON API
   - The scraping implementation uses JSDOM to parse model cards and extract:
     - Model names and descriptions
     - Parameter sizes and capabilities
     - Pull counts and tag counts
     - Last updated timestamps
   - The implementation includes a smart caching mechanism:
     - HTML content is hashed to detect changes
     - If the HTML hasn't changed and we have cached models, we reuse the cached data
     - Only fetches and parses new data when the library page has been updated
     - Cache is persisted in IndexedDB for offline access
   - This approach ensures we have the most up-to-date model information directly from Ollama's website while minimizing unnecessary API calls

This ensures consistent handling of model names and tags across the application, preventing issues with model installation and management.

#### 2. Docker Deployment

Run everything in containers:

```bash
python deploy.py --environment docker
```

The UI will be available at `http://localhost:3000`

### Installing as a PWA

Ollama UI can be installed as a Progressive Web App on both desktop and mobile devices:

#### Desktop (Chrome, Edge, or other Chromium browsers)
1. Open Ollama UI in your browser
2. Look for the install icon (➕) in the address bar
3. Click "Install" in the prompt
4. The app will install and create a desktop shortcut

#### iOS
1. Open Ollama UI in Safari
2. Tap the Share button (📤)
3. Select "Add to Home Screen"
4. Tap "Add" to confirm

#### Android
1. Open Ollama UI in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home screen"
4. Follow the prompts to install

Once installed, Ollama UI will work like a native app with full offline capabilities.

## ⚙️ Configuration

### Environment Configuration

The application uses two main environment files:

#### `.env` (Docker/Production)
```env
# Base Configuration
NEXT_TELEMETRY_DISABLED=1
MODEL_CACHE_DIR=/root/.ollama/models

# Docker API Configuration
OLLAMA_API_HOST=http://ollama:11434
DOCKER_CONTAINER=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000

# Authentication (optional)
AUTH_ENABLED=false
JWT_SECRET=your-secret-key-here
```

#### `.env.local` (Local Development)
```env
# Local Development Overrides
PORT=3001
OLLAMA_API_HOST=http://localhost:11434
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Optional Local Authentication
# AUTH_ENABLED=true
# JWT_SECRET=dev-secret-key
```

### Environment Detection

The application intelligently detects the environment it's running in:

1. **Local Development**: Uses `http://localhost:11434` or `http://127.0.0.1:11434 for the Ollama API host
2. **Docker Environment**: Uses `http://ollama:11434` for the Ollama API host
3. **Custom Configuration**: Environment variables can override the defaults

The `DOCKER_CONTAINER` environment variable is used to explicitly identify Docker environments, ensuring proper host configuration.

### Authentication

Authentication is disabled by default. To enable it:

1. Set `AUTH_ENABLED=true` in your environment file
2. Set a secure `JWT_SECRET`
3. Restart the application

## 💻 Development

### Development Commands

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

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Start with custom environment variables
OLLAMA_API_HOST=http://custom-host:11434 AUTH_ENABLED=true docker-compose up -d
```

### Docker Environment Variables

When running with Docker, you can customize the environment by setting variables before the `docker-compose` command:

```bash
# Example: Enable authentication
AUTH_ENABLED=true JWT_SECRET=my-secure-secret docker-compose up -d

# Example: Use a custom Ollama host
OLLAMA_API_HOST=http://my-custom-ollama:11434 docker-compose up -d
```

The `DOCKER_CONTAINER=true` variable is automatically set in the docker-compose.yml file to ensure proper environment detection.

## 🧪 Testing

### Test Structure

The project uses Jest for testing and follows a centralized test organization pattern. All tests are located in the `src/__tests__` directory:

```
src/__tests__/
├── api/                         # API endpoint tests
│   └── health.test.ts
├── app/                        # App-specific tests
│   ├── chat.offline.test.tsx
│   └── offline.test.tsx
├── components/                 # Component tests
│   ├── chat.test.tsx
│   ├── CopyModel.test.tsx
│   ├── CreateModel.test.tsx
│   └── FormattedMessage.test.tsx
├── lib/                       # Library tests
│   ├── service-worker.test.ts
│   └── wasm/
│       └── offline-inference.test.ts
├── deploy.test.ts            # Deployment tests
└── setup.ts                  # Global test setup
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching a pattern
npm test -- -t "pattern"
```

### Test Categories

1. **Component Tests**: UI component testing using React Testing Library
2. **API Tests**: Backend API endpoint testing
3. **Integration Tests**: Service worker and offline functionality
4. **Unit Tests**: Utility functions and helpers
5. **E2E Tests**: Deployment and system integration

### Mocking

The project uses Jest's mocking capabilities for:
- Service Worker API
- IndexedDB
- ONNX Runtime
- Network requests
- Browser APIs

### Best Practices

1. Tests are colocated with source code in the `__tests__` directory
2. Each test file corresponds to a source file
3. Use descriptive test names and proper grouping
4. Mock external dependencies appropriately
5. Test both success and error cases
6. Include offline functionality testing

## 🔌 Offline Mode

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

## ❓ Troubleshooting

### Common Issues

1. **"Ollama is not running"**
   - Make sure `ollama serve` is running for local development
   - For Docker, ensure the Ollama container is healthy
   - For Ubuntu/Linux, verify Ollama is running and check API with:
     ```bash
     curl http://127.0.0.1:11434/api/tags
     ```
   - This will show all installed models and their details

2. **Port Conflicts**
   - Local development uses port 3001
   - Docker deployment uses port 3000
   - Ensure these ports are available

3. **Environment Issues**
   - Check you're using the correct `.env` file for your deployment method
   - For local development, ensure `.env.local` exists
   - For Docker, ensure `.env` exists and `DOCKER_CONTAINER=true` is set
   - If the application can't connect to Ollama, verify the `OLLAMA_API_HOST` is correctly set

4. **Environment Detection Problems**
   - In Docker: Ensure `DOCKER_CONTAINER=true` is set in your environment
   - In local development: The application should automatically use localhost
   - If manually overriding hosts, ensure the URLs are correctly formatted with protocol (http://)

5. **Offline Mode Issues**
   - Verify that models were successfully cached while online
   - Check browser console for IndexedDB or Service Worker errors
   - Ensure sufficient storage space is available

### Logs

- Local development: Check the terminal output
- Docker: Use `docker-compose logs -f`
- Browser console: Check for Service Worker and IndexedDB messages

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the GNU Affero General Public License v3 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

Copyright (C) 2024 Nicholas Piesco, iScope Solutions, LLC

The AGPL-3.0 is a strong copyleft license that requires anyone who runs a modified version of the software to make their source code available to users. This is particularly important for network server software, as it ensures that users of the software have access to the source code of any modifications made to it.

For more information about the AGPL-3.0 license, please visit: https://www.gnu.org/licenses/agpl-3.0.en.html