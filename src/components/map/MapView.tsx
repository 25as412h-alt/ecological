import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RecordRow } from '@/db/schema'

// Leaflet デフォルトアイコンのパス問題を修正
import marker_icon from 'leaflet/dist/images/marker-icon.png'
import marker_icon_2x from 'leaflet/dist/images/marker-icon-2x.png'
import marker_shadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: marker_icon,
  iconRetinaUrl: marker_icon_2x,
  shadowUrl: marker_shadow,
})

const selected_icon = new L.Icon({
  iconUrl: marker_icon,
  iconRetinaUrl: marker_icon_2x,
  shadowUrl: marker_shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'selected-marker',
})

interface MapViewProps {
  records: RecordRow[]
  selected_lat?: number | null
  selected_lng?: number | null
  on_map_click?: (lat: number, lng: number) => void
  on_record_click?: (id: string) => void
  center?: [number, number]
  zoom?: number
  interactive?: boolean
}

function MapClickHandler({
  on_map_click,
}: {
  on_map_click?: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      on_map_click?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export function MapView({
  records,
  selected_lat,
  selected_lng,
  on_map_click,
  on_record_click,
  center = [35.6812, 139.7671],
  zoom = 13,
  interactive = true,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      style={{ minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {interactive && on_map_click && <MapClickHandler on_map_click={on_map_click} />}
      <MapCenterUpdater center={center} />

      {selected_lat != null && selected_lng != null && (
        <Marker position={[selected_lat, selected_lng]} icon={selected_icon}>
          <Popup>選択中の地点</Popup>
        </Marker>
      )}

      {records.map((record) => (
        <Marker
          key={record.id}
          position={[record.lat, record.lng]}
          eventHandlers={{
            click: () => on_record_click?.(record.id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{record.species_name_ja || '未設定'}</strong>
              <br />
              {record.observed_at}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
