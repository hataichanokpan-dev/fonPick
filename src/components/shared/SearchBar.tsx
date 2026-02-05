/**
 * SearchBar Component
 *
 * Professional minimal search input with:
 * - Search icon (left)
 * - Clear button (right, when has input)
 * - Search button (rightmost)
 * - Proper focus states and transitions
 *
 * Design follows professional minimal principles:
 * - Generous padding for comfortable touch targets
 * - Subtle hover states
 * - Smooth transitions
 * - High contrast for accessibility
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  defaultValue?: string
}

export function SearchBar({
  onSearch,
  placeholder = 'Search stocks...',
  className,
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSearch(query.trim())
    },
    [query, onSearch]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSearchClick = useCallback(() => {
    onSearch(query.trim())
  }, [query, onSearch])

  // Handle Enter key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSearch(query.trim())
      }
    },
    [query, onSearch]
  )

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative flex items-center gap-2">
        {/* Search Input Container */}
        <div className="relative flex-1">
          {/* Search Icon */}
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-3 pointer-events-none"
            aria-hidden="true"
          />

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              // Layout
              'w-full pl-12 pr-12 py-3',
              // Styling
              'rounded-xl',
              'bg-surface border border-border',
              'text-text-primary placeholder:text-text-3',
              'text-sm',
              // Transitions
              'transition-all duration-200',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              // Hover
              'hover:border-border-hover'
            )}
            aria-label="Search stocks"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-1 rounded-lg',
                'text-text-3 hover:text-text-primary',
                'hover:bg-surface-1',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          onClick={handleSearchClick}
          className={cn(
            // Layout
            'px-5 py-3',
            // Styling
            'rounded-xl',
            'bg-primary text-white',
            'font-medium text-sm',
            // Transitions
            'transition-all duration-200',
            // Hover
            'hover:bg-primary/90 hover:shadow-md',
            // Active
            'active:scale-[0.98]',
            // Focus
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
            // Disabled
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary'
          )}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
