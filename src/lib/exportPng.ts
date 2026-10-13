import type { AnalysisResult } from '../types'

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const chars = [...text]
  let line = ''
  let lineCount = 0
  let cy = y
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy)
      line = ch
      cy += lineHeight
      lineCount++
      if (lineCount >= maxLines - 1) break
    } else {
      line = test
    }
  }
  if (lineCount < maxLines) ctx.fillText(line, x, cy)
  return cy + lineHeight
}

export async function exportAnalysisPng(
  image: HTMLImageElement | ImageBitmap,
  result: AnalysisResult,
  fileName: string,
) {
  const W = 1400
  const H = 900
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('無法建立匯出畫布')

  ctx.fillStyle = '#0b0c10'
  ctx.fillRect(0, 0, W, H)

  const g = ctx.createLinearGradient(0, 0, W, 0)
  g.addColorStop(0, '#1a1814')
  g.addColorStop(1, '#0b0c10')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, 8)

  ctx.fillStyle = '#e8e4dc'
  ctx.font = '600 28px "Noto Sans TC", sans-serif'
  ctx.fillText('FrameLab', 48, 56)
  ctx.fillStyle = '#8a8478'
  ctx.font = '400 16px "Noto Sans TC", sans-serif'
  ctx.fillText('圖片構圖與色彩分析', 180, 54)
  ctx.fillText(
    `${result.width} × ${result.height}px  ·  ${new Date().toLocaleDateString('zh-Hant')}`,
    W - 360,
    54,
  )

  const imgBox = { x: 48, y: 88, w: 720, h: 760 }
  roundRect(ctx, imgBox.x, imgBox.y, imgBox.w, imgBox.h, 16)
  ctx.save()
  ctx.clip()
  ctx.fillStyle = '#14151c'
  ctx.fillRect(imgBox.x, imgBox.y, imgBox.w, imgBox.h)
  const iw = image.width
  const ih = image.height
  const scale = Math.min(imgBox.w / iw, imgBox.h / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = imgBox.x + (imgBox.w - dw) / 2
  const dy = imgBox.y + (imgBox.h - dh) / 2
  ctx.drawImage(image as CanvasImageSource, dx, dy, dw, dh)
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  roundRect(ctx, imgBox.x, imgBox.y, imgBox.w, imgBox.h, 16)
  ctx.stroke()

  let y = 110
  const left = 800
  ctx.fillStyle = '#c4b49a'
  ctx.font = '600 13px "Noto Sans TC", sans-serif'
  ctx.fillText('色彩', left, y)
  y += 18

  for (const color of result.palette) {
    roundRect(ctx, left, y, 52, 52, 8)
    ctx.fillStyle = color.hex
    ctx.fill()
    ctx.fillStyle = '#e8e4dc'
    ctx.font = '600 16px ui-monospace, monospace'
    ctx.fillText(color.hex, left + 68, y + 22)
    ctx.fillStyle = '#8a8478'
    ctx.font = '400 13px "Noto Sans TC", sans-serif'
    ctx.fillText(
      `${color.roleLabel}  ·  ${(color.ratio * 100).toFixed(1)}%`,
      left + 68,
      y + 42,
    )
    y += 64
  }

  y += 8
  ctx.fillStyle = '#c4b49a'
  ctx.font = '600 13px "Noto Sans TC", sans-serif'
  ctx.fillText('風格', left, y)
  y += 28
  ctx.fillStyle = '#e8e4dc'
  ctx.font = '400 15px "Noto Sans TC", sans-serif'
  y = wrapText(ctx, result.style.atmosphere, left, y, 540, 24, 3)

  ctx.fillStyle = '#8a8478'
  ctx.font = '400 13px "Noto Sans TC", sans-serif'
  ctx.fillText(
    `亮度 ${(result.style.brightness * 100).toFixed(0)}%  ·  對比 ${(result.style.contrast * 100).toFixed(0)}%  ·  飽和 ${(result.style.saturation * 100).toFixed(0)}%  ·  ${result.style.temperatureLabel}`,
    left,
    y + 8,
  )
  y += 40

  ctx.fillStyle = '#c4b49a'
  ctx.font = '600 13px "Noto Sans TC", sans-serif'
  ctx.fillText('構圖', left, y)
  y += 28
  ctx.fillStyle = '#e8e4dc'
  ctx.font = '400 15px "Noto Sans TC", sans-serif'
  y = wrapText(ctx, result.composition.summary, left, y, 540, 24, 4)
  y += 12

  ctx.fillStyle = '#c4b49a'
  ctx.font = '600 13px "Noto Sans TC", sans-serif'
  ctx.fillText('改善建議', left, y)
  y += 28
  ctx.fillStyle = '#d7d1c6'
  ctx.font = '400 14px "Noto Sans TC", sans-serif'
  for (const s of result.suggestions.slice(0, 3)) {
    y = wrapText(ctx, `· ${s.title}：${s.detail}`, left, y, 540, 22, 3)
    y += 10
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (!blob) throw new Error('匯出失敗')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const base = fileName.replace(/\.[^.]+$/, '')
  a.href = url
  a.download = `${base}-framelab.png`
  a.click()
  URL.revokeObjectURL(url)
}
