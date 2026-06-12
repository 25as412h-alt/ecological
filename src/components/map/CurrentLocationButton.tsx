import { LocateFixed, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CurrentLocationButtonProps {
  on_click: () => void
  is_locating: boolean
}

export function CurrentLocationButton({ on_click, is_locating }: CurrentLocationButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={on_click}
      disabled={is_locating}
      className="gap-2 shadow-md"
    >
      {is_locating ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LocateFixed size={16} />
      )}
      現在地
    </Button>
  )
}
