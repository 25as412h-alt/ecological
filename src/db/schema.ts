import Dexie, { type EntityTable } from 'dexie'

export type TaxonGroup = 'plant' | 'insect' | 'mammal'

export interface RecordRow {
  id: string
  created_at: string
  observed_at: string
  observed_time: string
  lat: number
  lng: number
  location_accuracy: number | null
  species_name_ja: string
  species_name_sci: string
  inat_taxon_id: number | null
  individual_count: number | null
  individual_state: string
  taxon_group: TaxonGroup
  habitat_memo: string
  observer_name: string
  weather: string
  temperature: number | null
  season: string
}

export interface PhotoRow {
  id: string
  record_id: string
  blob: Blob
  thumbnail_blob: Blob
  created_at: string
}

export interface SettingRow {
  key: string
  value: string
}

class FieldNoteDatabase extends Dexie {
  records!: EntityTable<RecordRow, 'id'>
  photos!: EntityTable<PhotoRow, 'id'>
  settings!: EntityTable<SettingRow, 'key'>

  constructor() {
    super('field_note_db')
    this.version(1).stores({
      records: 'id, observed_at, taxon_group, created_at',
      photos: 'id, record_id',
      settings: 'key',
    })
  }
}

export const db = new FieldNoteDatabase()

export interface RecordWithPhotos extends RecordRow {
  photos: PhotoRow[]
}
