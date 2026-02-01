/**
 * Footer Component
 * fonPick - Thai Stock Market Application
 *
 * Compact footer with copyright and data source info.
 * Based on: docs/design_rules.md
 */

/**
 * Footer Component
 * Compact footer with copyright and market data information
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-bg-surface border-t border-border-subtle">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Copyright */}
          <div className="text-xs text-text-tertiary">
            © {currentYear} fonPick. Fast Stock Decisions.
          </div>

          {/* Data source info */}
          <div className="flex items-center gap-3 text-xs text-text-tertiary">
            <span>Data from SET</span>
            <span className="text-border-subtle">•</span>
            <span className="text-primary">fonPick</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
