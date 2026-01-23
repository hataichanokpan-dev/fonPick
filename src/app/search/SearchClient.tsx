/**
 * Search Client Component
 * Client component wrapper for search functionality
 */

'use client'

import { Suspense } from 'react'
import { SearchBar } from '@/components/shared'
import { useSearchParams, useRouter } from 'next/navigation'

function SearchBarWithParams({ defaultValue }: { defaultValue: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    router.push(`/search?${params.toString()}`)
  }

  return (
    <SearchBar
      onSearch={handleSearch}
      placeholder="Search stocks (e.g., PTT, KBANK, Bank...)"
      defaultValue={defaultValue}
    />
  )
}

export function SearchClient({ defaultValue }: { defaultValue: string }) {
  return (
    <Suspense fallback={<SearchBar defaultValue={defaultValue} placeholder="Search stocks..." onSearch={() => {}} />}>
      <SearchBarWithParams defaultValue={defaultValue} />
    </Suspense>
  )
}
