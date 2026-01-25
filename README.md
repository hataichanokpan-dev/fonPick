# fonPick

> Intelligent Thai Stock Market (SET) Analysis Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0-orange)](https://firebase.google.com/)

## Overview

fonPick is a comprehensive market analysis platform for the Thai Stock Exchange (SET). It combines multiple analysis services to provide actionable investment insights, sector rotation detection, smart money flow tracking, and correlation analysis.

### Key Features

- **Market Breadth Analysis**: Advance/decline ratios, volatility assessment
- **Sector Rotation Detection**: Identify leading/lagging sectors and rotation patterns
- **Smart Money Tracking**: Foreign and institutional investor flow analysis
- **Correlation Analysis**: Compare rankings performance with sector performance
- **Actionable Insights**: Trading recommendations with 6-question investment framework
- **Health Monitoring**: System health and data availability monitoring
- **Data Export**: Export insights in JSON, CSV, Markdown, and TXT formats

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase project with Realtime Database

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/fonPick.git
cd fonPick

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure Firebase credentials in .env.local
```

### Environment Variables

Create `.env.local` with your Firebase credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Project Structure

```
fonPick/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API endpoints
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── search/             # Search page
│   │   └── stock/[symbol]/     # Stock details page
│   │
│   ├── components/             # React components
│   │   ├── home/               # Home page components
│   │   ├── stock/              # Stock page components
│   │   └── shared/             # Shared components
│   │
│   ├── services/               # Business logic services
│   │   ├── market-breadth/     # Market breadth analysis
│   │   ├── sector-rotation/    # Sector rotation analysis
│   │   ├── smart-money/        # Smart money analysis
│   │   ├── correlations/       # Correlation analysis
│   │   ├── insights/           # Insights generation
│   │   ├── integration/        # Service orchestration
│   │   ├── health-check.ts     # Health monitoring
│   │   └── export/             # Data export utilities
│   │
│   ├── lib/                    # Library code
│   │   ├── api-cache.ts        # API caching
│   │   ├── design/             # Design system
│   │   ├── firebase/           # Firebase configuration
│   │   ├── rtdb/               # RTDB client
│   │   └── yahoo-finance/      # Yahoo Finance integration
│   │
│   └── types/                  # TypeScript types
│       ├── market.ts
│       ├── stock.ts
│       ├── market-breadth.ts
│       ├── sector-rotation.ts
│       ├── smart-money.ts
│       ├── insights.ts
│       └── correlation.ts
│
├── docs/                       # Documentation
│   ├── api-documentation.md    # API endpoints
│   ├── services-architecture.md# Architecture
│   └── system-design.md        # System design
│
└── tests/                      # Test files
```

---

## API Documentation

fonPick provides a comprehensive REST API for market analysis.

### Base URL

```
https://your-domain.com/api
```

### Main Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/analysis` | Complete market analysis (combines all services) |
| `GET /api/insights` | Actionable insights with trading recommendations |
| `GET /api/market-breadth` | Market breadth analysis |
| `GET /api/sector-rotation` | Sector rotation analysis |
| `GET /api/smart-money` | Smart money flow analysis |
| `GET /api/correlations` | Rankings vs sector correlation |
| `GET /api/health` | System health check |
| `GET /api/export` | Export data in various formats |

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
```

For complete API documentation, see [docs/api-documentation.md](docs/api-documentation.md).

---

## Services Architecture

### Core Services

1. **Market Breadth Service** (`src/services/market-breadth/`)
   - Analyzes advance/decline ratios
   - Measures volatility
   - Detects market trends

2. **Sector Rotation Service** (`src/services/sector-rotation/`)
   - Identifies leading and lagging sectors
   - Detects rotation patterns
   - Provides sector entry/exit signals

3. **Smart Money Service** (`src/services/smart-money/`)
   - Tracks foreign investor flows
   - Monitors institutional activity
   - Detects risk-on/off signals

4. **Correlations Service** (`src/services/correlations/`)
   - Analyzes rankings vs sector performance
   - Detects anomalies
   - Measures concentration impact

5. **Insights Service** (`src/services/insights/`)
   - Generates actionable insights
   - Answers 6 investment questions
   - Provides trading recommendations

### Integration Layer

The **Combined Analysis Service** (`src/services/integration/`) orchestrates all services and provides a complete market picture in a single API call.

For detailed architecture documentation, see [docs/services-architecture.md](docs/services-architecture.md).

---

## The 6 Investment Questions

fonPick answers these 6 key investment questions:

1. **How about market now?** (Market Breadth)
   - Current market status, volatility, trend direction

2. **What sector is heavy market up or down?** (Sector Rotation)
   - Leading and lagging sectors
   - Rotation pattern detection

3. **Risk on because Foreign Investor is strong buy or Prop reduce sell vol?** (Smart Money)
   - Risk-on/off detection
   - Primary market drivers

4. **What sector or stock should I focus/trade?** (Trading Focus)
   - Sector-specific recommendations
   - Top trading ideas

5. **Top rankings heavy sector market impact?** (Rankings Impact)
   - Concentration analysis
   - Market driver identification

6. **Compare rankings vs sector performance?** (Correlation)
   - Alignment detection
   - Anomaly identification

---

## Development Guidelines

### Coding Style

- **Immutability**: Always create new objects, never mutate
- **Small Files**: Keep files under 400 lines (800 max)
- **Error Handling**: Always handle errors comprehensively
- **Input Validation**: Use Zod for runtime validation
- **No console.log**: Use proper logging in production

### Type Safety

- All code is written in TypeScript
- Strict mode enabled
- No `any` types allowed
- Zod schemas for runtime validation

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check
```

### Git Workflow

- Feature branches: `feat/feature-name`
- Fix branches: `fix/issue-name`
- Commit format: `type: description`
- Types: feat, fix, refactor, docs, test, chore

---

## Firebase Setup

### Security Rules

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "marketOverview": {
      ".indexOn": ["timestamp"]
    },
    "industrySector": {
      ".indexOn": ["timestamp"]
    },
    "investorType": {
      ".indexOn": ["timestamp"]
    },
    "topRankings": {
      ".indexOn": ["timestamp"]
    }
  }
}
```

### Database Structure

```
fonPick-rtdb/
├── marketOverview/{YYYY-MM-DD}/
├── industrySector/{YYYY-MM-DD}/
├── investorType/{YYYY-MM-DD}/
└── topRankings/{YYYY-MM-DD}/
```

---

## Performance

### Caching Strategy

- Standard analysis: 60s cache, 120s SWR
- Health check: No cache
- Export: 300s cache, 600s SWR

### Optimization Techniques

- Parallel data fetching
- Response caching with CDN
- Code splitting and lazy loading
- Tree shaking for unused code

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

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

### Environment Variables

Make sure to set all required environment variables in your hosting platform.

---

## Documentation

- [API Documentation](docs/api-documentation.md) - Complete API reference
- [Services Architecture](docs/services-architecture.md) - System architecture
- [System Design](docs/system-design.md) - Design decisions

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Support

For issues and questions:
- GitHub Issues: [github.com/your-org/fonPick/issues](https://github.com/your-org/fonPick/issues)
- Documentation: [docs/](docs/)

---

## Roadmap

### Completed (Phase 1-5)
- [x] Frontend foundation
- [x] Market breadth service
- [x] Sector rotation service
- [x] Smart money service
- [x] Correlations service
- [x] Insights generation
- [x] API endpoints
- [x] Health monitoring
- [x] Export functionality
- [x] Documentation

### Future Enhancements
- [ ] WebSocket support for real-time updates
- [ ] User authentication
- [ ] Advanced charting
- [ ] Historical trend analysis
- [ ] Backtesting framework
- [ ] Alert system
- [ ] Mobile app (React Native)

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Data visualization
- [lucide-react](https://lucide.dev/) - Icons
