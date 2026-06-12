import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { process_photo, blob_to_url } from '@/lib/image_utils'
import { toast } from 'sonner'
import { log_error } from '@/lib/logger'

export interface PhotoPreview {
  id: string
  url: string
  blob: Blob
  thumbnail_blob: Blob
  is_existing?: boolean
}

const MAX_PHOTOS = 3

interface PhotoPickerProps {
  photos: PhotoPreview[]
  on_change: (photos: PhotoPreview[]) => void
}

export function PhotoPicker({ photos, on_change }: PhotoPickerProps) {
  const input_ref = useRef<HTMLInputElement>(null)

  const handle_files = async (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      toast.error(`写真は最大${MAX_PHOTOS}枚までです`)
      return
    }

    const to_process = Array.from(files).slice(0, remaining)

    try {
      const new_photos: PhotoPreview[] = []
      for (const file of to_process) {
        const { blob, thumbnail_blob } = await process_photo(file)
        new_photos.push({
          id: crypto.randomUUID(),
          url: blob_to_url(thumbnail_blob),
          blob,
          thumbnail_blob,
        })
      }
      on_change([...photos, ...new_photos])
    } catch (error) {
      log_error('PhotoPicker.handle_files', {}, error)
      toast.error('写真の処理に失敗しました')
    }
  }

  const remove_photo = (id: string) => {
    const removed = photos.find((p) => p.id === id)
    if (removed && !removed.is_existing) {
      URL.revokeObjectURL(removed.url)
    }
    on_change(photos.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative">
            <img
              src={photo.url}
              alt="観察写真"
              className="h-20 w-20 rounded-md border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => remove_photo(photo.id)}
              className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <Button
            type="button"
            variant="outline"
            className="h-20 w-20 flex-col gap-1"
            onClick={() => input_ref.current?.click()}
          >
            <Camera size={20} />
            <span className="text-xs">追加</span>
          </Button>
        )}
      </div>

      <input
        ref={input_ref}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          void handle_files(e.target.files)
          e.target.value = ''
        }}
      />
      <p className="text-xs text-muted-foreground">1〜{MAX_PHOTOS}枚（自動リサイズ）</p>
    </div>
  )
}
