<div align="center">

  <!-- Project Logo -->
  <img src="/docs/assets/logo.png" alt="fonPick Logo" width="120" height="120" style="border-radius: 24px;">

  <!-- Project Title with Badges -->
  # <a href="https://fonpick.vercel.app" target="_blank">fonPick</a>

  ### Intelligent Thai Stock Market (SET) Analysis Platform

  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-11.0-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

  [![Test Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen?style=flat-square)](./src/test)
  [![Code Quality](https://img.shields.io/badge/Code_Quality-A-brightgreen?style=flat-square)](./.claude/rules)

  <!-- Live Demo & Status Badges -->
  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-View-purple?style=for-the-badge)](https://fonpick.vercel.app)
  [![GitHub Stars](https://img.shields.io/github/stars/your-org/fonPick?style=for-the-badge)](https://github.com/your-org/fonPick)
  [![GitHub Issues](https://img.shields.io/github/issues/your-org/fonPick?style=for-the-badge)](https://github.com/your-org/fonPick/issues)

  <!-- Short Description -->
  **Advanced market intelligence platform for SET investors** featuring multi-layered analysis, smart money tracking, sector rotation detection, and AI-powered insights.

  [Documentation](./docs) | [API Reference](./docs/api-documentation.md) | [Contributing](#contributing) | [Changelog](./CHANGELOG.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

[fonPick](https://fonpick.vercel.app) is a comprehensive **market intelligence platform** specifically designed for the **Thai Stock Exchange (SET)**. It combines advanced analytics, real-time data processing, and intelligent insights to help investors make faster, more informed stock selection decisions.

### Why fonPick?

- **Real-time Analysis**: Process SET market data with sub-second response times
- **Multi-Layered Insights**: 5 analysis services working together
- **Professional Grade**: Used by individual investors, day traders, and portfolio managers
- **Open Source**: Transparent, community-driven development

### Target Users

| User Type | Use Case |
|-----------|----------|
| **Individual Investors** | Daily market overview and stock screening |
| **Day Traders** | Real-time sector rotation and smart money signals |
| **Portfolio Managers** | Sector allocation and risk assessment |
| **Analysts** | Market breadth and correlation analysis |
| **New Investors** | Educational insights with clear explanations |

---

## ✨ Features

### Core Analysis Services

<div align="center">
  <img src="/docs/assets/features-overview.png" alt="Features Overview" width="800">
</div>

#### 📊 Market Breadth Analysis
- Advance/Decline ratio tracking
- Volatility assessment (Low/Medium/High)
- Market trend detection (Bullish/Bearish/Neutral)
- Real-time market status banner

#### 🔄 Sector Rotation Detection
- Leading/Lagging sector identification
- Rotation pattern analysis
- Entry/Exit signal generation
- Sector strength visualization

#### 💰 Smart Money Tracking
- Foreign investor flow analysis
- Institutional activity monitoring
- Risk-on/Risk-off signal detection
- Primary market driver identification

#### 📈 Correlation Analysis
- Rankings vs Sector performance comparison
- Anomaly detection alerts
- Concentration impact measurement
- Market driver attribution

#### 🧠 Actionable Insights
- **6-Question Investment Framework** for systematic analysis
- Trading recommendations with confidence levels
- Sector-specific focus lists
- Conflict detection between signals

### Dashboard Features

- **Real-time Market Status Banner** - Live market regime indicator
- **Smart Money Flow Visualization** - Interactive flow charts
- **Daily Focus List** - Top trading opportunities
- **Sector Strength Cards** - Quick sector overview
- **Market Movers** - Tabbed interface (Gainers/Losers/Volume)
- **Data Insight Cards** - Conflict alerts and recommendations

### Technical Features

| Feature | Description |
|---------|-------------|
| **Export System** | JSON, CSV, Markdown, TXT formats |
| **Health Monitoring** | System status and data availability |
| **Performance Optimization** | Strategic caching (60s-600s TTLs) |
| **Responsive Design** | Mobile-first with bottom navigation |
| **Internationalization** | Thai/English support |
| **Offline Support** | Service worker for PWA capabilities |

---

## 🛠 Tech Stack

### Frontend

<div align="center">

  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

- **Next.js 16** - App Router with React 19
- **TypeScript 5.7** - Strict type checking
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Selective animations
- **next-intl** - i18n (Thai/English)
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend & Data

<div align="center">

  [![Firebase](https://img.shields.io/badge/Firebase-11.0-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
  [![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90-FF4154?style=flat-square)](https://tanstack.com/query)

</div>

- **Firebase Realtime Database** - Real-time data storage
- **Yahoo Finance API** - Market data source
- **TanStack React Query** - Data fetching & caching
- **Custom Cache Layer** - Performance optimization

### Development

<div align="center">

  [![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
  [![ESLint](https://img.shields.io/badge/ESLint-9.17-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/)

</div>

- **Vitest** - Testing framework
- **Testing Library** - Component testing
- **ESLint** - Code quality
- **PostCSS** - CSS processing

---

## 🏗 Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                              fonPick Platform                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Next.js   │  │    React    │  │ TypeScript  │  │  Tailwind   │ │
│  │   App Router│  │   Server    │  │   Strict    │  │     CSS     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    API Layer (/api/*)                          │  │
│  │  /analysis  /insights  /market-breadth  /sector-rotation       │  │
│  │  /smart-money  /correlations  /health  /export                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Services Layer                              │  │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │  │
│  │  │   Market  │ │  Sector   │ │   Smart   │ │    Corr   │       │  │
│  │  │  Breadth  │ │  Rotation │ │   Money   │ │ elation   │       │  │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │  │
│  │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │  │              Integration Service (Orchestrator)          │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Data Layer                                  │  │
│  │  ┌──────────────┐              ┌──────────────┐               │  │
│  │  │   Firebase   │              │   Yahoo      │               │  │
│  │  │     RTDB     │ ◄────────────►   Finance    │               │  │
│  │  │              │              │     API      │               │  │
│  │  └──────────────┘              └──────────────┘               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Single Data Source Architecture** - 50-100% memory reduction
2. **Context-Based Data Fetching** - No server-client duplication
3. **Parallel Processing** - Concurrent service execution
4. **Strategic Caching** - Multi-tier cache strategy
5. **Memory Safety** - Singleton patterns, cleanup timers

### Database Structure

```
fonPick-rtdb/
├── marketOverview/{YYYY-MM-DD}/      # Daily market summary
├── industrySector/{YYYY-MM-DD}/      # Sector performance data
├── investorType/{YYYY-MM-DD}/        # Investor flow data
└── topRankings/{YYYY-MM-DD}/         # Top ranked stocks
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **pnpm**
- **Firebase** project with Realtime Database
- **Git** for cloning

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/fonPick.git
cd fonPick

# Install dependencies
npm install
# or
pnpm install

# Copy environment template
cp .env.example .env.local

# Configure your Firebase credentials (see below)
```

### Environment Variables

Create `.env.local` with your Firebase credentials:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Yahoo Finance API (if using proxy)
YAHOO_FINANCE_API_URL=https://your-proxy.com
```

> 💡 **Tip**: Get your Firebase credentials from [Firebase Console](https://console.firebase.google.com/)

### Development

```bash
# Start development server (with Turbopack for faster builds)
npm run dev

# Open http://localhost:3000
```

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use Vercel CLI (recommended)
vercel
```

---

## 📁 Project Structure

```
fonPick/
├── .claude/                      # Claude AI agent configurations
│   ├── agents/                   # Agent definitions
│   └── rules/                    # Project rules & guidelines
│
├── docs/                         # Documentation
│   ├── api-documentation.md      # API reference
│   ├── services-architecture.md  # Architecture docs
│   └── system-design.md          # Design decisions
│
├── public/                       # Static assets
│   └── locales/                  # i18n translation files
│       ├── en/
│       └── th/
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/             # Localized routes
│   │   │   ├── page.tsx          # Dashboard homepage
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── search/           # Search functionality
│   │   │   └── stock/            # Stock detail pages
│   │   └── api/                  # API endpoints
│   │       ├── analysis/         # Combined analysis
│   │       ├── insights/         # Actionable insights
│   │       ├── market-breadth/   # Market breadth
│   │       ├── sector-rotation/  # Sector rotation
│   │       ├── smart-money/      # Smart money flow
│   │       ├── correlations/     # Correlation analysis
│   │       ├── health/           # Health check
│   │       └── export/           # Data export
│   │
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard widgets
│   │   ├── home/                 # Homepage components
│   │   ├── stock/                # Stock page components
│   │   ├── shared/               # Reusable components
│   │   └── layout/               # Layout components
│   │
│   ├── services/                 # Business logic layer
│   │   ├── market-breadth/       # Market breadth analysis
│   │   │   ├── index.ts          # Main service
│   │   │   ├── types.ts          # Type definitions
│   │   │   └── utils.ts          # Helper functions
│   │   ├── sector-rotation/      # Sector rotation detection
│   │   ├── smart-money/          # Investor flow analysis
│   │   ├── correlations/         # Rankings vs sector analysis
│   │   ├── insights/             # Insights generation
│   │   ├── integration/          # Service orchestration
│   │   ├── health-check.ts       # System monitoring
│   │   └── export/               # Data export utilities
│   │
│   ├── lib/                      # Shared utilities
│   │   ├── api-cache.ts          # API caching layer
│   │   ├── design/               # Design system
│   │   │   ├── colors.ts         # Color palette
│   │   │   └── typography.ts     # Typography scale
│   │   ├── firebase/             # Firebase configuration
│   │   ├── rtdb/                 # RTDB client helpers
│   │   └── yahoo-finance/        # Yahoo Finance integration
│   │
│   └── types/                    # TypeScript types
│       ├── market.ts             # Market data types
│       ├── stock.ts              # Stock data types
│       └── analysis.ts           # Analysis result types
│
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest configuration
├── package.json                  # Dependencies & scripts
├── firebase.json                 # Firebase configuration
└── README.md                     # This file
```

---

## 📚 API Documentation

fonPick provides a comprehensive REST API for market analysis.

### Base URL

```
https://your-domain.com/api
```

### Main Endpoints

| Endpoint | Method | Description | Cache |
|----------|--------|-------------|-------|
| `/api/analysis` | GET | Complete market analysis | 60s |
| `/api/insights` | GET | Actionable insights | 60s |
| `/api/market-breadth` | GET | Market breadth data | 60s |
| `/api/sector-rotation` | GET | Sector rotation analysis | 60s |
| `/api/smart-money` | GET | Smart money flows | 60s |
| `/api/correlations` | GET | Rankings vs sector correlation | 60s |
| `/api/health` | GET | System health check | None |
| `/api/export` | GET | Export data (JSON/CSV/MD/TXT) | 300s |

### Quick Examples

```bash
# Get complete market analysis
curl https://your-domain.com/api/analysis

# Get quick snapshot
curl https://your-domain.com/api/analysis?type=snapshot

# Get health status
curl https://your-domain.com/api/health

# Export insights as markdown
curl https://your-domain.com/api/export?format=markdown

# Get specific date data
curl https://your-domain.com/api/analysis?date=2024-01-15
```

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    timestamp: string
    cached: boolean
    version: string
  }
}
```

<div align="right">

  [View Full API Documentation](./docs/api-documentation.md) →

</div>

---

## 💻 Development

### Coding Standards

fonPick follows strict coding standards to maintain code quality:

```typescript
// ✅ GOOD: Immutable pattern
function updateUser(user: User, name: string): User {
  return { ...user, name }
}

// ❌ BAD: Mutation
function updateUser(user: User, name: string): User {
  user.name = name  // Mutation!
  return user
}
```

#### Key Principles

| Principle | Description |
|-----------|-------------|
| **Immutability** | Never mutate objects/arrays |
| **Small Files** | Keep files under 400 lines (800 max) |
| **Error Handling** | Always handle errors comprehensively |
| **Input Validation** | Use Zod for runtime validation |
| **No console.log** | Use proper logging in production |

### Type Safety

- All code written in **TypeScript** with strict mode
- No `any` types allowed
- **Zod schemas** for runtime validation
- Comprehensive type definitions in [`src/types/`](src/types/)

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- market-breadth.test.ts

# Watch mode
npm test -- --watch
```

**Coverage Target**: 80%+

### Git Workflow

```bash
# Feature branches
git checkout -b feat/feature-name
git checkout -b fix/issue-name

# Commit format
git commit -m "feat: add sector rotation analysis"
git commit -m "fix: resolve memory leak in context"
git commit -m "docs: update API documentation"

# Commit types: feat, fix, refactor, docs, test, chore, perf, ci
```

<div align="right">

  [View Development Guidelines](./.claude/rules/coding-style.md) →

</div>

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/fonPick)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t fonpick .
docker run -p 3000:3000 fonpick
```

### Environment Variables

Make sure to set these in your hosting platform:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### Firebase Deployment

```bash
# Deploy database rules
npm run firebase:deploy

# Or using Firebase CLI
firebase deploy --only database:rules
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/fonPick.git
cd fonPick

# Install dependencies
npm install

# Create feature branch
git checkout -b feat/your-feature-name

# Make changes and test
npm run type-check
npm run lint
npm test

# Commit and push
git add .
git commit -m "feat: description"
git push origin feat/your-feature-name
```

### Pull Request Guidelines

- [ ] Tests pass locally (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code follows project standards
- [ ] Documentation is updated
- [ ] Commit messages follow convention

### Code Review Process

1. Automated checks must pass
2. At least one maintainer approval
3. All feedback addressed
4. Squash and merge when approved

<div align="right">

  [View Contributing Guidelines](./CONTRIBUTING.md) →

</div>

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 fonPick

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🆘 Support

### Getting Help

| Resource | Link |
|----------|------|
| **GitHub Issues** | [github.com/your-org/fonPick/issues](https://github.com/your-org/fonPick/issues) |
| **Discussions** | [github.com/your-org/fonPick/discussions](https://github.com/your-org/fonPick/discussions) |
| **Documentation** | [docs/](./docs/) |
| **API Reference** | [docs/api-documentation.md](./docs/api-documentation.md) |

### Reporting Bugs

When reporting bugs, please include:

- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment** (OS, browser, Node version)
- **Logs** (if available)

---

## 🗺 Roadmap

### ✅ Completed (Phase 1-6)

- [x] Frontend foundation with Next.js 16
- [x] Market breadth service
- [x] Sector rotation service
- [x] Smart money service
- [x] Correlations service
- [x] Insights generation
- [x] API endpoints
- [x] Health monitoring
- [x] Export functionality
- [x] Internationalization (Thai/English)
- [x] PWA capabilities

### 🚧 In Progress

- [ ] Historical trend analysis
- [ ] Advanced charting library
- [ ] Backtesting framework

### 📋 Planned

- [ ] WebSocket support for real-time updates
- [ ] User authentication
- [ ] Custom watchlists
- [ ] Alert system
- [ ] Mobile app (React Native)
- [ ] Portfolio tracking
- [ ] Machine learning predictions

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Data visualization
- [Lucide](https://lucide.dev/) - Icons
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Vitest](https://vitest.dev/) - Testing framework

### Data Sources

- [Yahoo Finance](https://finance.yahoo.com/) - Market data
- [Thai Stock Exchange](https://www.set.or.th/) - SET reference data

---

<div align="center">

  **Built with ❤️ for Thai Investors**

  [⬆ Back to Top](#fonpick)

  <sub>

  © 2025 fonPick. All rights reserved.

  [GitHub](https://github.com/your-org/fonPick) •
  [Twitter](https://twitter.com/fonpick) •
  [Website](https://fonpick.vercel.app)

  </sub>

</div>
