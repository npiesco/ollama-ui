<div align="center">

# 🤖 Ollama UI
### *Professional User Interface for Ollama API*

[![Next.js](https://img.shields.io/badge/next.js-14.0.0-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.0.0-38bdf8.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## 📖 Overview
A comprehensive user interface for Ollama, implementing all functionalities described in the Ollama API documentation. Built with Next.js, TypeScript, and Tailwind CSS, it provides a modern, responsive interface for interacting with Ollama's language models.

## 🎯 Key Features

<table>
<tr>
<td width="50%">

### Core Features
- **Chat Interface**
  - Streaming responses
  - Multi-modal support
  - Advanced parameters
  - JSON output formatting
- **Model Management**
  - List/Pull/Delete models
  - Create/Copy models
  - Push models to registry
  - Version information

</td>
<td width="50%">

### Advanced Capabilities
- **Embeddings Generation**
  - Text embeddings
  - Batch processing
  - Vector visualization
- **System Features**
  - Error handling
  - Toast notifications
  - Responsive design
  - Dark mode support

</td>
</tr>
</table>

## 📋 Prerequisites

<details open>
<summary><strong>System Requirements</strong></summary>

| Component | Requirement | Details |
|-----------|-------------|----------|
| 🟢 Node.js | 18.0.0+ | Runtime environment |
| 📦 npm/yarn | Latest | Package management |
| 🤖 Ollama | Latest | Local model server |
| 💻 OS | Cross-platform | Windows, macOS, or Linux |

</details>

## 🏗 Project Structure

```
ollama-ui/
├── app/                    # Next.js pages
│   ├── layout.tsx         # Main layout
│   ├── page.tsx          # Home page
│   ├── chat/             # Chat interface
│   ├── completion/       # Text completion
│   ├── embeddings/       # Embeddings generation
│   └── models/          # Model management
├── components/            # Reusable components
├── types/                # TypeScript definitions
└── public/               # Static assets
```

## 🚀 Getting Started

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ollama-ui
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000`

## 💻 API Integration

### Chat Completion
```typescript
POST /api/chat
{
  "model": "llama2",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": true
}
```

### Model Management
```typescript
POST /api/pull
{
  "model": "llama2"
}
```

## 🔧 Configuration

### Environment Variables
```env
OLLAMA_API_HOST=http://localhost:11434
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 📄 License

This project is privately licensed. All rights reserved.

---

<div align="center">

Built with 💻 Next.js and maintained with ❤️

[Report Bug](https://github.com/username/ollama-ui/issues) · [Request Feature](https://github.com/username/ollama-ui/issues)

</div>

