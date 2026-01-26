/**
 * Accordion Component
 *
 * Expandable/collapsible content section with smooth animations
 * Used in guide page for feature explanations and FAQ
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
  icon?: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
  allowMultiple?: boolean // Allow multiple items open at once
}

interface AccordionItemProps {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
}

// ============================================================================
// ACCORDION ITEM COMPONENT
// ============================================================================

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between py-4 px-2 text-left',
          'hover:bg-white/5 transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg'
        )}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
      >
        <span className="flex items-center gap-3 flex-1">
          {item.icon && (
            <span className="flex-shrink-0 text-gray-400">
              {item.icon}
            </span>
          )}
          <span className="font-semibold text-gray-100">{item.title}</span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-content-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-4 text-gray-300">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// MAIN ACCORDION COMPONENT
// ============================================================================

export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newOpen = new Set(prev)

      if (allowMultiple) {
        if (newOpen.has(id)) {
          newOpen.delete(id)
        } else {
          newOpen.add(id)
        }
      } else {
        // Single mode: close all, then open the clicked one
        newOpen.clear()
        newOpen.add(id)
      }

      return newOpen
    })
  }

  return (
    <div className={cn('rounded-lg bg-gray-900/50 backdrop-blur-sm', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  )
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Accordion
