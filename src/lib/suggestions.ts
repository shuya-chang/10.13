import type { AnalysisResult, Suggestion } from '../types'

export function buildSuggestions(result: Omit<AnalysisResult, 'suggestions'>): Suggestion[] {
  const { palette, composition, style } = result
  const items: Suggestion[] = []

  const primary = palette[0]
  const accent = [...palette].reverse().find((c) => c.role === 'accent') ?? palette.at(-1)

  if (style.brightness < 0.22) {
    items.push({
      category: '曝光',
      title: '畫面偏暗，主體容易沉進陰影',
      detail: `平均亮度約 ${Math.round(style.brightness * 100)}%。可提高曝光或補光，讓視覺重心附近的層次更清楚。`,
    })
  } else if (style.brightness > 0.82) {
    items.push({
      category: '曝光',
      title: '畫面偏亮，高光可能失去細節',
      detail: `平均亮度約 ${Math.round(style.brightness * 100)}%。可略降曝光或避開強光，保留亮部紋理。`,
    })
  }

  if (style.contrast < 0.18) {
    items.push({
      category: '對比',
      title: '明暗層次較平',
      detail: '亮度分布集中，畫面容易顯得霧或灰。可加強局部對比，或利用側光拉開明暗差。',
    })
  } else if (style.contrast > 0.55) {
    items.push({
      category: '對比',
      title: '明暗對比較強烈',
      detail: '適合戲劇性題材。若希望更柔和，可降低對比或讓陰影過渡更平滑。',
    })
  }

  if (style.saturation < 0.1) {
    items.push({
      category: '色彩',
      title: '飽和度很低，接近單色',
      detail: '若這是刻意選擇可保留。若想更有色彩層次，可微幅提高飽和，或讓點綴色更集中。',
    })
  } else if (style.saturation > 0.52) {
    items.push({
      category: '色彩',
      title: '整體飽和偏高',
      detail: `主色 ${primary.hex} 佔比 ${Math.round(primary.ratio * 100)}%。可略降全域飽和，只保留點綴色的鮮豔度，避免顏色互相搶戲。`,
    })
  }

  if (accent && accent.ratio < 0.06 && primary.ratio > 0.45) {
    items.push({
      category: '色彩',
      title: '點綴色比例很小',
      detail: `${accent.hex} 僅佔約 ${Math.round(accent.ratio * 100)}%。可在構圖中讓這類顏色佔更大面積，或用服裝、道具加強對比。`,
    })
  }

  const { x, y } = composition.visualCenter
  const centered = Math.hypot(x - 0.5, y - 0.5) < 0.08
  if (centered && composition.thirdsAlignment < 0.72) {
    items.push({
      category: '構圖',
      title: '亮度重心接近畫面正中',
      detail: '居中適合對稱或肖像。若想更有動態，可把重量移向三分線交叉點附近。',
    })
  } else if (composition.thirdsAlignment > 0.78) {
    items.push({
      category: '構圖',
      title: '亮度重心接近三分法交叉點',
      detail: '以像素亮度來看，重量已靠近經典交叉點。可再確認主體是否也落在同一區域（此工具無法辨識主體）。',
    })
  } else if (x < 0.22 || x > 0.78 || y < 0.22 || y > 0.78) {
    items.push({
      category: '構圖',
      title: '視覺重量過於靠近邊緣',
      detail: `重心約在 ${(x * 100).toFixed(0)}%、${(y * 100).toFixed(0)}%。可留更多負空間，或將重量往畫面內側收一點。`,
    })
  }

  if (composition.horizontalSymmetry < 0.55) {
    items.push({
      category: '構圖',
      title: '左右亮度不平衡',
      detail: `左右對稱度約 ${Math.round(composition.horizontalSymmetry * 100)}%。這不一定是缺點；若感覺傾倒，可調整拍攝角度或裁切，讓重量較重的一側留白。`,
    })
  } else if (composition.overallSymmetry > 0.88) {
    items.push({
      category: '構圖',
      title: '畫面亮度高度對稱',
      detail: '適合建築、倒影或正式肖像。若想更有敘事張力，可打破左右平衡，讓視線有行進方向。',
    })
  }

  const maxRegion = Math.max(...composition.regionWeights)
  if (maxRegion > 0.28) {
    const idx = composition.regionWeights.indexOf(maxRegion)
    const names = ['左上', '中上', '右上', '左中', '正中', '右中', '左下', '中下', '右下']
    items.push({
      category: '構圖',
      title: `亮度最集中在${names[idx]}區域`,
      detail: `該區約佔視覺重量 ${Math.round(maxRegion * 100)}%。可考慮是否讓視線從其他區域導向這裡，或裁切多餘的空區。`,
    })
  }

  if (style.warmth > 0.18) {
    items.push({
      category: '色溫',
      title: '整體偏暖',
      detail: '暖色適合黃昏、室內鎢絲燈氛圍。若皮膚或中性色偏黃，可在後製略降色溫。',
    })
  } else if (style.warmth < -0.18) {
    items.push({
      category: '色溫',
      title: '整體偏冷',
      detail: '冷色適合陰天、夜景或科技感。若想更親切，可微幅提高色溫或加入暖色點綴。',
    })
  }

  if (items.length === 0) {
    items.push({
      category: '整體',
      title: '數據顯示畫面相對均衡',
      detail: '亮度、對比與重心都沒有極端偏向。可依題材微調裁切與色調，此工具無法判斷主體是否有趣。',
    })
  }

  items.push({
    category: '限制',
    title: '建議來自像素統計，不是影像理解',
    detail: '無法判斷對焦、表情、故事或物件關係。較複雜的構圖評價需要視覺語言模型（VLM）。',
  })

  return items
}
