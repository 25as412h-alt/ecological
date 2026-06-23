import type { RecordRow, TaxonGroup } from '@/db/schema'

const TAXON_LABELS: Record<TaxonGroup, string> = {
  plant: '植物',
  insect: '昆虫',
  mammal: '哺乳類',
}

const CSV_HEADERS = [
  '記録ID',
  '登録日時',
  '観察日',
  '観察時刻',
  '緯度',
  '経度',
  'GPS精度_m',
  '和名',
  '学名',
  'iNaturalist_ID',
  '個体数',
  '個体の状態',
  '分類群',
  '生息環境メモ',
  '調査者',
  '天気',
  '気温_℃',
  '季節',
  '写真枚数',
] as const

type CsvCellValue = string | number | null | undefined

/** CSV セル内の特殊文字を RFC 4180 準拠でエスケープする */
export function escape_csv_cell(value: CsvCellValue): string {
  if (value == null) return ''
  const text = String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function record_to_row(record: RecordRow, photo_count: number): string[] {
  return [
    record.id,
    record.created_at,
    record.observed_at,
    record.observed_time,
    record.lat,
    record.lng,
    record.location_accuracy,
    record.species_name_ja,
    record.species_name_sci,
    record.inat_taxon_id,
    record.individual_count,
    record.individual_state,
    TAXON_LABELS[record.taxon_group],
    record.habitat_memo,
    record.observer_name,
    record.weather,
    record.temperature,
    record.season,
    photo_count,
  ].map(escape_csv_cell)
}

/** 観察記録配列を CSV 文字列に変換する（UTF-8 BOM 付き） */
export function records_to_csv(
  records: RecordRow[],
  photo_counts: Map<string, number>,
): string {
  const lines = [
    CSV_HEADERS.map(escape_csv_cell).join(','),
    ...records.map((record) =>
      record_to_row(record, photo_counts.get(record.id) ?? 0).join(','),
    ),
  ]
  // Excel on Windows で日本語が文字化けしないよう BOM を付与
  return `\uFEFF${lines.join('\r\n')}`
}

/** ファイル名に使えない文字を除去する */
export function sanitize_filename_part(text: string): string {
  return text.replace(/[\\/:*?"<>|]/g, '').trim() || 'record'
}

export function build_all_records_filename(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `field_note_records_${date}.csv`
}

export function build_single_record_filename(record: RecordRow): string {
  const date = record.observed_at.replace(/-/g, '')
  const label = sanitize_filename_part(record.species_name_ja || record.id)
  return `field_note_${date}_${label}.csv`
}

/** テキストファイルをブラウザからダウンロードさせる */
export function download_text_file(
  content: string,
  filename: string,
  mime_type = 'text/csv;charset=utf-8',
): void {
  const blob = new Blob([content], { type: mime_type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
