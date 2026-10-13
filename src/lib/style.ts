import { luminance, rgbToHsl } from './color'
import type { StyleAnalysis } from '../types'

export function analyzeStyle(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): StyleAnalysis {
  const bins = 32
  const histogram = new Array<number>(bins).fill(0)
  let sumL = 0
  let sumL2 = 0
  let sumS = 0
  let sumWarm = 0
  let count = 0
  const step = Math.max(1, Math.floor((width * height) / 12000))

  for (let p = 0; p < width * height; p += step) {
    const i = p * 4
    if (data[i + 3] < 24) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const l = luminance(r, g, b)
    const { s } = rgbToHsl(r, g, b)
    sumL += l
    sumL2 += l * l
    sumS += s
    sumWarm += (r - b) / 255
    histogram[Math.min(bins - 1, Math.floor(l * bins))]++
    count++
  }

  if (count === 0) {
    return {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0,
      temperatureLabel: '中性',
      keyLabel: '無法判斷',
      atmosphere: '影像沒有足夠不透明像素可分析。',
      histogram,
    }
  }

  const brightness = sumL / count
  const variance = Math.max(0, sumL2 / count - brightness * brightness)
  const contrast = Math.min(1, Math.sqrt(variance) * 2.2)
  const saturation = sumS / count
  const warmth = Math.max(-1, Math.min(1, sumWarm / count))

  const temperatureLabel =
    warmth > 0.08 ? '暖色調' : warmth < -0.08 ? '冷色調' : '中性色調'

  let keyLabel = '中間調'
  if (brightness < 0.28) keyLabel = '低調／暗調'
  else if (brightness > 0.72) keyLabel = '高調／明亮'

  const satLabel =
    saturation < 0.12 ? '低飽和、近單色' : saturation > 0.45 ? '高飽和' : '中等飽和'

  const contrastLabel =
    contrast < 0.22 ? '對比較柔' : contrast > 0.48 ? '對比較強' : '對比適中'

  const atmosphere = `${keyLabel}、${temperatureLabel}，整體${satLabel}、${contrastLabel}。`

  const histSum = histogram.reduce((a, b) => a + b, 0) || 1
  return {
    brightness,
    contrast,
    saturation,
    warmth,
    temperatureLabel,
    keyLabel,
    atmosphere,
    histogram: histogram.map((v) => v / histSum),
  }
}
