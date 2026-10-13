import type { StyleAnalysis } from '../types'
import { Meter } from './Meter'

type Props = { style: StyleAnalysis }

export function StyleTab({ style }: Props) {
  const maxH = Math.max(...style.histogram, 0.0001)
  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-7 text-stone-300">{style.atmosphere}</p>
      <div className="grid gap-4">
        <Meter label="亮度" value={style.brightness} />
        <Meter label="對比度" value={style.contrast} />
        <Meter label="飽和度" value={style.saturation} />
        <Meter
          label="冷暖"
          value={(style.warmth + 1) / 2}
          display={style.temperatureLabel}
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-stone-400">亮度分布</p>
        <div className="flex h-24 items-end gap-px rounded-xl border border-white/8 bg-black/25 px-2 py-2">
          {style.histogram.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-stone-600 to-amber-200"
              style={{ height: `${Math.max(4, (v / maxH) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-stone-500">
          <span>暗部</span>
          <span>亮部</span>
        </div>
      </div>
      <p className="text-xs leading-5 text-stone-500">
        亮度依相對亮度（Rec. 709）計算；對比為亮度標準差；飽和取 HSL；冷暖比較紅色與藍色通道。無法判斷濾鏡名稱或拍攝現場情緒。
      </p>
    </div>
  )
}
