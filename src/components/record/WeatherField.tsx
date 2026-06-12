import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

const WEATHER_OPTIONS = ['', '晴れ', '曇り', '雨', '雪', '霧', 'その他']

interface WeatherFieldProps {
  weather: string
  temperature: number | null
  on_weather_change: (weather: string) => void
  on_temperature_change: (temp: number | null) => void
}

export function WeatherField({
  weather,
  temperature,
  on_weather_change,
  on_temperature_change,
}: WeatherFieldProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label htmlFor="weather">天気</Label>
        <Select
          id="weather"
          value={weather}
          onChange={(e) => on_weather_change(e.target.value)}
        >
          {WEATHER_OPTIONS.map((w) => (
            <option key={w} value={w}>
              {w || '選択してください'}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="temperature">気温 (℃)</Label>
        <input
          id="temperature"
          type="number"
          step="0.1"
          value={temperature ?? ''}
          onChange={(e) =>
            on_temperature_change(e.target.value === '' ? null : Number(e.target.value))
          }
          className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          placeholder="例: 22.5"
        />
      </div>
    </div>
  )
}
