/**
 * SearchBar Component
 * Search input with autocomplete functionality
 */

'use client'

import { useState, useCallback } from 'react'
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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSearch(query.trim())
    },
    [query, onSearch]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    onSearch('')
  }, [onSearch])

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9CA3AF' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2.5',
            'rounded-lg',
            'focus:outline-none focus:ring-2',
            'text-sm'
          )}
          style={{
            backgroundColor: '#111827',
            border: '1px solid #273449',
            color: '#E5E7EB'
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-text-primary"
            style={{ color: '#9CA3AF' }}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}
