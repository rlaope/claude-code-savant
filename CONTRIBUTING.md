# Contributing to claude-code-savant

Thank you for your interest in contributing to claude-code-savant! This document provides guidelines and steps for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS)

### Suggesting Features

1. Check existing issues for similar suggestions
2. Use the feature request template
3. Describe the use case and expected behavior

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linting if available
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/claude-code-savant.git
cd claude-code-savant

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## Project Structure

```
src/
├── index.ts              # MCP server entry point
├── tools/                # Tool definitions
├── personas/             # Persona implementations
└── utils/                # Utility functions
```

## Coding Guidelines

- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new features
- Keep functions focused and small
- Use descriptive variable names
- Document public APIs with JSDoc comments

## Adding a New Persona

1. Create a new file in `src/personas/`
2. Implement the `Persona` interface from `types.ts`
3. Register in `src/personas/index.ts`
4. Add tests in `tests/`
5. Update documentation

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/personas.test.ts
```

## Questions?

Feel free to open an issue for any questions about contributing.
