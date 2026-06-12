import { Link } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { use_records } from '@/hooks/useRecords'

const TAXON_LABELS: Record<string, string> = {
  plant: '植物',
  insect: '昆虫',
  mammal: '哺乳類',
}

export function RecordListPage() {
  const { records, is_loading } = use_records()

  if (is_loading) {
    return <div className="p-4 text-muted-foreground">読み込み中...</div>
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <MapPin size={48} className="text-muted-foreground" />
        <p className="text-muted-foreground">まだ記録がありません</p>
        <Link
          to="/records/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          最初の記録を作成
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      <p className="text-sm text-muted-foreground">{records.length} 件の記録</p>
      {records.map((record) => (
        <Link key={record.id} to={`/records/${record.id}`}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <p className="font-medium text-primary">
                  {record.species_name_ja || '（種名未設定）'}
                </p>
                {record.species_name_sci && (
                  <p className="text-xs italic text-muted-foreground">
                    {record.species_name_sci}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  <Badge>{TAXON_LABELS[record.taxon_group]}</Badge>
                  <Badge>{record.observed_at}</Badge>
                  {record.weather && <Badge>{record.weather}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {record.lat.toFixed(4)}, {record.lng.toFixed(4)}
                </p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
