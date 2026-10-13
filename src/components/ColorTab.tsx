import { useState } from 'react'
import type { PaletteColor } from '../types'

type Props = { palette: PaletteColor[] }

export function ColorTab({ palette }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      window.setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1400)
    } catch {
      setCopied('error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex h-16 overflow-hidden rounded-2xl">
        {palette.map((c) => (
          <div
            key={c.hex + c.ratio}
            className="transition hover:brightness-110"
            style={{ background: c.hex, width: `${c.ratio * 100}%` }}
            title={`${c.hex} ${(c.ratio * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <ul className="space-y-3">
        {palette.map((c) => (
          <li
            key={c.hex + c.roleLabel}
            className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-white/16 hover:bg-white/[0.05]"
          >
            <div
              className="h-14 w-14 shrink-0 rounded-xl border border-white/10 shadow-inner"
              style={{ background: c.hex }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copy(c.hex)}
                  className="font-mono text-base tracking-wide text-stone-100 transition hover:text-amber-200"
                  title="複製色碼"
                >
                  {c.hex}
                </button>
                {copied === c.hex ? (
                  <span className="text-xs text-amber-200">已複製</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-stone-400">
                {c.roleLabel} · 佔比 {(c.ratio * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-16 text-right text-xs text-stone-500">
              RGB
              <br />
              {c.r},{c.g},{c.b}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-5 text-stone-500">
        色票由像素 k-means 分群得到，依面積占比標記主要色、次要色與點綴色。點擊 HEX 可複製。
      </p>
    </div>
  )
}
