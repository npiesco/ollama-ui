# 🤖 Ollama UI

A modern, feature-rich user interface for Ollama, providing a seamless experience for interacting with local language models. Built with Next.js 15, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/next.js-15.1.7-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4.1-38bdf8.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Why Ollama UI?

 AI is rapidly evolving with powerful language models like Llama, DeepSeek, Mistral, and Phi now capable of running on consumer-grade GPUs. Tools like Ollama make this possible, but there's still a significant barrier to entry - command line interfaces, AI terminology, and complex model parameters can be intimidating for newcomers.

Ollama UI bridges this gap by providing an intuitive, user-friendly interface that serves as a playground for both beginners and experts. Whether you're running models locally on your machine or hosting in the cloud to share with others, our goal is to make AI exploration accessible to everyone.

## 🌟 Features

### 💬 Advanced Chat Interface
- Real-time streaming responses with animated messages
- Multi-modal chat support with image upload capabilities - TODO!
- Customizable model parameters with advanced settings
- Message history management and persistence
- Responsive design with dark/light mode support
- Rich text formatting and code syntax highlighting - TODO!

### 🤖 Comprehensive Model Management
- Browse and manage local models with detailed information
- Pull new models from repositories with progress tracking
- Delete unused models with confirmation
- Detailed model information and specifications
- Create and customize models with advanced parameters
- Push models to registry with version control
- Copy and modify existing models
- Monitor running model instances

### 🔧 Advanced Features
- Multi-modal support for image and text inputs - TODO!
- Server control panel for managing Ollama instance
- Embeddings generation and management
- JWT-based authentication - TODO!
- Real-time error handling with toast notifications
- Version information and tracking
- Blob management for large files
- Advanced parameter customization

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or later
- npm/yarn
- Ollama installed and running locally

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ollama-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file:
```env
OLLAMA_API_HOST=http://localhost:11434
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗 Project Structure

```
ollama-ui/
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── api/           # API routes
│   │   ├── chat/         # Chat interface
│   │   ├── models/       # Model management
│   │   ├── settings/     # Application settings
│   │   ├── blobs/       # Blob management
│   │   ├── embeddings/   # Embeddings generation
│   │   └── version/     # Version information
│   ├── components/        # Reusable UI components
│   │   ├── ui/          # Base UI components
│   │   ├── Chat.tsx     # Main chat interface
│   │   ├── ServerControl.tsx # Server management
│   │   ├── MultimodalInput.tsx # Multi-modal support
│   │   └── AdvancedParameters.tsx # Model parameters
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── store/            # State management (Zustand)
│   └── types/            # TypeScript definitions
├── __tests__/           # Test files
├── public/              # Static assets
└── ...                 # Config files
```

## 🛠 Tech Stack

- **Framework:** Next.js 15 with App Router and TurboPack
- **Language:** TypeScript 5
- **Styling:** 
  - Tailwind CSS 3.4
  - CSS Animations
  - Dark/Light mode support
- **UI Components:** 
  - Radix UI primitives for accessible components
  - Framer Motion for smooth animations
  - Sonner for toast notifications
  - shadcn/ui component library
- **State Management:** 
  - Zustand for global state
  - SWR for data fetching and caching
- **Testing:**
  - Jest for unit testing
  - React Testing Library for component testing
  - Coverage reporting
- **Data Validation:** Zod schema validation
- **Development Tools:**
  - ESLint for code linting
  - TypeScript strict mode
  - Jest for testing
  - TurboPack for fast builds

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is privately licensed. All rights reserved.

---

<div align="center">
Made with ❤️ to lower the barrier for those wanting to learn and play with AI

[Report Bug](https://github.com/username/ollama-ui/issues) · [Request Feature](https://github.com/username/ollama-ui/issues)
</div>

## ⚙️ Environment Configuration

### Required Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```env
# Required - Ollama API endpoint
OLLAMA_API_HOST=http://localhost:11434

# Optional - Authentication
JWT_SECRET=your-jwt-secret-here

# Optional - Server configuration
NODE_ENV=development
PORT=3000
```

### Environment Files

- `.env`: Main environment file for local development
- `.env.test`: Environment configuration for testing
- `.env.example`: Example configuration (do not use in production)

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OLLAMA_API_HOST` | Ollama API endpoint URL | http://localhost:11434 | Yes |
| `JWT_SECRET` | Secret key for JWT authentication | undefined | No |
| `NODE_ENV` | Node environment (development/production/test) | development | No |
| `PORT` | Port for the Next.js application | 3000 | No |

### Usage in Different Environments

1. **Local Development**
   ```bash
   # Use default .env file
   npm run dev
   ```

2. **Testing**
   ```bash
   # Use .env.test configuration
   npm run test
   ```

3. **Production**
   ```bash
   # Use production environment variables
   npm run build
   npm run start
   ```

### Security Considerations

- Never commit `.env` files containing sensitive information
- Use different JWT secrets for development and production
- In production, use secure HTTPS URLs for `OLLAMA_API_HOST`
- Consider using a secrets manager for production deployments