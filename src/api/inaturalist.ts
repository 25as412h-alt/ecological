import { log_error } from '@/lib/logger'

export interface InatTaxon {
  id: number
  name: string
  preferred_common_name: string | null
  matched_term: string
  rank: string
  iconic_taxon_name: string
}

interface InatAutocompleteResponse {
  results: InatTaxon[]
}

const CACHE = new Map<string, { data: InatTaxon[]; ts: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000
const MIN_QUERY_LEN = 2

/** iNaturalist API は60req/分以下を推奨。デバウンスとキャッシュで呼び過ぎを防ぐ */
export async function search_taxa(query: string): Promise<InatTaxon[]> {
  const trimmed = query.trim()
  if (trimmed.length < MIN_QUERY_LEN) return []

  const cached = CACHE.get(trimmed)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data
  }

  try {
    const url = new URL('https://api.inaturalist.org/v1/taxa/autocomplete')
    url.searchParams.set('q', trimmed)
    url.searchParams.set('locale', 'ja')
    url.searchParams.set('per_page', '10')

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`iNaturalist API error: ${res.status}`)

    const json = (await res.json()) as InatAutocompleteResponse
    const data = json.results ?? []
    CACHE.set(trimmed, { data, ts: Date.now() })
    return data
  } catch (error) {
    log_error('search_taxa', { query: trimmed }, error)
    throw error
  }
}

export function taxon_group_from_inat(iconic_taxon_name: string): 'plant' | 'insect' | 'mammal' | null {
  const map: Record<string, 'plant' | 'insect' | 'mammal'> = {
    Plantae: 'plant',
    Insecta: 'insect',
    Mammalia: 'mammal',
    Aves: 'mammal',
  }
  return map[iconic_taxon_name] ?? null
}
