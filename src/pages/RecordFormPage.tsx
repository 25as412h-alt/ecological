import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapView } from '@/components/map/MapView'
import { LocationPicker } from '@/components/map/LocationPicker'
import { CurrentLocationButton } from '@/components/map/CurrentLocationButton'
import { PhotoPicker, type PhotoPreview } from '@/components/record/PhotoPicker'
import { SpeciesAutocomplete } from '@/components/record/SpeciesAutocomplete'
import { WeatherField } from '@/components/record/WeatherField'
import { use_geolocation } from '@/hooks/useGeolocation'
import {
  create_record,
  update_record,
  get_record_with_photos,
  get_setting,
  set_setting,
  type RecordFormData,
} from '@/db/records_repo'
import { detect_season } from '@/lib/season_utils'
import { format_date, format_time } from '@/lib/utils'
import { blob_to_url } from '@/lib/image_utils'
import { log_error } from '@/lib/logger'
import type { TaxonGroup } from '@/db/schema'

interface LocationState {
  lat?: number
  lng?: number
  accuracy?: number | null
}

export function RecordFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const is_edit = Boolean(id)
  const loc_state = (location.state as LocationState) ?? {}

  const now = new Date()
  const { position, is_locating, get_current_position, set_position } = use_geolocation()

  const [form, set_form] = useState<RecordFormData>({
    observed_at: format_date(now),
    observed_time: format_time(now),
    lat: loc_state.lat ?? 35.6812,
    lng: loc_state.lng ?? 139.7671,
    location_accuracy: loc_state.accuracy ?? null,
    species_name_ja: '',
    species_name_sci: '',
    inat_taxon_id: null,
    individual_count: null,
    individual_state: '',
    taxon_group: 'plant',
    habitat_memo: '',
    observer_name: '',
    weather: '',
    temperature: null,
  })

  const [photos, set_photos] = useState<PhotoPreview[]>([])
  const [is_saving, set_is_saving] = useState(false)
  const [is_loading, set_is_loading] = useState(is_edit)

  useEffect(() => {
    void (async () => {
      const default_observer = await get_setting('observer_name')
      if (default_observer) {
        set_form((f) => ({ ...f, observer_name: default_observer }))
      }
    })()
  }, [])

  useEffect(() => {
    if (!is_edit || !id) return
    void (async () => {
      try {
        const record = await get_record_with_photos(id)
        if (!record) {
          toast.error('記録が見つかりません')
          navigate('/records')
          return
        }
        set_form({
          observed_at: record.observed_at,
          observed_time: record.observed_time,
          lat: record.lat,
          lng: record.lng,
          location_accuracy: record.location_accuracy,
          species_name_ja: record.species_name_ja,
          species_name_sci: record.species_name_sci,
          inat_taxon_id: record.inat_taxon_id,
          individual_count: record.individual_count,
          individual_state: record.individual_state,
          taxon_group: record.taxon_group,
          habitat_memo: record.habitat_memo,
          observer_name: record.observer_name,
          weather: record.weather,
          temperature: record.temperature,
        })
        set_photos(
          record.photos.map((p) => ({
            id: p.id,
            url: blob_to_url(p.thumbnail_blob),
            blob: p.blob,
            thumbnail_blob: p.thumbnail_blob,
            is_existing: true,
          })),
        )
      } catch (error) {
        log_error('RecordFormPage.load', { id }, error)
        toast.error('記録の読み込みに失敗しました')
      } finally {
        set_is_loading(false)
      }
    })()
  }, [id, is_edit, navigate])

  useEffect(() => {
    if (position) {
      set_form((f) => ({
        ...f,
        lat: position.lat,
        lng: position.lng,
        location_accuracy: position.accuracy,
      }))
    }
  }, [position])

  const handle_map_click = (lat: number, lng: number) => {
    set_form((f) => ({ ...f, lat, lng, location_accuracy: null }))
    set_position({ lat, lng, accuracy: null })
  }

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.species_name_ja.trim()) {
      toast.error('和名を入力してください')
      return
    }

    set_is_saving(true)
    try {
      const new_photos = photos
        .filter((p) => !p.is_existing)
        .map((p) => ({ blob: p.blob, thumbnail_blob: p.thumbnail_blob }))
      const keep_ids = photos.filter((p) => p.is_existing).map((p) => p.id)

      if (form.observer_name) {
        await set_setting('observer_name', form.observer_name)
      }

      if (is_edit && id) {
        await update_record(id, form, new_photos, keep_ids)
        toast.success('記録を更新しました')
        navigate(`/records/${id}`)
      } else {
        const new_id = await create_record(form, new_photos)
        toast.success('記録を保存しました')
        navigate(`/records/${new_id}`)
      }
    } catch (error) {
      log_error('RecordFormPage.submit', { is_edit }, error)
      toast.error('保存に失敗しました')
    } finally {
      set_is_saving(false)
    }
  }

  const season = detect_season(form.observed_at)

  if (is_loading) {
    return <div className="p-4 text-muted-foreground">読み込み中...</div>
  }

  return (
    <form onSubmit={(e) => void handle_submit(e)} className="space-y-4 p-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>{is_edit ? '記録を編集' : '新規記録'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-48 overflow-hidden rounded-md">
            <MapView
              records={[]}
              selected_lat={form.lat}
              selected_lng={form.lng}
              on_map_click={handle_map_click}
              center={[form.lat, form.lng]}
              zoom={15}
            />
            <div className="absolute right-2 top-2 z-[1000]">
              <CurrentLocationButton
                on_click={get_current_position}
                is_locating={is_locating}
              />
            </div>
          </div>
          <LocationPicker
            lat={form.lat}
            lng={form.lng}
            accuracy={form.location_accuracy}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>種情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>和名（iNaturalist検索）</Label>
            <SpeciesAutocomplete
              species_name_ja={form.species_name_ja}
              species_name_sci={form.species_name_sci}
              inat_taxon_id={form.inat_taxon_id}
              taxon_group={form.taxon_group}
              on_select={(data) => set_form((f) => ({ ...f, ...data }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="species_name_sci">学名</Label>
            <Input
              id="species_name_sci"
              value={form.species_name_sci}
              onChange={(e) => set_form((f) => ({ ...f, species_name_sci: e.target.value }))}
              placeholder="学名"
              className="italic"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="taxon_group">分類群</Label>
              <Select
                id="taxon_group"
                value={form.taxon_group}
                onChange={(e) =>
                  set_form((f) => ({ ...f, taxon_group: e.target.value as TaxonGroup }))
                }
              >
                <option value="plant">植物</option>
                <option value="insect">昆虫</option>
                <option value="mammal">哺乳類</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="individual_count">個体数</Label>
              <Input
                id="individual_count"
                type="number"
                min={0}
                value={form.individual_count ?? ''}
                onChange={(e) =>
                  set_form((f) => ({
                    ...f,
                    individual_count: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="individual_state">個体の状態</Label>
            <Input
              id="individual_state"
              value={form.individual_state}
              onChange={(e) => set_form((f) => ({ ...f, individual_state: e.target.value }))}
              placeholder="例: 成虫、幼生、開花中"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>観察条件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="observed_at">観察日</Label>
              <Input
                id="observed_at"
                type="date"
                value={form.observed_at}
                onChange={(e) => set_form((f) => ({ ...f, observed_at: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="observed_time">時刻（自動）</Label>
              <Input id="observed_time" value={form.observed_time} readOnly className="bg-muted" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">季節（自動判定）: {season}</p>
          <WeatherField
            weather={form.weather}
            temperature={form.temperature}
            on_weather_change={(w) => set_form((f) => ({ ...f, weather: w }))}
            on_temperature_change={(t) => set_form((f) => ({ ...f, temperature: t }))}
          />
          <div className="space-y-1">
            <Label htmlFor="observer_name">調査者名</Label>
            <Input
              id="observer_name"
              value={form.observer_name}
              onChange={(e) => set_form((f) => ({ ...f, observer_name: e.target.value }))}
              placeholder="調査者名"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="habitat_memo">生息環境メモ</Label>
            <Textarea
              id="habitat_memo"
              value={form.habitat_memo}
              onChange={(e) => set_form((f) => ({ ...f, habitat_memo: e.target.value }))}
              placeholder="林床、河原、草地 など"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>写真</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoPicker photos={photos} on_change={set_photos} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={is_saving}>
          {is_saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  )
}
