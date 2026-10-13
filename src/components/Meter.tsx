type Props = {
  label: string
  value: number
  display?: string
}

export function Meter({ label, value, display }: Props) {
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-stone-400">{label}</span>
        <span className="tabular-nums text-stone-200">{display ?? `${pct.toFixed(0)}%`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-stone-500 to-amber-200 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
