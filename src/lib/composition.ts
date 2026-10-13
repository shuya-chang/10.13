import { luminance } from './color'
import type { CompositionAnalysis } from '../types'

export function analyzeComposition(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): CompositionAnalysis {
  let sumX = 0
  let sumY = 0
  let sumW = 0
  const region = new Float64Array(9)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (data[i + 3] < 24) continue
      const w = luminance(data[i], data[i + 1], data[i + 2])
      sumX += x * w
      sumY += y * w
      sumW += w
      const cx = Math.min(2, Math.floor((x / width) * 3))
      const cy = Math.min(2, Math.floor((y / height) * 3))
      region[cy * 3 + cx] += w
    }
  }

  const visualCenter =
    sumW === 0
      ? { x: 0.5, y: 0.5 }
      : { x: sumX / sumW / (width - 1 || 1), y: sumY / sumW / (height - 1 || 1) }

  const regionSum = region.reduce((a, b) => a + b, 0) || 1
  const regionWeights = Array.from(region, (v) => v / regionSum)

  const horizontalSymmetry = symmetryScore(data, width, height, 'horizontal')
  const verticalSymmetry = symmetryScore(data, width, height, 'vertical')
  const overallSymmetry = (horizontalSymmetry + verticalSymmetry) / 2

  const thirdsPoints = [
    [1 / 3, 1 / 3],
    [2 / 3, 1 / 3],
    [1 / 3, 2 / 3],
    [2 / 3, 2 / 3],
  ]
  let minDist = Infinity
  for (const [tx, ty] of thirdsPoints) {
    const d = Math.hypot(visualCenter.x - tx, visualCenter.y - ty)
    if (d < minDist) minDist = d
  }
  const maxDist = Math.hypot(0.5, 0.5)
  const thirdsAlignment = 1 - Math.min(1, minDist / maxDist)

  const hx = Math.round(visualCenter.x * 100)
  const hy = Math.round(visualCenter.y * 100)
  let summary = `視覺重心約在畫面 ${hx}%（水平）、${hy}%（垂直）。`
  if (overallSymmetry > 0.82) {
    summary += '左右與上下亮度分布相當對稱。'
  } else if (horizontalSymmetry > 0.8) {
    summary += '左右亮度接近鏡像，上下則較不對稱。'
  } else if (verticalSymmetry > 0.8) {
    summary += '上下亮度較為均衡，左右則有明顯偏向。'
  } else {
    summary += '畫面亮度分布偏不對稱，視覺重量較集中於單側或單區。'
  }

  return {
    visualCenter,
    horizontalSymmetry,
    verticalSymmetry,
    overallSymmetry,
    thirdsAlignment,
    regionWeights,
    summary,
    limitations: [
      '視覺重心依亮度加權像素計算，無法辨識人物、主體或故事焦點。',
      '對稱度只比較左右／上下亮度分布，無法判斷建築、臉部或圖案是否真正對稱。',
      '三分法對齊僅衡量亮度重心與交叉點的距離，不代表構圖符合攝影美學。',
      '輔助線為幾何參考，並非 AI 圖像理解。',
    ],
  }
}

function symmetryScore(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  axis: 'horizontal' | 'vertical',
): number {
  let diff = 0
  let count = 0
  const stepX = Math.max(1, Math.floor(width / 80))
  const stepY = Math.max(1, Math.floor(height / 80))

  if (axis === 'horizontal') {
    const half = Math.floor(width / 2)
    for (let y = 0; y < height; y += stepY) {
      for (let x = 0; x < half; x += stepX) {
        const i = (y * width + x) * 4
        const j = (y * width + (width - 1 - x)) * 4
        const a = luminance(data[i], data[i + 1], data[i + 2])
        const b = luminance(data[j], data[j + 1], data[j + 2])
        diff += Math.abs(a - b)
        count++
      }
    }
  } else {
    const half = Math.floor(height / 2)
    for (let y = 0; y < half; y += stepY) {
      for (let x = 0; x < width; x += stepX) {
        const i = (y * width + x) * 4
        const j = ((height - 1 - y) * width + x) * 4
        const a = luminance(data[i], data[i + 1], data[i + 2])
        const b = luminance(data[j], data[j + 1], data[j + 2])
        diff += Math.abs(a - b)
        count++
      }
    }
  }

  if (count === 0) return 0
  return 1 - diff / count
}
