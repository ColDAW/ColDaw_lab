# Contributing to ColDaw

We're excited that you're interested in contributing to ColDaw! This document outlines the process for contributing to this project.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- Git
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ColDaw_lab.git
   cd ColDaw_lab
   ```

3. Install dependencies:
   ```bash
   npm run install:all
   ```

4. Set up environment variables (see README.md)

5. Start development servers:
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   cd client && npm run dev
   ```

## 📋 Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow the existing code style (ESLint configuration)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional components with hooks

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use styled-components for styling
- Follow the established component structure

### Backend Code
- Use async/await instead of callbacks
- Implement proper error handling
- Add input validation for all API endpoints
- Write comprehensive API documentation

## 🎯 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for our commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts

### Examples
```bash
feat(auth): add JWT token refresh functionality
fix(vst): resolve project detection on Windows
docs: update installation instructions
refactor(api): simplify project data parsing
```

## 🔍 Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Frontend tests
   cd client && npm test
   
   # Backend tests
   cd server && npm test
   
   # Type checking
   npm run typecheck
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of changes
   - Include screenshots for UI changes

### Pull Request Template
```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here.

## Checklist
- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Environment Information**
   - Operating System
   - Node.js version
   - Browser (if frontend issue)
   - Ableton Live version (if VST issue)

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected behavior
   - Actual behavior

3. **Additional Context**
   - Error messages
   - Console logs
   - Screenshots
   - Project files (if applicable)

## 💡 Feature Requests

For feature requests, please provide:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives Considered**: Other solutions you've thought of
4. **Use Cases**: When would this be useful?

## 🧪 Testing Guidelines

### Frontend Testing
- Write unit tests for utilities and hooks
- Write integration tests for components
- Use React Testing Library for component tests
- Test user interactions and edge cases

### Backend Testing
- Test all API endpoints
- Test error conditions
- Test database operations
- Test socket.io events

### VST Plugin Testing
- Test on multiple operating systems
- Test with different Ableton Live versions
- Test authentication flow
- Test project upload functionality

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions
- Update API documentation for backend changes
- Add code comments for complex logic

## 🔒 Security Guidelines

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Report security vulnerabilities privately

## 📞 Getting Help

- **Discord**: [ColDaw Community](https://discord.gg/coldaw)
- **GitHub Discussions**: [Project Discussions](https://github.com/yifandeng2002/ColDaw_lab/discussions)
- **Email**: [dev@coldaw.com](mailto:dev@coldaw.com)

## 📜 Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributors page on the website

Thank you for contributing to ColDaw! 🎵