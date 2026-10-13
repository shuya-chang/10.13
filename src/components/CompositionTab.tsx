import type { CompositionAnalysis, OverlayId } from '../types'
import { Meter } from './Meter'

type Props = {
  composition: CompositionAnalysis
  overlays: OverlayId[]
  onToggle: (id: OverlayId) => void
}

const overlayOptions: { id: OverlayId; label: string; hint: string }[] = [
  { id: 'thirds', label: '三分法九宮格', hint: '經典構圖參考線' },
  { id: 'center', label: '中心線', hint: '水平與垂直中軸' },
  { id: 'diagonal', label: '對角線', hint: '動態與引導線參考' },
  { id: 'weight', label: '視覺重心', hint: '亮度加權位置' },
]

export function CompositionTab({ composition, overlays, onToggle }: Props) {
  const names = ['左上', '中上', '右上', '左中', '正中', '右中', '左下', '中下', '右下']
  const maxW = Math.max(...composition.regionWeights, 0.0001)

  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-7 text-stone-300">{composition.summary}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Meter label="左右對稱" value={composition.horizontalSymmetry} />
        <Meter label="上下對稱" value={composition.verticalSymmetry} />
        <Meter label="整體對稱" value={composition.overallSymmetry} />
        <Meter label="靠近三分交叉點" value={composition.thirdsAlignment} />
      </div>
      <div>
        <p className="mb-2 text-sm text-stone-400">九宮格視覺重量</p>
        <div className="grid grid-cols-3 gap-1.5">
          {composition.regionWeights.map((w, i) => (
            <div
              key={names[i]}
              className="rounded-lg border border-white/8 px-2 py-3 text-center"
              style={{ background: `rgba(212, 175, 120, ${0.08 + (w / maxW) * 0.35})` }}
            >
              <div className="text-[11px] text-stone-400">{names[i]}</div>
              <div className="mt-1 text-sm tabular-nums text-stone-100">{(w * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm text-stone-400">構圖輔助線</p>
        <div className="flex flex-wrap gap-2">
          {overlayOptions.map((o) => {
            const on = overlays.includes(o.id)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onToggle(o.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  on
                    ? 'border-amber-200/50 bg-amber-200/15 text-amber-100'
                    : 'border-white/10 bg-white/5 text-stone-300 hover:border-white/20'
                }`}
                title={o.hint}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-amber-200/80">分析限制</p>
        <ul className="space-y-1.5 text-xs leading-5 text-stone-500">
          {composition.limitations.map((t) => (
            <li key={t}>· {t}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
