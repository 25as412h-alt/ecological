import { z } from 'zod'
import { db, type RecordRow, type RecordWithPhotos, type PhotoRow } from './schema'
import { generate_id } from '@/lib/utils'
import { detect_season } from '@/lib/season_utils'
import { log_error, log_info } from '@/lib/logger'

export const record_form_schema = z.object({
  observed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  observed_time: z.string().regex(/^\d{2}:\d{2}$/),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  location_accuracy: z.number().nullable(),
  species_name_ja: z.string().min(1, '和名を入力してください'),
  species_name_sci: z.string(),
  inat_taxon_id: z.number().nullable(),
  individual_count: z.number().int().min(0).nullable(),
  individual_state: z.string(),
  taxon_group: z.enum(['plant', 'insect', 'mammal']),
  habitat_memo: z.string(),
  observer_name: z.string(),
  weather: z.string(),
  temperature: z.number().nullable(),
})

export type RecordFormData = z.infer<typeof record_form_schema>

export interface PhotoInput {
  blob: Blob
  thumbnail_blob: Blob
}

export async function get_all_records(): Promise<RecordRow[]> {
  try {
    return await db.records.orderBy('observed_at').reverse().toArray()
  } catch (error) {
    log_error('get_all_records', {}, error)
    throw error
  }
}

export async function get_photo_counts(record_ids: string[]): Promise<Map<string, number>> {
  try {
    const counts = new Map<string, number>()
    for (const id of record_ids) {
      counts.set(id, 0)
    }
    if (record_ids.length === 0) return counts

    const photos = await db.photos.where('record_id').anyOf(record_ids).toArray()
    for (const photo of photos) {
      counts.set(photo.record_id, (counts.get(photo.record_id) ?? 0) + 1)
    }
    return counts
  } catch (error) {
    log_error('get_photo_counts', { record_id_count: record_ids.length }, error)
    throw error
  }
}

export async function get_record_with_photos(id: string): Promise<RecordWithPhotos | undefined> {
  try {
    const record = await db.records.get(id)
    if (!record) return undefined
    const photos = await db.photos.where('record_id').equals(id).toArray()
    return { ...record, photos }
  } catch (error) {
    log_error('get_record_with_photos', { id }, error)
    throw error
  }
}

export async function create_record(
  form_data: RecordFormData,
  photos: PhotoInput[],
): Promise<string> {
  try {
    const parsed = record_form_schema.parse(form_data)
    const id = generate_id()
    const now = new Date().toISOString()

    const record: RecordRow = {
      id,
      created_at: now,
      ...parsed,
      season: detect_season(parsed.observed_at),
    }

    const photo_rows: PhotoRow[] = photos.map((p) => ({
      id: generate_id(),
      record_id: id,
      blob: p.blob,
      thumbnail_blob: p.thumbnail_blob,
      created_at: now,
    }))

    await db.transaction('rw', [db.records, db.photos], async () => {
      await db.records.add(record)
      if (photo_rows.length > 0) {
        await db.photos.bulkAdd(photo_rows)
      }
    })

    log_info('create_record', { id, photo_count: photo_rows.length })
    return id
  } catch (error) {
    log_error('create_record', { form_data }, error)
    throw error
  }
}

export async function update_record(
  id: string,
  form_data: RecordFormData,
  new_photos: PhotoInput[],
  keep_photo_ids: string[],
): Promise<void> {
  try {
    const parsed = record_form_schema.parse(form_data)
    const existing = await db.records.get(id)
    if (!existing) throw new Error('記録が見つかりません')

    const record: RecordRow = {
      ...existing,
      ...parsed,
      season: detect_season(parsed.observed_at),
    }

    await db.transaction('rw', [db.records, db.photos], async () => {
      await db.records.put(record)

      const all_photos = await db.photos.where('record_id').equals(id).toArray()
      const to_delete = all_photos.filter((p) => !keep_photo_ids.includes(p.id))
      await Promise.all(to_delete.map((p) => db.photos.delete(p.id)))

      if (new_photos.length > 0) {
        const now = new Date().toISOString()
        const rows: PhotoRow[] = new_photos.map((p) => ({
          id: generate_id(),
          record_id: id,
          blob: p.blob,
          thumbnail_blob: p.thumbnail_blob,
          created_at: now,
        }))
        await db.photos.bulkAdd(rows)
      }
    })

    log_info('update_record', { id })
  } catch (error) {
    log_error('update_record', { id }, error)
    throw error
  }
}

export async function delete_record(id: string): Promise<void> {
  try {
    await db.transaction('rw', [db.records, db.photos], async () => {
      await db.photos.where('record_id').equals(id).delete()
      await db.records.delete(id)
    })
    log_info('delete_record', { id })
  } catch (error) {
    log_error('delete_record', { id }, error)
    throw error
  }
}

export async function get_setting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key)
  return row?.value
}

export async function set_setting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value })
}
