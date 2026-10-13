export type ColorRole = 'primary' | 'secondary' | 'accent'

export type PaletteColor = {
  r: number
  g: number
  b: number
  hex: string
  ratio: number
  role: ColorRole
  roleLabel: string
}

export type CompositionAnalysis = {
  visualCenter: { x: number; y: number }
  horizontalSymmetry: number
  verticalSymmetry: number
  overallSymmetry: number
  thirdsAlignment: number
  regionWeights: number[]
  summary: string
  limitations: string[]
}

export type StyleAnalysis = {
  brightness: number
  contrast: number
  saturation: number
  warmth: number
  temperatureLabel: string
  keyLabel: string
  atmosphere: string
  histogram: number[]
}

export type Suggestion = {
  category: string
  title: string
  detail: string
}

export type AnalysisResult = {
  width: number
  height: number
  palette: PaletteColor[]
  composition: CompositionAnalysis
  style: StyleAnalysis
  suggestions: Suggestion[]
}

export type OverlayId = 'thirds' | 'center' | 'diagonal' | 'weight'
