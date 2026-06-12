/** 写真をリサイズしてストレージ容量を節約する */

const MAX_WIDTH = 1280
const MAX_HEIGHT = 1280
const THUMB_SIZE = 200
const JPEG_QUALITY = 0.85

function load_image(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像の読み込みに失敗しました'))
    }
    img.src = url
  })
}

function canvas_to_blob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Blob変換に失敗しました'))
      },
      'image/jpeg',
      quality,
    )
  })
}

async function resize_to_canvas(
  img: HTMLImageElement,
  max_w: number,
  max_h: number,
): Promise<HTMLCanvasElement> {
  let { width, height } = img
  const ratio = Math.min(max_w / width, max_h / height, 1)
  width = Math.round(width * ratio)
  height = Math.round(height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context取得失敗')
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

export async function process_photo(file: File): Promise<{
  blob: Blob
  thumbnail_blob: Blob
}> {
  const img = await load_image(file)
  const main_canvas = await resize_to_canvas(img, MAX_WIDTH, MAX_HEIGHT)
  const thumb_canvas = await resize_to_canvas(img, THUMB_SIZE, THUMB_SIZE)

  const [blob, thumbnail_blob] = await Promise.all([
    canvas_to_blob(main_canvas, JPEG_QUALITY),
    canvas_to_blob(thumb_canvas, 0.7),
  ])

  return { blob, thumbnail_blob }
}

export function blob_to_url(blob: Blob): string {
  return URL.createObjectURL(blob)
}
