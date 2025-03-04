# 🤖 Ollama UI

A modern, feature-rich user interface for Ollama, providing a seamless experience for interacting with local language models. Built with Next.js 15, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/next.js-15.1.7-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.1-38bdf8.svg)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/docker-24.0.7-2496ED.svg)](https://www.docker.com)

## 🎯 Why Ollama UI?

AI is rapidly evolving with powerful language models like Llama, DeepSeek, Mistral, and Phi now capable of running on consumer-grade GPUs. Tools like Ollama make this possible, but there's still a significant barrier to entry - command line interfaces, AI terminology, and complex model parameters can be intimidating for newcomers.

Ollama UI bridges this gap by providing an intuitive, user-friendly interface that serves as a playground for both beginners and experts. Whether you're running models locally on your machine or hosting in the cloud to share with others, our goal is to make AI exploration accessible to everyone.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ (for deployment script)
- Node.js 20.x LTS (for local development)
- npm/yarn (for local development)
- Docker and docker-compose (for containerized deployment)
- Ollama installed and running locally (for local development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ollama-ui
```

2. Create and activate a Python virtual environment:
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```

3. Install Python dependencies for the deployment script:
```bash
pip install requests
```

### Deployment Options

#### Option 1: Local Development
This option is best for development and testing. It requires Ollama to be installed and running locally.

1. Start Ollama:
```bash
ollama serve
```

2. Deploy the UI:
```bash
python deploy.py --environment local
```

This will:
- Create a local environment configuration
- Verify Ollama is running locally
- Start the Next.js development server
- Open the UI at http://localhost:3000

#### Option 2: Docker Deployment
This option is recommended for production and distribution. It packages both Ollama and the UI in containers, with automatic health checks and graceful startup handling.

1. Deploy with Docker:
```bash
python deploy.py --environment docker
```

This will:
- Create a Docker-specific environment configuration
- Check for GPU support (works on both GPU and non-GPU systems)
- Pull and build Docker images
- Start the containers with health checks
- Open the UI at http://localhost:3000

### Environment Configuration

The application uses different environment configurations based on the deployment method. A `.env.example` file is provided as a template:

```env
# Ollama API Configuration
OLLAMA_API_HOST=http://ollama:11434  # Use http://localhost:11434 for local development

# Environment
NODE_ENV=production

# Authentication
AUTH_ENABLED=false
JWT_SECRET=change-this-to-a-secure-secret-key

# Optional: Model Configuration
DEFAULT_MODEL=llama2
MODEL_CACHE_DIR=/root/.ollama/models

# Optional: UI Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

You can customize these settings by copying `.env.example` to `.env` and modifying the values.

## 🌟 Features

### 🔐 Authentication
- Secure login system
- Protected routes and API endpoints
- JWT-based authentication
- Session management

### 💬 Chat Interface
- Real-time streaming responses
- Customizable model parameters
- Message history management
- Responsive design with dark/light mode support
- Mathematical formula rendering with KaTeX
- Code syntax highlighting
- GitHub-flavored markdown support

### 🤖 Model Management
- Browse and manage local models
- Pull new models from repositories
- Delete unused models
- View detailed model information
- Create and customize models
- Push models to registry
- Copy and modify existing models
- Monitor running model instances

## 🛠 Tech Stack

- **Framework:** Next.js 15.1.7 with App Router and TurboPack
- **Language:** TypeScript 5
- **Authentication:** JSON Web Tokens (JWT)
- **Styling:** 
  - Tailwind CSS 3.4.1
  - CSS Animations
  - Dark/Light mode support
- **UI Components:** 
  - Radix UI primitives
  - Framer Motion animations
  - Sonner toast notifications
  - shadcn/ui components
- **State Management:** 
  - Zustand
  - SWR for data fetching
- **Content Rendering:**
  - React Markdown
  - KaTeX for math formulas
  - Syntax highlighting
  - GitHub-flavored markdown
- **Testing:**
  - Jest
  - React Testing Library
  - Coverage reporting
- **Data Validation:** Zod schema validation
- **Development Tools:**
  - ESLint
  - TypeScript strict mode
  - TurboPack
- **Containerization:**
  - Docker
  - Docker Compose
  - Health checks
  - GPU support (optional)

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in the `__tests__` directory and follow the `.test.ts(x)` naming convention.

## 🛠 Troubleshooting

### Local Development
1. If Ollama isn't running:
```bash
ollama serve
```

2. If the UI isn't responding:
```bash
# Restart the Next.js server
npm run dev
```

### Docker Deployment
1. View container logs:
```bash
# View all container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f ollama
docker-compose logs -f ollama-ui
```

2. Check container health:
```bash
# View container status
docker-compose ps

# Check container health status
docker inspect ollama-ui --format "{{.State.Health.Status}}"
docker inspect ollama --format "{{.State.Health.Status}}"
```

3. Restart services:
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart ollama
docker-compose restart ollama-ui
```

4. Reset everything:
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild and start fresh
python deploy.py --environment docker
```

5. Common Issues:
   - If containers fail health checks, check the logs for specific error messages
   - Ensure ports 3000 and 11434 are not in use by other applications
   - For GPU support issues, verify NVIDIA drivers and nvidia-container-toolkit are installed
   - If the UI can't connect to Ollama, verify the OLLAMA_API_HOST environment variable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Business Source License 1.1 (BUSL). This is a source-available license that provides access to the source code while limiting certain commercial uses. Key points:

- The source code is available for viewing, modification, and non-commercial use
- Commercial use requires a commercial license
- For commercial licensing inquiries, please contact the maintainer

For full license terms, see the [LICENSE](LICENSE) file.

## 🏗 Project Structure

```
ollama-ui/
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── chat/           # Chat interface
│   │   ├── models/         # Model management
│   │   ├── settings/       # Application settings
│   │   ├── blobs/          # Blob management
│   │   ├── embeddings/     # Embeddings generation
│   │   ├── version/        # Version information
│   │   ├── list-models/    # Model listing
│   │   ├── model-info/     # Model details
│   │   ├── pull-model/     # Model pulling
│   │   ├── push-model/     # Model pushing
│   │   ├── copy-model/     # Model copying
│   │   ├── create-model/   # Model creation
│   │   ├── delete-model/   # Model deletion
│   │   └── running-models/ # Running model instances
│   ├── components/         # Reusable UI components
│   │   ├── Chat.tsx        # Main chat interface
│   │   ├── AnimatedMessage.tsx  # Animated message display
│   │   ├── AdvancedParameters.tsx  # Model parameter controls
│   │   └── MultimodalInput.tsx  # Text and image input handling
│   ├── hooks/              # Custom React hooks   
│   ├── lib/                # Utility functions
│   ├── store/              # State management (Zustand)
│   └── types/              # TypeScript definitions
├── __tests__/              # Test files
├── public/                 # Static assets
├── .env.example           # Example environment configuration
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # UI container build configuration
├── Dockerfile.ollama     # Ollama container build configuration
├── deploy.py             # Deployment script
├── next.config.ts        # Next.js configuration
└── package.json          # Project dependencies and scripts
```

---

<div align="center">
Made with ❤️ to lower the barrier for those wanting to learn and play with AI

[Report Bug](https://github.com/username/ollama-ui/issues) · [Request Feature](https://github.com/username/ollama-ui/issues)
</div>