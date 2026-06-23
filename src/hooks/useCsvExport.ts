import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { RecordRow } from '@/db/schema'
import { get_photo_counts } from '@/db/records_repo'
import {
  build_all_records_filename,
  build_single_record_filename,
  download_text_file,
  records_to_csv,
} from '@/lib/csv_utils'
import { log_error } from '@/lib/logger'

export function use_csv_export() {
  const [is_exporting, set_is_exporting] = useState(false)

  const export_records = useCallback(
    async (records: RecordRow[], photo_counts?: Map<string, number>) => {
      if (records.length === 0) {
        toast.error('出力する記録がありません')
        return
      }

      set_is_exporting(true)
      try {
        const counts =
          photo_counts ??
          (await get_photo_counts(records.map((record) => record.id)))

        const csv = records_to_csv(records, counts)
        const filename =
          records.length === 1
            ? build_single_record_filename(records[0])
            : build_all_records_filename()

        download_text_file(csv, filename)
        toast.success('CSVをダウンロードしました')
      } catch (error) {
        log_error('use_csv_export.export_records', { count: records.length }, error)
        toast.error('CSVの出力に失敗しました')
      } finally {
        set_is_exporting(false)
      }
    },
    [],
  )

  return { export_records, is_exporting }
}
