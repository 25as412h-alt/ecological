import { useCallback, useEffect, useRef, useState } from 'react'
import { search_taxa, type InatTaxon } from '@/api/inaturalist'
import { log_error } from '@/lib/logger'

const DEBOUNCE_MS = 300

export function use_species_search() {
  const [query, set_query] = useState('')
  const [results, set_results] = useState<InatTaxon[]>([])
  const [is_searching, set_is_searching] = useState(false)
  const timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((q: string) => {
    set_query(q)
    if (timer_ref.current) clearTimeout(timer_ref.current)

    if (q.trim().length < 2) {
      set_results([])
      return
    }

    timer_ref.current = setTimeout(async () => {
      set_is_searching(true)
      try {
        const data = await search_taxa(q)
        set_results(data)
      } catch (error) {
        log_error('use_species_search', { query: q }, error)
        set_results([])
      } finally {
        set_is_searching(false)
      }
    }, DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (timer_ref.current) clearTimeout(timer_ref.current)
    }
  }, [])

  const clear_results = useCallback(() => {
    set_results([])
    set_query('')
  }, [])

  return { query, results, is_searching, search, clear_results }
}
