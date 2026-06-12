import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { get_all_records } from '@/db/records_repo'
import { use_record_store } from '@/store/recordStore'
import { log_error } from '@/lib/logger'

export function use_records() {
  const { records, is_loading, set_records, set_is_loading } = use_record_store()

  const refresh_records = useCallback(async () => {
    set_is_loading(true)
    try {
      const data = await get_all_records()
      set_records(data)
    } catch (error) {
      log_error('use_records.refresh', {}, error)
      toast.error('記録の読み込みに失敗しました')
    } finally {
      set_is_loading(false)
    }
  }, [set_records, set_is_loading])

  useEffect(() => {
    void refresh_records()
  }, [refresh_records])

  return { records, is_loading, refresh_records }
}
