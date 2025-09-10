# 🤝 Contributing to Aintru

Thank you for your interest in contributing to Aintru! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project follows a code of conduct that we expect all contributors to adhere to:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone is learning and growing

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git
- MongoDB Atlas account (free)
- Basic knowledge of React, Node.js, and MongoDB

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/aintru.git
   cd aintru
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/aintru.git
   ```

## 🔧 Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

1. Copy the environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Configure your `.env` file with your API keys and database connection

3. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### 3. Verify Setup

- Backend should be running on http://localhost:3000
- Frontend should be running on http://localhost:5173
- Check http://localhost:3000/health for backend status

## 📝 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix existing issues
- **Feature additions**: Add new functionality
- **Documentation**: Improve or add documentation
- **UI/UX improvements**: Enhance the user interface
- **Performance optimizations**: Improve app performance
- **Testing**: Add or improve tests
- **Code refactoring**: Improve code quality

### Before You Start

1. **Check existing issues**: Look for existing issues or discussions
2. **Create an issue**: If you're adding a new feature, create an issue first
3. **Assign yourself**: Comment on the issue to let others know you're working on it
4. **Create a branch**: Create a new branch for your changes

### Branch Naming

Use descriptive branch names:

- `feature/add-dark-mode`
- `fix/resolve-login-bug`
- `docs/update-api-documentation`
- `refactor/improve-error-handling`

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards
- Add tests if applicable
- Update documentation if needed

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add dark mode toggle

- Add dark mode toggle in navigation
- Update theme context
- Add dark mode styles
- Update components to support dark mode"
```

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Fill out the PR template
4. Request review from maintainers

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Screenshots added (if UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested
```

## 🐛 Issue Reporting

### Before Creating an Issue

1. Check if the issue already exists
2. Search closed issues for similar problems
3. Try to reproduce the issue

### Issue Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js version: [e.g., 18.0.0]

## Additional Context
Any other context about the problem
```

## 📏 Coding Standards

### JavaScript/TypeScript

- Use meaningful variable and function names
- Add comments for complex logic
- Use const/let instead of var
- Use arrow functions when appropriate
- Follow ESLint rules

### React

- Use functional components with hooks
- Use TypeScript for type safety
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### CSS/TailwindCSS

- Use TailwindCSS utility classes
- Keep custom CSS minimal
- Use consistent spacing and colors
- Follow responsive design principles

### Backend

- Use async/await instead of callbacks
- Add proper error handling
- Use meaningful variable names
- Add input validation
- Follow REST API conventions

### File Organization

```
src/
├── components/          # Reusable components
│   ├── ui/             # Basic UI components
│   └── ...             # Feature-specific components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── stores/             # State management
├── types/              # TypeScript types
└── assets/             # Static assets
```

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm run test
```

### Backend Testing

```bash
cd backend
npm test
```

### Manual Testing

1. Test all user flows
2. Test responsive design
3. Test error handling
4. Test performance

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Keep README files updated
- Update API documentation

### Commit Messages

Use conventional commit format:

```
type(scope): description

feat(auth): add OAuth login
fix(ui): resolve button alignment issue
docs(api): update authentication endpoints
refactor(utils): improve error handling
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🎯 Development Workflow

### 1. Daily Workflow

```bash
# Start your day
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

### 2. Keeping Up to Date

```bash
# Fetch latest changes
git fetch upstream

# Merge into your branch
git checkout feature/your-feature
git merge upstream/main
```

### 3. Resolving Conflicts

```bash
# If conflicts occur
git status
# Edit conflicted files
git add .
git commit -m "resolve merge conflicts"
```

## 🏷️ Release Process

### Versioning

We use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Release notes written

## 🤔 Getting Help

### Resources

- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Community

- GitHub Discussions
- Discord Server (if available)
- Stack Overflow (tag: aintru)

### Questions

If you have questions:

1. Check existing issues and discussions
2. Search documentation
3. Ask in GitHub Discussions
4. Create a new issue with the "question" label

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing to Aintru, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Aintru! 🚀**

For any questions or concerns, please don't hesitate to reach out to the maintainers.
