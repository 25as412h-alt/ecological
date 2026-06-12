import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { log_error } from '@/lib/logger'

export interface GeoPosition {
  lat: number
  lng: number
  accuracy: number | null
}

export function use_geolocation() {
  const [position, set_position] = useState<GeoPosition | null>(null)
  const [is_locating, set_is_locating] = useState(false)

  const get_current_position = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('このブラウザは位置情報に対応していません')
      return
    }

    set_is_locating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set_position({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        set_is_locating(false)
      },
      (err) => {
        log_error('use_geolocation', { code: err.code }, err)
        toast.error('現在地の取得に失敗しました。位置情報の許可を確認してください')
        set_is_locating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }, [])

  return { position, is_locating, get_current_position, set_position }
}
