# Contributing to Ollama UI

Thank you for your interest in contributing to Ollama UI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Vector Database Development](#vector-database-development)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Documentation](#documentation)
- [Questions and Support](#questions-and-support)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/ollama-ui.git
   cd ollama-ui
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes
2. Run tests:
   ```bash
   npm test
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Code Style

- Follow the existing code style and patterns
- Use TypeScript for type safety
- Follow ESLint rules (run `npm run lint` to check)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Vector Database Development

### Architecture Guidelines
- **Core Implementation**
  - Use WebAssembly for HNSW algorithm
  - Implement in Rust for performance
  - Use TypeScript for browser integration
  - Follow WASM best practices

- **Storage Layer**
  - Use IndexedDB for persistence
  - Implement efficient serialization
  - Handle storage quotas gracefully
  - Support data migration

- **Performance Considerations**
  - Optimize memory usage
  - Use Web Workers for heavy computations
  - Implement progressive loading
  - Add performance monitoring

### Development Workflow
1. **Setup Development Environment**
   ```bash
   # Install Rust toolchain
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install wasm-pack
   cargo install wasm-pack
   
   # Install additional dependencies
   npm install
   ```

2. **Building the VectorDB**
   ```bash
   # Build WASM module
   cd src/lib/vector-db
   wasm-pack build --target web
   
   # Build TypeScript bindings
   npm run build:vector-db
   ```

3. **Testing**
   - Run Rust tests: `cargo test`
   - Run WASM tests: `wasm-pack test --chrome --headless`
   - Run integration tests: `npm test -- vector-db`

### Code Organization
```
src/lib/vector-db/
├── rust/              # Rust implementation
│   ├── src/
│   │   ├── lib.rs    # Core HNSW implementation
│   │   └── ffi.rs    # WASM bindings
│   └── Cargo.toml
├── typescript/        # TypeScript integration
│   ├── index.ts      # Main interface
│   ├── storage.ts    # IndexedDB wrapper
│   └── worker.ts     # Web Worker implementation
└── tests/            # Test suite
    ├── rust/         # Rust unit tests
    ├── wasm/         # WASM integration tests
    └── integration/  # End-to-end tests
```

### Best Practices
1. **Memory Management**
   - Use RAII patterns in Rust
   - Implement proper cleanup
   - Monitor memory usage
   - Handle large datasets

2. **Error Handling**
   - Use Result types in Rust
   - Implement proper error propagation
   - Add detailed error messages
   - Handle edge cases

3. **Testing**
   - Write unit tests for Rust code
   - Test WASM integration
   - Add performance benchmarks
   - Test offline scenarios

4. **Documentation**
   - Document public APIs
   - Add usage examples
   - Include performance notes
   - Document limitations

## Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Follow the existing test patterns in `src/__tests__`
- Use Jest and React Testing Library for testing

## Pull Requests

1. Keep PRs focused and small
2. Provide a clear description of changes
3. Reference any related issues
4. Ensure all tests pass
5. Update documentation if needed
6. Request reviews from maintainers

## Documentation

- Update README.md for significant changes
- Add comments for complex code
- Document new features and APIs
- Keep the documentation up to date

## Questions and Support

- Open an issue for bugs or feature requests
- Join our community discussions
- Contact maintainers for specific questions

## License

By contributing to Ollama UI, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.

Thank you for contributing to Ollama UI! 