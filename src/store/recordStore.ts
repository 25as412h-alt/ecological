import { create } from 'zustand'
import type { RecordRow } from '@/db/schema'

interface MapPin {
  lat: number
  lng: number
}

interface RecordStore {
  records: RecordRow[]
  selected_pin: MapPin | null
  is_loading: boolean
  set_records: (records: RecordRow[]) => void
  set_selected_pin: (pin: MapPin | null) => void
  set_is_loading: (loading: boolean) => void
}

export const use_record_store = create<RecordStore>((set) => ({
  records: [],
  selected_pin: null,
  is_loading: false,
  set_records: (records) => set({ records }),
  set_selected_pin: (pin) => set({ selected_pin: pin }),
  set_is_loading: (loading) => set({ is_loading: loading }),
}))
