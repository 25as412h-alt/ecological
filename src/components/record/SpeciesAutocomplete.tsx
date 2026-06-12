import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { use_species_search } from '@/hooks/useSpeciesSearch'
import { taxon_group_from_inat, type InatTaxon } from '@/api/inaturalist'
import type { TaxonGroup } from '@/db/schema'

interface SpeciesAutocompleteProps {
  species_name_ja: string
  species_name_sci: string
  inat_taxon_id: number | null
  taxon_group: TaxonGroup
  on_select: (data: {
    species_name_ja: string
    species_name_sci: string
    inat_taxon_id: number | null
    taxon_group: TaxonGroup
  }) => void
}

export function SpeciesAutocomplete({
  species_name_ja,
  on_select,
}: SpeciesAutocompleteProps) {
  const { results, is_searching, search, clear_results } = use_species_search()
  const [is_open, set_is_open] = useState(false)

  const handle_select = (taxon: InatTaxon) => {
    const group = taxon_group_from_inat(taxon.iconic_taxon_name)
    on_select({
      species_name_ja: taxon.preferred_common_name ?? taxon.matched_term,
      species_name_sci: taxon.name,
      inat_taxon_id: taxon.id,
      taxon_group: group ?? 'plant',
    })
    clear_results()
    set_is_open(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={species_name_ja}
          onChange={(e) => {
            search(e.target.value)
            on_select({
              species_name_ja: e.target.value,
              species_name_sci: '',
              inat_taxon_id: null,
              taxon_group: 'plant',
            })
            set_is_open(true)
          }}
          onFocus={() => set_is_open(true)}
          placeholder="和名または学名で検索（iNaturalist）"
          className="pl-9"
        />
        {is_searching && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {is_open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-white shadow-lg">
          {results.map((taxon) => (
            <li key={taxon.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => handle_select(taxon)}
              >
                <span className="font-medium">
                  {taxon.preferred_common_name ?? taxon.matched_term}
                </span>
                <span className="ml-2 text-muted-foreground italic">{taxon.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">({taxon.rank})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
