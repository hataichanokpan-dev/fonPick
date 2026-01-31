'use client'

/**
 * Stock Page Client Component
 *
 * Client-side component that fetches stock data from internal proxy APIs.
 *
 * APIs used:
 * - GET /api/stocks/{symbol}/overview - Basic stock information
 * - GET /api/stocks/{symbol}/statistics - Complete statistics
 *
 * Features:
 * - Uses useStockData hook for API data fetching
 * - Shows loading skeleton while fetching
 * - Displays error boundary on error
 * - Displays stock information with overview and statistics
 * - Professional card-based layout with proper visual hierarchy
 * - Bilingual support (Thai/English) via locale prop
 */

import { useStockData } from '@/hooks/useStockData'
import { StockPageSkeleton, StockPageErrorBoundary, WatchlistButton } from '@/components/stock'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { StockOverviewData, StockStatisticsData } from '@/types/stock-proxy-api'
import { TrendingUp, TrendingDown, Minus, Building2, Calendar, DollarSign, BarChart3, Activity } from 'lucide-react'

export interface StockPageClientProps {
  symbol: string
  locale: string
  children?: React.ReactNode
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format large numbers with suffixes (K, M, B)
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

/**
 * Get color classes and icon based on price change
 */
function getPriceChangeColor(change: number) {
  if (change > 0) {
    return {
      text: 'text-up-primary',
      bg: 'bg-up-soft',
      icon: <TrendingUp className="w-4 h-4" />,
    }
  }
  if (change < 0) {
    return {
      text: 'text-down-primary',
      bg: 'bg-down-soft',
      icon: <TrendingDown className="w-4 h-4" />,
    }
  }
  return {
    text: 'text-flat',
    bg: 'bg-surface-2',
    icon: <Minus className="w-4 h-4" />,
  }
}

/**
 * Calculate price change percentage from overview data
 */
function calculateChangePercent(data: StockOverviewData): number {
  if (!data.previousClose || data.previousClose === 0) return 0
  const change = data.price - data.previousClose
  return (change / data.previousClose) * 100
}

/**
 * Format currency value
 */
function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value
  if (isNaN(num)) return 'N/A'
  return formatLargeNumber(num)
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    overview: 'Overview',
    price: 'Price',
    marketCap: 'Market Cap',
    volume: 'Volume',
    valuationMetrics: 'Valuation Metrics',
    financialHealth: 'Financial Health',
    profitability: 'Profitability',
    dividendInfo: 'Dividend Info',
    keyDates: 'Key Dates',
    tradingInfo: 'Trading Info',
    peRatio: 'P/E Ratio',
    forwardPE: 'Forward P/E',
    eps: 'EPS',
    beta: 'Beta',
    week52High: '52W High',
    week52Low: '52W Low',
    earnings: 'Earnings',
    exDividend: 'Ex-Dividend',
    psRatio: 'P/S',
    pbRatio: 'P/B',
    evEbitda: 'EV/EBITDA',
    pegRatio: 'PEG Ratio',
    currentRatio: 'Current Ratio',
    quickRatio: 'Quick Ratio',
    debtEquity: 'Debt/Equity',
    interestCoverage: 'Interest Coverage',
    roe: 'ROE',
    roa: 'ROA',
    roic: 'ROIC',
    profitMargin: 'Profit Margin',
    dividendYield: 'Dividend Yield',
    payoutRatio: 'Payout Ratio',
    dividendGrowth: 'Dividend Growth',
    fcfYield: 'FCF Yield',
    ttm: 'TTM',
    thb: 'THB',
    shares: 'Shares',
  },
  th: {
    overview: 'ภาพรวม',
    price: 'ราคา',
    marketCap: 'มูลค่าตลาด',
    volume: 'ปริมาณซื้อขาย',
    valuationMetrics: 'อัตราส่วนการประเมินมูลค่า',
    financialHealth: 'สุขภาพทางการเงิน',
    profitability: 'ความสามารถในการทำกำไร',
    dividendInfo: 'ข้อมูลปันผล',
    keyDates: 'วันที่สำคัญ',
    tradingInfo: 'ข้อมูลการซื้อขาย',
    peRatio: 'P/E Ratio',
    forwardPE: 'Forward P/E',
    eps: 'EPS',
    beta: 'Beta',
    week52High: '52W สูงสุด',
    week52Low: '52W ต่ำสุด',
    earnings: 'วันรายงานผลประกอบการ',
    exDividend: 'วันที่ไม่ได้รับปันผล',
    psRatio: 'P/S',
    pbRatio: 'P/B',
    evEbitda: 'EV/EBITDA',
    pegRatio: 'PEG Ratio',
    currentRatio: 'Current Ratio',
    quickRatio: 'Quick Ratio',
    debtEquity: 'Debt/Equity',
    interestCoverage: 'Interest Coverage',
    roe: 'ROE',
    roa: 'ROA',
    roic: 'ROIC',
    profitMargin: 'Profit Margin',
    dividendYield: 'Dividend Yield',
    payoutRatio: 'Payout Ratio',
    dividendGrowth: 'Dividend Growth',
    fcfYield: 'FCF Yield',
    ttm: 'TTM',
    thb: 'บาท',
    shares: 'หุ้น',
  },
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Metric card component for displaying individual metrics
 */
function MetricCard({
  label,
  value,
  unit,
  colorClass = 'text-text-primary',
}: {
  label: string
  value: string | number
  unit?: string
  colorClass?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-text-2 mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-sm font-semibold font-mono tabular-nums ${colorClass}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-text-2">{unit}</span>}
      </div>
    </div>
  )
}

/**
 * Stock header with name, symbol, and price
 */
function StockHeader({
  symbol,
  data,
  t,
}: {
  symbol: string
  data: StockOverviewData
  t: typeof translations.en
}) {
  const priceColor = getPriceChangeColor(data.price - data.previousClose)
  const changePercent = calculateChangePercent(data)
  const priceChange = data.price - data.previousClose

  return (
    <div className="rounded-xl bg-surface border border-border p-4 md:p-6 animate-fade-in">
      {/* Symbol and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
            {symbol}
          </h1>
          <div className="flex items-center gap-2 text-sm text-text-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Thai Stock</span>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="mb-4">
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="text-4xl md:text-5xl font-bold font-mono tabular-nums text-text-primary">
            {data.price.toFixed(2)}
          </span>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${priceColor.bg} ${priceColor.text}`}>
            {priceColor.icon}
            <span className="font-semibold tabular-nums">
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}
            </span>
            <span className="text-xs tabular-nums">
              ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        {data.daysRange && (
          <div className="text-xs text-text-2 mt-2">
            Day Range: <span className="font-mono">{data.daysRange}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <MetricCard
          label={t.marketCap}
          value={formatCurrency(data.marketCap)}
          unit={t.thb}
        />
        <MetricCard
          label={t.volume}
          value={formatLargeNumber(data.volume)}
        />
        <MetricCard
          label={t.peRatio}
          value={data.peRatio.toFixed(2)}
          unit={t.ttm}
        />
      </div>
    </div>
  )
}

/**
 * Section card component with header
 */
function SectionCard({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl bg-surface border border-border overflow-hidden ${className} animate-slide-up`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2/50">
        <Icon className="w-4 h-4 text-accent-teal" />
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

/**
 * Metrics grid component
 */
function MetricsGrid({
  children,
  columns = 2,
}: {
  children: React.ReactNode
  columns?: 2 | 3 | 4
}) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns]

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {children}
    </div>
  )
}

/**
 * Stock overview section
 */
function StockOverviewSection({
  data,
  t,
}: {
  data: StockOverviewData
  t: typeof translations.en
}) {
  return (
    <div className="space-y-4">
      {/* Valuation Metrics */}
      <SectionCard title={t.valuationMetrics} icon={BarChart3}>
        <MetricsGrid columns={3}>
          <MetricCard label={t.peRatio} value={data.peRatio.toFixed(2)} />
          <MetricCard label={t.forwardPE} value={data.forwardPERatio.toFixed(2)} />
          <MetricCard label={t.eps} value={data.eps.toFixed(2)} />
          <MetricCard label={t.beta} value={data.beta?.toFixed(2) || 'N/A'} />
          <MetricCard label={t.week52High} value={data.high52Week?.toFixed(2) || 'N/A'} />
          <MetricCard label={t.week52Low} value={data.low52Week?.toFixed(2) || 'N/A'} />
        </MetricsGrid>
      </SectionCard>

      {/* Key Dates */}
      <SectionCard title={t.keyDates} icon={Calendar}>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-text-2">{t.earnings}</span>
            <span className="text-sm font-medium font-mono text-text-primary">
              {data.earningsDate || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-2">{t.exDividend}</span>
            <span className="text-sm font-medium font-mono text-text-primary">
              {data.exDividendDate || 'N/A'}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Trading Info */}
      <SectionCard title={t.tradingInfo} icon={Activity}>
        <MetricsGrid columns={2}>
          <MetricCard label="Open" value={data.open?.toFixed(2) || 'N/A'} />
          <MetricCard label="Previous Close" value={data.previousClose?.toFixed(2) || 'N/A'} />
          {data.sharesOutstanding && (
            <MetricCard label={t.shares} value={formatCurrency(data.sharesOutstanding)} />
          )}
          {data.dividend && (
            <MetricCard label="Dividend" value={formatCurrency(data.dividend)} />
          )}
        </MetricsGrid>
      </SectionCard>
    </div>
  )
}

/**
 * Stock statistics section
 */
function StockStatisticsSection({
  data,
  t,
}: {
  data: StockStatisticsData
  t: typeof translations.en
}) {
  return (
    <div className="space-y-4">
      {/* Valuation Metrics */}
      <SectionCard title={t.valuationMetrics} icon={BarChart3}>
        <MetricsGrid columns={3}>
          <MetricCard label={t.peRatio} value={data.peRatio.toFixed(2)} />
          <MetricCard label={t.forwardPE} value={data.forwardPERatio.toFixed(2)} />
          <MetricCard label={t.psRatio} value={data.psRatio.toFixed(2)} />
          <MetricCard label={t.pbRatio} value={data.pbRatio.toFixed(2)} />
          <MetricCard label={t.evEbitda} value={data.evEbitda.toFixed(2)} />
          <MetricCard label={t.pegRatio} value={data.pegRatio?.toFixed(2) || 'N/A'} />
        </MetricsGrid>
      </SectionCard>

      {/* Financial Health */}
      <SectionCard title={t.financialHealth} icon={Activity}>
        <MetricsGrid columns={2}>
          <MetricCard label={t.currentRatio} value={data.currentRatio.toFixed(2)} />
          <MetricCard label={t.quickRatio} value={data.quickRatio.toFixed(2)} />
          <MetricCard label={t.debtEquity} value={data.debtToEquity.toFixed(2)} />
          <MetricCard label={t.interestCoverage} value={data.interestCoverage.toFixed(2)} />
        </MetricsGrid>
      </SectionCard>

      {/* Profitability */}
      <SectionCard title={t.profitability} icon={TrendingUp}>
        <MetricsGrid columns={2}>
          <MetricCard label={t.roe} value={`${(data.returnOnEquity * 100).toFixed(2)}%`} />
          <MetricCard label={t.roa} value={`${(data.returnOnAssets * 100).toFixed(2)}%`} />
          <MetricCard label={t.roic} value={`${(data.returnOnInvestedCapital * 100).toFixed(2)}%`} />
          <MetricCard label={t.profitMargin} value={`${(data.profitMargin * 100).toFixed(2)}%`} />
        </MetricsGrid>
      </SectionCard>

      {/* Dividend Info */}
      <SectionCard title={t.dividendInfo} icon={DollarSign}>
        <MetricsGrid columns={2}>
          <MetricCard label={t.dividendYield} value={`${(data.dividendYield * 100).toFixed(2)}%`} />
          <MetricCard label={t.payoutRatio} value={`${(data.payoutRatio * 100).toFixed(2)}%`} />
          <MetricCard label={t.dividendGrowth} value={`${(data.dividendGrowth * 100).toFixed(2)}%`} />
          <MetricCard label={t.fcfYield} value={`${(data.fcfYield * 100).toFixed(2)}%`} />
        </MetricsGrid>
      </SectionCard>

      {/* Additional Financial Metrics */}
      <SectionCard title="Financial Statements" icon={BarChart3}>
        <MetricsGrid columns={3}>
          <MetricCard label="Revenue" value={formatLargeNumber(data.revenue)} unit={t.thb} />
          <MetricCard label="Net Income" value={formatLargeNumber(data.netIncome)} unit={t.thb} />
          <MetricCard label="EBITDA" value={formatLargeNumber(data.ebitda)} unit={t.thb} />
          <MetricCard label="Free Cash Flow" value={formatLargeNumber(data.freeCashFlow)} unit={t.thb} />
          <MetricCard label="Cash" value={formatLargeNumber(data.cash)} unit={t.thb} />
          <MetricCard label="Total Debt" value={formatLargeNumber(data.totalDebt)} unit={t.thb} />
        </MetricsGrid>
      </SectionCard>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Stock page client wrapper component
 */
export function StockPageClient({ symbol, locale, children }: StockPageClientProps) {
  const { data, isLoading, error, refetch } = useStockData(symbol)
  const { trackEvent } = useAnalytics()

  // Get translations based on locale
  const t = translations[locale as keyof typeof translations] || translations.en

  // Show loading skeleton while fetching
  if (isLoading) {
    return <StockPageSkeleton />
  }

  // Show error boundary on error
  if (error) {
    return (
      <div className="space-y-4">
        <StockPageErrorBoundary
          error={error}
          symbol={symbol}
          onRetry={refetch}
        />
        {/* Fallback to server-rendered content */}
        {children}
      </div>
    )
  }

  // Display API data
  if (data) {
    // Track watchlist events
    const handleWatchlistChange = (state: { symbol: string; isOnWatchlist: boolean }) => {
      trackEvent('watchlist_toggle', {
        symbol,
        action: state.isOnWatchlist ? 'add' : 'remove',
      })
    }

    return (
      <div className="space-y-6">
        {/* Header with Watchlist */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header with price */}
            {data.overview.success && data.overview.data && (
              <StockHeader data={data.overview.data} symbol={symbol} t={t} />
            )}
          </div>
          <WatchlistButton
            symbol={symbol}
            onChange={handleWatchlistChange}
            className="shrink-0"
          />
        </div>

        {/* Overview data */}
        {data.overview.success && data.overview.data && (
          <StockOverviewSection data={data.overview.data} t={t} />
        )}

        {/* Statistics data */}
        {data.statistics.success && data.statistics.data && (
          <StockStatisticsSection data={data.statistics.data} t={t} />
        )}

        {/* Fallback to server-rendered content for additional data */}
        {children}
      </div>
    )
  }

  // Show children (server-rendered fallback) if API data is not available
  return <>{children}</>
}
