import type { PaletteColor } from '../types'

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase()
}

export function luminance(r: number, g: number, b: number): number {
  const toLin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l }
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h, s, l }
}

function rgbToXyz(r: number, g: number, b: number) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const R = f(r)
  const G = f(g)
  const B = f(b)
  return {
    x: R * 0.4124564 + G * 0.3575761 + B * 0.1804375,
    y: R * 0.2126729 + G * 0.7151522 + B * 0.072175,
    z: R * 0.0193339 + G * 0.119192 + B * 0.9503041,
  }
}

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const { x, y, z } = rgbToXyz(r, g, b)
  const xn = 0.95047
  const yn = 1
  const zn = 1.08883
  const e = 216 / 24389
  const k = 24389 / 27
  const f = (t: number) => (t > e ? Math.cbrt(t) : (k * t + 16) / 116)
  const fx = f(x / xn)
  const fy = f(y / yn)
  const fz = f(z / zn)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

function dist2(a: [number, number, number], b: [number, number, number]) {
  const d0 = a[0] - b[0]
  const d1 = a[1] - b[1]
  const d2 = a[2] - b[2]
  return d0 * d0 + d1 * d1 + d2 * d2
}

type Sample = { r: number; g: number; b: number; lab: [number, number, number] }

function samplePixels(data: Uint8ClampedArray, maxSamples: number): Sample[] {
  const pixelCount = data.length / 4
  const stride = Math.max(1, Math.floor(pixelCount / maxSamples))
  const samples: Sample[] = []
  for (let i = 0; i < data.length; i += stride * 4) {
    const a = data[i + 3]
    if (a < 24) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    samples.push({ r, g, b, lab: rgbToLab(r, g, b) })
    if (samples.length >= maxSamples) break
  }
  return samples
}

function kmeansPlusPlus(samples: Sample[], k: number, seed = 1) {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  const centers: [number, number, number][] = []
  centers.push(samples[Math.floor(rand() * samples.length)].lab)
  const minD = new Float64Array(samples.length).fill(Infinity)
  while (centers.length < k) {
    let sum = 0
    for (let i = 0; i < samples.length; i++) {
      const d = dist2(samples[i].lab, centers[centers.length - 1])
      if (d < minD[i]) minD[i] = d
      sum += minD[i]
    }
    let target = rand() * sum
    let idx = samples.length - 1
    for (let i = 0; i < samples.length; i++) {
      target -= minD[i]
      if (target <= 0) {
        idx = i
        break
      }
    }
    centers.push(samples[idx].lab)
  }
  return centers
}

export function extractPalette(
  data: Uint8ClampedArray,
  k = 5,
): PaletteColor[] {
  const samples = samplePixels(data, 8000)
  if (samples.length === 0) {
    return [
      {
        r: 0,
        g: 0,
        b: 0,
        hex: '#000000',
        ratio: 1,
        role: 'primary',
        roleLabel: '主要色',
      },
    ]
  }

  const clusterCount = Math.min(k, samples.length)
  let centers = kmeansPlusPlus(samples, clusterCount)
  const assign = new Int32Array(samples.length)

  for (let iter = 0; iter < 18; iter++) {
    const sums: [number, number, number][] = Array.from({ length: clusterCount }, () => [
      0, 0, 0,
    ])
    const counts = new Float64Array(clusterCount)
    for (let i = 0; i < samples.length; i++) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < clusterCount; c++) {
        const d = dist2(samples[i].lab, centers[c])
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      assign[i] = best
      sums[best][0] += samples[i].lab[0]
      sums[best][1] += samples[i].lab[1]
      sums[best][2] += samples[i].lab[2]
      counts[best]++
    }
    for (let c = 0; c < clusterCount; c++) {
      if (counts[c] === 0) continue
      centers[c] = [
        sums[c][0] / counts[c],
        sums[c][1] / counts[c],
        sums[c][2] / counts[c],
      ]
    }
  }

  const rgbSums = Array.from({ length: clusterCount }, () => [0, 0, 0])
  const counts = new Float64Array(clusterCount)
  for (let i = 0; i < samples.length; i++) {
    const c = assign[i]
    rgbSums[c][0] += samples[i].r
    rgbSums[c][1] += samples[i].g
    rgbSums[c][2] += samples[i].b
    counts[c]++
  }

  const total = samples.length
  const clusters = []
  for (let c = 0; c < clusterCount; c++) {
    if (counts[c] === 0) continue
    const r = rgbSums[c][0] / counts[c]
    const g = rgbSums[c][1] / counts[c]
    const b = rgbSums[c][2] / counts[c]
    clusters.push({
      r,
      g,
      b,
      hex: rgbToHex(r, g, b),
      ratio: counts[c] / total,
      sat: rgbToHsl(r, g, b).s,
    })
  }

  clusters.sort((a, b) => b.ratio - a.ratio)
  const top = clusters.slice(0, 5)
  const ratioSum = top.reduce((s, c) => s + c.ratio, 0)
  const normalized = top.map((c) => ({ ...c, ratio: c.ratio / ratioSum }))

  return normalized.map((c, i) => {
    let role: PaletteColor['role'] = 'secondary'
    let roleLabel = '次要色'
    if (i === 0) {
      role = 'primary'
      roleLabel = '主要色'
    } else if (i >= normalized.length - 1 || (c.ratio < 0.12 && c.sat > 0.28)) {
      role = 'accent'
      roleLabel = '點綴色'
    } else if (i >= 3) {
      role = 'accent'
      roleLabel = '點綴色'
    }
    return {
      r: Math.round(c.r),
      g: Math.round(c.g),
      b: Math.round(c.b),
      hex: c.hex,
      ratio: c.ratio,
      role,
      roleLabel,
    }
  })
}
