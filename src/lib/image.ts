const MAX_ANALYSIS = 360

export async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file, { imageOrientation: 'from-image' })
}

export function bitmapToAnalysisData(bitmap: ImageBitmap): {
  data: ImageData
  displayWidth: number
  displayHeight: number
} {
  const scale = Math.min(1, MAX_ANALYSIS / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('無法建立 Canvas 繪圖環境')
  ctx.drawImage(bitmap, 0, 0, width, height)
  return {
    data: ctx.getImageData(0, 0, width, height),
    displayWidth: bitmap.width,
    displayHeight: bitmap.height,
  }
}

export function isSupportedImage(file: File): boolean {
  const type = file.type.toLowerCase()
  if (['image/jpeg', 'image/png', 'image/webp'].includes(type)) return true
  const name = file.name.toLowerCase()
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')
}
