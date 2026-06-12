import { MapPin } from 'lucide-react'

interface LocationPickerProps {
  lat: number | null
  lng: number | null
  accuracy: number | null
}

export function LocationPicker({ lat, lng, accuracy }: LocationPickerProps) {
  if (lat == null || lng == null) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted p-3 text-sm text-muted-foreground">
        <MapPin size={16} />
        地図をクリックするか「現在地」ボタンで位置を設定してください
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border bg-secondary/50 p-3 text-sm">
      <div className="flex items-center gap-2 font-medium text-primary">
        <MapPin size={16} />
        位置情報
      </div>
      <div className="mt-1 space-y-0.5 text-muted-foreground">
        <p>緯度: {lat.toFixed(6)}</p>
        <p>経度: {lng.toFixed(6)}</p>
        {accuracy != null && <p>精度: ±{Math.round(accuracy)}m</p>}
      </div>
    </div>
  )
}
