/**
 * WatchlistButton Component
 * Add/remove stock from watchlist with localStorage persistence
 */

'use client'

import { useState, useEffect } from 'react'
import { Star, StarOff } from 'lucide-react'
import { Button } from '@/components/shared'
import { cn } from '@/lib/utils'

interface WatchlistButtonProps {
  symbol: string
  className?: string
}

export function WatchlistButton({ symbol, className }: WatchlistButtonProps) {
  const [isOnWatchlist, setIsOnWatchlist] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
      setIsOnWatchlist(watchlist.includes(symbol))
    } catch (error) {
      console.error('Error loading watchlist:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [symbol])

  const toggleWatchlist = () => {
    try {
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')

      if (isOnWatchlist) {
        // Remove from watchlist
        const updated = watchlist.filter((s: string) => s !== symbol)
        localStorage.setItem('watchlist', JSON.stringify(updated))
        setIsOnWatchlist(false)
      } else {
        // Add to watchlist
        watchlist.push(symbol)
        localStorage.setItem('watchlist', JSON.stringify(watchlist))
        setIsOnWatchlist(true)
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
    }
  }

  if (!isLoaded) {
    return (
      <Button variant="outline" size="md" className={className} disabled>
        <StarOff className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <Button
      variant={isOnWatchlist ? 'secondary' : 'outline'}
      size="md"
      onClick={toggleWatchlist}
      className={cn(
        'gap-2',
        isOnWatchlist && 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
        className
      )}
    >
      {isOnWatchlist ? (
        <>
          <Star className="w-4 h-4 fill-current" />
          <span>Watching</span>
        </>
      ) : (
        <>
          <StarOff className="w-4 h-4" />
          <span>Watch</span>
        </>
      )}
    </Button>
  )
}
