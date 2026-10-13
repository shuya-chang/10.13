import { describe, expect, it } from 'vitest'
import { extractPalette, rgbToHex } from './color'
import { analyzeComposition } from './composition'
import { analyzeStyle } from './style'
import { analyzeImageData } from './analyze'

function makeData(
  fill: (x: number, y: number, i: number, data: Uint8ClampedArray) => void,
  w = 40,
  h = 40,
) {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      fill(x, y, (y * w + x) * 4, data)
    }
  }
  return { data, width: w, height: h }
}

function solidImage(r: number, g: number, b: number, w = 40, h = 40) {
  return makeData((_x, _y, i, data) => {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }, w, h)
}

function splitImage() {
  return makeData((x, _y, i, data) => {
    const left = x < 30
    const v = left ? 230 : 18
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
    data[i + 3] = 255
  }, 60, 40)
}

describe('color helpers', () => {
  it('formats hex', () => {
    expect(rgbToHex(255, 0, 16)).toBe('#FF0010')
  })

  it('extracts dominant color from a solid image', () => {
    const img = solidImage(10, 120, 200)
    const palette = extractPalette(img.data, 5)
    expect(palette.length).toBeGreaterThan(0)
    expect(palette[0].hex).toBe('#0A78C8')
    expect(palette[0].ratio).toBeGreaterThan(0.9)
    expect(palette[0].role).toBe('primary')
  })
})

describe('composition', () => {
  it('finds visual weight on the brighter side', () => {
    const img = splitImage()
    const c = analyzeComposition(img.data, img.width, img.height)
    expect(c.visualCenter.x).toBeLessThan(0.5)
    expect(c.horizontalSymmetry).toBeLessThan(0.85)
  })
})

describe('style', () => {
  it('classifies a dark image as low key', () => {
    const img = solidImage(8, 8, 12)
    const s = analyzeStyle(img.data, img.width, img.height)
    expect(s.brightness).toBeLessThan(0.2)
    expect(s.keyLabel).toContain('暗')
  })
})

describe('full analysis', () => {
  it('returns palette, composition, style and suggestions', () => {
    const img = splitImage()
    const result = analyzeImageData(img as ImageData, 1200, 800)
    expect(result.palette.length).toBeGreaterThanOrEqual(2)
    expect(result.width).toBe(1200)
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.style.atmosphere.length).toBeGreaterThan(0)
    const hexes = new Set(result.palette.map((p) => p.hex))
    expect(hexes.size).toBeGreaterThan(1)
  })
})
