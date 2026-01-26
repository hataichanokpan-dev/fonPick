/**
 * SwipeableCard Usage Examples
 *
 * This file demonstrates various ways to use the SwipeableCard component
 */

'use client'

import { useState } from 'react'
import { SwipeableCard } from './SwipeableCard'
import { Trash, Star, Heart, X, Check, TrendingUp, TrendingDown } from 'lucide-react'

/**
 * Example 1: Basic Swipeable Card with Default Icons
 */
export function Example1_Basic() {
  const [items, setItems] = useState([
    { id: 1, title: 'Swipe to delete or save', content: 'Basic example with default icons' },
    { id: 2, title: 'Another card', content: 'Try swiping left or right' },
  ])

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    console.log('Item deleted:', id)
  }

  const handleSave = (id: number) => {
    console.log('Item saved:', id)
  }

  return (
    <div className="space-y-4 p-4">
      {items.map((item) => (
        <SwipeableCard
          key={item.id}
          onSwipeLeft={() => handleDelete(item.id)}
          onSwipeRight={() => handleSave(item.id)}
          leftAction={{ label: 'Delete' }}
          rightAction={{ label: 'Save' }}
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-text-secondary">{item.content}</p>
          </div>
        </SwipeableCard>
      ))}
    </div>
  )
}

/**
 * Example 2: Custom Icons and Colors
 */
export function Example2_CustomIcons() {
  return (
    <div className="space-y-4 p-4">
      <SwipeableCard
        onSwipeLeft={() => console.log('Removed')}
        onSwipeRight={() => console.log('Favorited')}
        leftAction={{
          icon: <X className="w-5 h-5" />,
          label: 'Remove',
          color: '#ff6b6b',
        }}
        rightAction={{
          icon: <Heart className="w-5 h-5" />,
          label: 'Favorite',
          color: '#f472b6',
        }}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white">Custom Icons & Colors</h3>
          <p className="text-sm text-text-secondary">
            Swipe left to remove, right to favorite
          </p>
        </div>
      </SwipeableCard>
    </div>
  )
}

/**
 * Example 3: Stock Trading Interface
 */
export function Example3_StockTrading() {
  const [stocks, _setStocks] = useState([
    { symbol: 'AAPL', price: 178.52, change: '+2.34%' },
    { symbol: 'GOOGL', price: 141.80, change: '-0.87%' },
  ])

  const handleSell = (symbol: string) => {
    console.log('Sell:', symbol)
  }

  const handleBuy = (symbol: string) => {
    console.log('Buy:', symbol)
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold text-white mb-4">Quick Trade</h2>
      {stocks.map((stock) => (
        <SwipeableCard
          key={stock.symbol}
          onSwipeLeft={() => handleSell(stock.symbol)}
          onSwipeRight={() => handleBuy(stock.symbol)}
          leftAction={{
            icon: <TrendingDown className="w-5 h-5" />,
            label: 'Sell',
          }}
          rightAction={{
            icon: <TrendingUp className="w-5 h-5" />,
            label: 'Buy',
          }}
          threshold={80}
        >
          <div className="p-4 flex justify-between items-center">
            <div>
              <span className="text-lg font-bold text-white">{stock.symbol}</span>
              <span className="ml-2 text-sm text-text-secondary">${stock.price}</span>
            </div>
            <span className={stock.change.startsWith('+') ? 'text-up-primary' : 'text-down-primary'}>
              {stock.change}
            </span>
          </div>
        </SwipeableCard>
      ))}
    </div>
  )
}

/**
 * Example 4: Disabled State
 */
export function Example4_Disabled() {
  return (
    <div className="space-y-4 p-4">
      <SwipeableCard
        disabled
        leftAction={{ label: 'Cannot delete' }}
        rightAction={{ label: 'Cannot save' }}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white">Disabled Card</h3>
          <p className="text-sm text-text-secondary">
            This card cannot be swiped (disabled state)
          </p>
        </div>
      </SwipeableCard>
    </div>
  )
}

/**
 * Example 5: With Haptic Feedback
 */
export function Example5_HapticFeedback() {
  return (
    <div className="space-y-4 p-4">
      <SwipeableCard
        onSwipeLeft={() => console.log('Action 1')}
        onSwipeRight={() => console.log('Action 2')}
        leftAction={{ label: 'Dismiss' }}
        rightAction={{ label: 'Keep' }}
        hapticFeedback={true}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white">Haptic Feedback</h3>
          <p className="text-sm text-text-secondary">
            Vibrate on mobile when swipe threshold is reached
          </p>
        </div>
      </SwipeableCard>
    </div>
  )
}

/**
 * Example 6: Task List with Actions
 */
export function Example6_TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review pull requests', completed: false },
    { id: 2, text: 'Update documentation', completed: false },
    { id: 3, text: 'Fix navigation bug', completed: true },
  ])

  const handleComplete = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleDelete = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold text-white mb-4">Tasks</h2>
      {tasks.map((task) => (
        <SwipeableCard
          key={task.id}
          onSwipeLeft={() => handleDelete(task.id)}
          onSwipeRight={() => handleComplete(task.id)}
          leftAction={{
            icon: <Trash className="w-5 h-5" />,
            label: 'Delete',
          }}
          rightAction={{
            icon: <Check className="w-5 h-5" />,
            label: task.completed ? 'Undo' : 'Done',
          }}
        >
          <div className="p-4 flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                task.completed ? 'bg-up-primary' : 'bg-text-tertiary'
              }`}
            />
            <span
              className={`text-white ${
                task.completed ? 'line-through opacity-60' : ''
              }`}
            >
              {task.text}
            </span>
          </div>
        </SwipeableCard>
      ))}
    </div>
  )
}

/**
 * Example 7: One-Sided Swipe
 */
export function Example7_OneSided() {
  return (
    <div className="space-y-4 p-4">
      <SwipeableCard
        onSwipeRight={() => console.log('Added to watchlist')}
        rightAction={{
          icon: <Star className="w-5 h-5" />,
          label: 'Watch',
        }}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white">Right Swipe Only</h3>
          <p className="text-sm text-text-secondary">
            Swipe right to add to watchlist (no left action)
          </p>
        </div>
      </SwipeableCard>

      <SwipeableCard
        onSwipeLeft={() => console.log('Archived')}
        leftAction={{
          icon: <ArchiveIcon />,
          label: 'Archive',
        }}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white">Left Swipe Only</h3>
          <p className="text-sm text-text-secondary">
            Swipe left to archive (no right action)
          </p>
        </div>
      </SwipeableCard>
    </div>
  )
}

// Custom Archive Icon
function ArchiveIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </svg>
  )
}
