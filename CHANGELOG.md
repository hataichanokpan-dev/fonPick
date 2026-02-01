# Changelog

All notable changes to fonPick will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- WebSocket support for real-time updates
- User authentication system
- Custom watchlists
- Alert system
- Mobile app (React Native)
- Portfolio tracking
- Machine learning predictions

---

## [0.1.0] - 2025-01-XX

### Added

#### Core Features
- **Market Breadth Analysis**
  - Advance/Decline ratio calculation
  - Volatility assessment (Low/Medium/High)
  - Market trend detection (Bullish/Bearish/Neutral)
  - Real-time market status banner

- **Sector Rotation Detection**
  - Leading/Lagging sector identification
  - Rotation pattern analysis
  - Entry/Exit signal generation
  - Sector strength visualization

- **Smart Money Tracking**
  - Foreign investor flow analysis
  - Institutional activity monitoring
  - Risk-on/Risk-off signal detection
  - Primary market driver identification

- **Correlation Analysis**
  - Rankings vs Sector performance comparison
  - Anomaly detection alerts
  - Concentration impact measurement
  - Market driver attribution

- **Actionable Insights**
  - 6-Question Investment Framework
  - Trading recommendations with confidence levels
  - Sector-specific focus lists
  - Conflict detection between signals

#### Dashboard
- Real-time market status banner
- Smart money flow visualization
- Daily focus list
- Sector strength cards
- Market movers with tabbed interface
- Data insight cards for conflicts

#### API Endpoints
- `GET /api/analysis` - Complete market analysis
- `GET /api/insights` - Actionable insights
- `GET /api/market-breadth` - Market breadth data
- `GET /api/sector-rotation` - Sector rotation analysis
- `GET /api/smart-money` - Smart money flows
- `GET /api/correlations` - Rankings vs sector correlation
- `GET /api/health` - System health check
- `GET /api/export` - Data export (JSON/CSV/MD/TXT)

#### Technical
- Next.js 16 with App Router
- React 19 Server Components
- TypeScript 5.7 with strict mode
- Firebase Realtime Database integration
- Yahoo Finance API integration
- TanStack React Query for data fetching
- Strategic caching (60s-600s TTLs)
- Internationalization (Thai/English)
- PWA capabilities with service worker
- Responsive design with mobile bottom navigation

#### Testing
- Vitest testing framework setup
- Testing Library integration
- Unit test structure
- Test coverage reporting

#### Documentation
- Comprehensive README.md
- API documentation
- Development guidelines
- Contributing guidelines

### Performance
- Single data source architecture (50-100% memory reduction)
- Context-based data fetching
- Parallel service execution
- Multi-tier cache strategy
- Memory safety with singleton patterns

### Security
- Firebase security rules
- Input validation with Zod
- Environment-based configuration
- No hardcoded secrets

---

## [0.0.1] - 2024-XX-XX

### Added
- Initial project setup
- Next.js 16 foundation
- Firebase configuration
- Basic project structure
- Development environment setup

---

## Version Summary

| Version | Date | Status | Key Features |
|---------|------|--------|--------------|
| 0.1.0 | 2025-01-XX | Latest | All analysis services, dashboard, API |
| 0.0.1 | 2024-XX-XX | Initial | Project setup |

---

## Release Notes Format

Each release includes:

### Added
- New features
- New endpoints
- New components

### Changed
- Changes in existing functionality
- Performance improvements

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security vulnerability fixes

---

## Upcoming Releases

### v0.2.0 (Q2 2025)
- Historical trend analysis
- Advanced charting library
- Backtesting framework

### v0.3.0 (Q3 2025)
- WebSocket support
- User authentication
- Custom watchlists

### v1.0.0 (Q4 2025)
- Mobile app release
- Portfolio tracking
- ML predictions

---

<div align="center">

**For more details, visit [GitHub Releases](https://github.com/your-org/fonPick/releases)**

</div>
