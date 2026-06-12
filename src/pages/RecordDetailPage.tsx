import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { MapView } from '@/components/map/MapView'
import { get_record_with_photos, delete_record } from '@/db/records_repo'
import { fetch_wikipedia_summary, type WikiSummary } from '@/api/wikipedia'
import { blob_to_url } from '@/lib/image_utils'
import { format_datetime } from '@/lib/utils'
import { log_error } from '@/lib/logger'
import type { RecordWithPhotos } from '@/db/schema'

const TAXON_LABELS: Record<string, string> = {
  plant: '植物',
  insect: '昆虫',
  mammal: '哺乳類',
}

export function RecordDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, set_record] = useState<RecordWithPhotos | null>(null)
  const [wiki, set_wiki] = useState<WikiSummary | null>(null)
  const [is_loading, set_is_loading] = useState(true)

  useEffect(() => {
    if (!id) return
    void (async () => {
      try {
        const data = await get_record_with_photos(id)
        if (!data) {
          toast.error('記録が見つかりません')
          navigate('/records')
          return
        }
        set_record(data)

        const wiki_name = data.species_name_ja || data.species_name_sci
        if (wiki_name) {
          const summary = await fetch_wikipedia_summary(wiki_name)
          set_wiki(summary)
        }
      } catch (error) {
        log_error('RecordDetailPage.load', { id }, error)
        toast.error('記録の読み込みに失敗しました')
      } finally {
        set_is_loading(false)
      }
    })()
  }, [id, navigate])

  const handle_delete = async () => {
    if (!id || !confirm('この記録を削除しますか？')) return
    try {
      await delete_record(id)
      toast.success('記録を削除しました')
      navigate('/records')
    } catch (error) {
      log_error('RecordDetailPage.delete', { id }, error)
      toast.error('削除に失敗しました')
    }
  }

  if (is_loading) {
    return <div className="p-4 text-muted-foreground">読み込み中...</div>
  }

  if (!record) return null

  return (
    <div className="space-y-4 p-4 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">{record.species_name_ja}</h2>
          {record.species_name_sci && (
            <p className="italic text-muted-foreground">{record.species_name_sci}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/records/${id}/edit`}>
            <Button variant="outline" size="icon">
              <Pencil size={16} />
            </Button>
          </Link>
          <Button variant="destructive" size="icon" onClick={() => void handle_delete()}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>{TAXON_LABELS[record.taxon_group]}</Badge>
        <Badge>{record.season}</Badge>
        {record.weather && <Badge>{record.weather}</Badge>}
        {record.temperature != null && <Badge>{record.temperature}℃</Badge>}
      </div>

      {record.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {record.photos.map((photo) => (
            <img
              key={photo.id}
              src={blob_to_url(photo.blob)}
              alt="観察写真"
              className="h-40 w-40 flex-shrink-0 rounded-md border border-border object-cover"
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">観察情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="観察日" value={`${record.observed_at} ${record.observed_time}`} />
          <InfoRow label="個体数" value={record.individual_count?.toString() ?? '-'} />
          <InfoRow label="個体の状態" value={record.individual_state || '-'} />
          <InfoRow label="調査者" value={record.observer_name || '-'} />
          <InfoRow label="生息環境" value={record.habitat_memo || '-'} />
          <InfoRow label="位置" value={`${record.lat.toFixed(5)}, ${record.lng.toFixed(5)}`} />
          <InfoRow label="登録日時" value={format_datetime(record.created_at)} />
        </CardContent>
      </Card>

      <div className="h-48 overflow-hidden rounded-md">
        <MapView
          records={[record]}
          center={[record.lat, record.lng]}
          zoom={15}
          interactive={false}
        />
      </div>

      {wiki && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wikipedia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {wiki.thumbnail && (
              <img
                src={wiki.thumbnail.source}
                alt={wiki.title}
                className="float-right ml-3 mb-2 h-24 w-24 rounded object-cover"
              />
            )}
            <p className="text-muted-foreground">{wiki.extract}</p>
            {wiki.content_urls?.desktop.page && (
              <a
                href={wiki.content_urls.desktop.page}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline"
              >
                詳細を見る <ExternalLink size={14} />
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 flex-shrink-0 text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
