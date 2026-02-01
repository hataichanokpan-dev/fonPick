<div align="center">

# Contributing to fonPick

**Thank you for your interest in contributing!** 🎉

We welcome contributions from everyone. This document provides guidelines and instructions for contributing to fonPick.

[![Contributors](https://img.shields.io/github/contributors/your-org/fonPick?style=for-the-badge)](https://github.com/your-org/fonPick/graphs/contributors)
[![Good First Issues](https://img.shields.io/github/issues/your-org/fonPick/good%20first%20issue?style=for-the-badge)](https://github.com/your-org/fonPick/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

</div>

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

---

## 🤝 Code of Conduct

Be respectful, inclusive, and collaborative. We expect all contributors to:

- Treat everyone with respect
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Be patient and understanding

---

## 🚀 Getting Started

### Ways to Contribute

| Type | Description | Difficulty |
|------|-------------|------------|
| **Bug Reports** | Report issues you find | Beginner |
| **Feature Requests** | Suggest new features | Beginner |
| **Documentation** | Improve docs and guides | Beginner |
| **Bug Fixes** | Fix reported issues | Intermediate |
| **New Features** | Implement new functionality | Advanced |
| **Refactoring** | Improve code quality | Intermediate |
| **Tests** | Write or improve tests | Intermediate |

### Find Something to Work On

- [Good First Issues](https://github.com/your-org/fonPick/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
- [Help Wanted](https://github.com/your-org/fonPick/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)
- [Roadmap](README.md#roadmap)

---

## 💻 Development Setup

### Prerequisites

```bash
# Check versions
node --version  # v18+
npm --version   # v9+
git --version   # v2.20+
```

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/fonPick.git
cd fonPick

# 3. Add upstream remote
git remote add upstream https://github.com/your-org/fonPick.git

# 4. Install dependencies
npm install

# 5. Copy environment template
cp .env.example .env.local

# 6. Configure your Firebase credentials in .env.local
```

### Branch Naming

Use these prefixes for branch names:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/sector-rotation` |
| `fix/` | Bug fix | `fix/memory-leak` |
| `docs/` | Documentation | `docs/api-update` |
| `refactor/` | Code refactoring | `refactor/cache-layer` |
| `test/` | Test improvements | `test/market-breadth` |
| `chore/` | Maintenance tasks | `chore/update-deps` |

```bash
# Create a new branch
git checkout -b feat/your-feature-name
```

---

## 📐 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ GOOD: Explicit types
function calculateReturn(principal: number, rate: number, years: number): number {
  return principal * Math.pow(1 + rate, years)
}

// ❌ BAD: Implicit any
function calculateReturn(principal, rate, years) {
  return principal * Math.pow(1 + rate, years)
}
```

### Immutability

```typescript
// ✅ GOOD: Immutable pattern
function updateStock(stock: Stock, price: number): Stock {
  return { ...stock, price, lastUpdate: Date.now() }
}

// ❌ BAD: Mutation
function updateStock(stock: Stock, price: number): Stock {
  stock.price = price  // Mutation!
  return stock
}
```

### File Organization

```
service/
├── index.ts          # Main export, public API
├── types.ts          # Type definitions
├── utils.ts          # Helper functions
├── constants.ts      # Constants
└── tests/            # Test files
    ├── index.test.ts
    └── utils.test.ts
```

### Error Handling

```typescript
// ✅ GOOD: Comprehensive error handling
export async function getMarketData(date: string): Promise<MarketData> {
  try {
    const data = await fetchMarketData(date)
    if (!data) {
      throw new Error(`No market data found for date: ${date}`)
    }
    return data
  } catch (error) {
    console.error('Failed to fetch market data:', error)
    throw new Error(`Market data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ❌ BAD: Silent failures
export async function getMarketData(date: string): Promise<MarketData> {
  try {
    return await fetchMarketData(date)
  } catch (error) {
    return {} as MarketData  // Silent failure!
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MarketBreadthCard.tsx` |
| Functions | camelCase | `calculateMarketBreadth()` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_CACHE_TTL` |
| Types/Interfaces | PascalCase | `MarketBreadthResult` |
| Files | kebab-case | `market-breadth-service.ts` |

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

### Examples

```bash
# Good commit messages
git commit -m "feat(market-breadth): add volatility calculation"
git commit -m "fix(smart-money): resolve null reference error"
git commit -m "docs: update API documentation for /analysis endpoint"
git commit -m "refactor(cache): improve cache key generation"
```

```bash
# Bad commit messages
git commit -m "update"
git commit -m "fix bugs"
git commit -m "wip"
```

### Commit Body

For significant changes, add a body:

```bash
git commit -m "feat(sector-rotation): add rotation signal detection

- Implement leading/lagging sector detection
- Add rotation pattern analysis
- Generate entry/exit signals
- Add unit tests for new functionality

Closes #123"
```

---

## 🔄 Pull Request Process

### Before Opening a PR

- [ ] Code follows [coding standards](#coding-standards)
- [ ] Tests pass: `npm test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] New features have tests (80%+ coverage)
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines

### Opening a PR

```bash
# 1. Ensure your branch is up to date
git fetch upstream
git rebase upstream/main

# 2. Push to your fork
git push origin feat/your-feature

# 3. Open PR on GitHub
# Use the PR template and fill in all sections
```

### PR Title Format

Same as commit messages:

```
feat(scope): description
fix(scope): description
docs: description
```

### PR Description Template

```markdown
## Summary
<!-- Brief description of changes -->

## Changes
- [ ] Feature 1
- [ ] Feature 2
- [ ] Bug fix 1

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Tests pass locally
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented below)

## Breaking Changes
<!-- Describe any breaking changes -->

## Related Issues
Closes #123, Related to #456
```

### Review Process

1. **Automated Checks** - CI must pass
2. **Code Review** - At least one maintainer approval
3. **Feedback** - Address all review comments
4. **Squash & Merge** - Maintainers will squash commits

---

## 🧪 Testing Guidelines

### Test Structure

```typescript
// tests/unit/services/market-breadth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { calculateMarketBreadth } from '@/services/market-breadth'

describe('Market Breadth Service', () => {
  const mockMarketData = {
    // ...
  }

  beforeEach(() => {
    // Setup before each test
  })

  describe('calculateMarketBreadth', () => {
    it('should calculate advance/decline ratio', () => {
      const result = calculateMarketBreadth(mockMarketData)
      expect(result.advDeclRatio).toBeGreaterThan(0)
    })

    it('should handle empty data gracefully', () => {
      const result = calculateMarketBreadth({})
      expect(result).toBeDefined()
    })

    it('should throw error for invalid input', () => {
      expect(() => calculateMarketBreadth(null)).toThrow()
    })
  })
})
```

### Testing Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- market-breadth.test.ts

# Watch mode during development
npm test -- --watch

# Run only tests matching pattern
npm test -- --grep "volatility"
```

### Coverage Targets

| Area | Target |
|------|--------|
| Services | 90%+ |
| Utilities | 95%+ |
| Components | 80%+ |
| Overall | 80%+ |

---

## 📚 Documentation

### Code Comments

```typescript
/**
 * Calculates the advance/decline ratio for the market
 *
 * @param data - Market overview data containing advance/decline counts
 * @returns The advance/decline ratio as a decimal (e.g., 1.5 for 1.5:1)
 * @throws {Error} When data is null or undefined
 *
 * @example
 * ```typescript
 * const ratio = calculateAdvDeclRatio({ advances: 150, declines: 100 })
 * // Returns 1.5
 * ```
 */
export function calculateAdvDeclRatio(data: MarketOverview): number {
  // ...
}
```

### Updating Documentation

When adding features:

1. **Update README.md** - Add to features list
2. **Update API docs** - Add endpoint documentation
3. **Add examples** - Provide usage examples
4. **Update types** - Add TypeScript types

---

## 🐛 Reporting Issues

### Before Reporting

1. **Search existing issues** - Avoid duplicates
2. **Check documentation** - It might be documented
3. **Try latest version** - Issue might be fixed

### Issue Template

```markdown
## Description
<!-- Clear description of the issue -->

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

## Expected Behavior
<!-- What should happen -->

## Actual Behavior
<!-- What actually happens -->

## Screenshots
<!-- If applicable -->

## Environment
- OS: [e.g. Windows 11, macOS 14]
- Browser: [e.g. Chrome 120, Safari 17]
- Node.js: [e.g. v20.10.0]
- fonPick version: [e.g. v0.1.0]

## Additional Context
<!-- Logs, stack traces, related issues -->
```

---

## 🎨 Design Guidelines

### Component Design

```typescript
// ✅ GOOD: Small, focused components
function MarketBreadthCard({ data }: { data: MarketBreadth }) {
  return (
    <Card>
      <Metric value={data.advDeclRatio} label="A/D Ratio" />
      <TrendIndicator value={data.trend} />
    </Card>
  )
}

// ❌ BAD: Large, multi-purpose component
function DashboardCard({ type, data, config, options, ... }) {
  // 500+ lines of code...
}
```

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers

---

## 📧 Getting Help

### Communication Channels

| Channel | Purpose |
|---------|---------|
| [GitHub Issues](https://github.com/your-org/fonPick/issues) | Bug reports, feature requests |
| [GitHub Discussions](https://github.com/your-org/fonPick/discussions) | Questions, ideas |
| [Discord](https://discord.gg/fonpick) | Real-time chat |

### Asking Questions

When asking questions:

1. **Be specific** - Describe what you're trying to do
2. **Show your work** - Share code you've tried
3. **Provide context** - Explain your environment
4. **Format code** - Use markdown code blocks

---

## 🌟 Recognition

Contributors are recognized in:

- [Contributors](README.md#acknowledgments) section
- [RELEASE NOTES](CHANGELOG.md) for each release
- [GitHub Contributors](https://github.com/your-org/fonPick/graphs/contributors) page

Thank you for contributing to fonPick! 🙏

---

<div align="center">

**Made with ❤️ by the fonPick community**

[Back to README](README.md)

</div>
