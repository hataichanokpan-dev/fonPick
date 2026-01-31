/**
 * Search Client Component
 * Client component wrapper for search functionality
 * Redirects to stock page when searching
 */

'use client'

import { Suspense } from 'react'
import { SearchBar } from '@/components/shared'
import { useRouter, useParams } from 'next/navigation'

function SearchBarWithParams({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'th'

  const handleSearch = (query: string) => {
    if (!query || query.trim().length === 0) {
      return
    }

    const trimmedQuery = query.trim().toUpperCase()

    // Thai stock symbols are typically 2-4 uppercase letters
    // If the query looks like a stock symbol, redirect directly to stock page
    const symbolPattern = /^[A-Z]{2,4}$/
    if (symbolPattern.test(trimmedQuery)) {
      // Redirect directly to stock page
      router.push(`/${locale}/stock/${trimmedQuery}`)
    } else {
      // Otherwise, search with the query parameter
      router.push(`/${locale}/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }

  return (
    <SearchBar
      onSearch={handleSearch}
      placeholder="ค้นหาหุ้น (เช่น PTT, KBANK, Bank...)"
      defaultValue={defaultValue}
    />
  )
}

export function SearchClient({ defaultValue }: { defaultValue: string }) {
  return (
    <Suspense fallback={
      <SearchBar
        defaultValue={defaultValue}
        placeholder="ค้นหาหุ้น..."
        onSearch={() => {}}
      />
    }>
      <SearchBarWithParams defaultValue={defaultValue} />
    </Suspense>
  )
}
