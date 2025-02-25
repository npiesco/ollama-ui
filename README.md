# Ollama Frontend

This project is a production-grade UI for Ollama, implementing all the functionalities described in the Ollama API documentation.

## Project Structure

- \`app/\`: Contains the main pages of the application
  - \`layout.tsx\`: The main layout component
  - \`page.tsx\`: The home page
  - \`chat/page.tsx\`: Chat interface
  - \`completion/page.tsx\`: Completion interface
  - \`embeddings/page.tsx\`: Embeddings interface
  - \`models/page.tsx\`: Model management interface
- \`components/\`: Contains reusable components
  - \`Sidebar.tsx\`: Navigation sidebar

## API Mapping

1. **Chat Completion** (\`/api/chat\`)
   - Implemented in \`app/chat/page.tsx\`
   - Allows users to have a conversation with the model
   - Supports streaming responses

2. **Generate Completion** (\`/api/generate\`)
   - Implemented in \`app/completion/page.tsx\`
   - Allows users to generate text completions
   - Supports streaming responses

3. **Generate Embeddings** (\`/api/embed\`)
   - Implemented in \`app/embeddings/page.tsx\`
   - Allows users to generate embeddings for given text

4. **Model Management**
   - Implemented in \`app/models/page.tsx\`
   - Covers multiple API endpoints:
     - List Models (\`/api/tags\`)
     - Pull Model (\`/api/pull\`)
     - Delete Model (\`/api/delete\`)
     - Show Model Information (\`/api/show\`)

## Features

- Streaming responses for chat and completion
- Error handling with toast notifications
- Responsive design
- Model management (list, pull, delete, show info)

## Running the Project

1. Ensure you have Node.js and npm installed
2. Clone the repository
3. Run \`npm install\` to install dependencies
4. Run \`npm run dev\` to start the development server
5. Open \`http://localhost:3000\` in your browser

Note: Make sure your Ollama server is running on \`http://localhost:11434\` for the frontend to work correctly.

## Future Improvements

- Implement the remaining API endpoints:
  - Create a Model (\`/api/create\`)
  - Copy a Model (\`/api/copy\`)
  - Push a Model (\`/api/push\`)
  - List Running Models (\`/api/ps\`)
  - Version Information (\`/api/version\`)
- Add user authentication and authorization
- Implement more advanced model options and parameters
- Add support for multimodal models (e.g., image input for llava)
- Improve UI/UX with more advanced components and animations
- Add unit and integration tests

