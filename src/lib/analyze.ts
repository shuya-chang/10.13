import type { AnalysisResult } from '../types'
import { extractPalette } from './color'
import { analyzeComposition } from './composition'
import { analyzeStyle } from './style'
import { buildSuggestions } from './suggestions'

export function analyzeImageData(
  imageData: ImageData,
  originalWidth: number,
  originalHeight: number,
): AnalysisResult {
  const { data, width, height } = imageData
  const palette = extractPalette(data)
  const composition = analyzeComposition(data, width, height)
  const style = analyzeStyle(data, width, height)
  const base = {
    width: originalWidth,
    height: originalHeight,
    palette,
    composition,
    style,
  }
  return {
    ...base,
    suggestions: buildSuggestions(base),
  }
}
