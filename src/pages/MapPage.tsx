import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapView } from '@/components/map/MapView'
import { CurrentLocationButton } from '@/components/map/CurrentLocationButton'
import { use_records } from '@/hooks/useRecords'
import { use_geolocation } from '@/hooks/useGeolocation'
import { use_record_store } from '@/store/recordStore'

export function MapPage() {
  const navigate = useNavigate()
  const { records } = use_records()
  const { selected_pin, set_selected_pin } = use_record_store()
  const { position, is_locating, get_current_position, set_position } = use_geolocation()

  const map_center = useMemo<[number, number]>(() => {
    if (position) return [position.lat, position.lng]
    if (selected_pin) return [selected_pin.lat, selected_pin.lng]
    if (records.length > 0) return [records[0].lat, records[0].lng]
    return [35.6812, 139.7671]
  }, [position, selected_pin, records])

  const handle_map_click = (lat: number, lng: number) => {
    set_selected_pin({ lat, lng })
    set_position({ lat, lng, accuracy: null })
  }

  const handle_current_location = () => {
    get_current_position()
  }

  // 現在地取得後にピンを更新
  useEffect(() => {
    if (position) {
      set_selected_pin({ lat: position.lat, lng: position.lng })
    }
  }, [position, set_selected_pin])

  return (
    <div className="relative h-full">
      <div className="absolute right-3 top-3 z-[1000]">
        <CurrentLocationButton
          on_click={handle_current_location}
          is_locating={is_locating}
        />
      </div>

      <MapView
        records={records}
        selected_lat={selected_pin?.lat ?? position?.lat}
        selected_lng={selected_pin?.lng ?? position?.lng}
        on_map_click={handle_map_click}
        on_record_click={(id) => navigate(`/records/${id}`)}
        center={map_center}
        zoom={14}
      />

      {selected_pin && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <button
            type="button"
            onClick={() =>
              navigate('/records/new', {
                state: {
                  lat: selected_pin.lat,
                  lng: selected_pin.lng,
                  accuracy: position?.accuracy ?? null,
                },
              })
            }
            className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-accent/90"
          >
            この地点で記録を作成
          </button>
        </div>
      )}
    </div>
  )
}
