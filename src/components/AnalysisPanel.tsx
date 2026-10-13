import { useState } from 'react'
import type { AnalysisResult, OverlayId } from '../types'
import { ColorTab } from './ColorTab'
import { CompositionTab } from './CompositionTab'
import { StyleTab } from './StyleTab'
import { SuggestionsTab } from './SuggestionsTab'

type TabId = 'color' | 'composition' | 'style' | 'suggestions'

const tabs: { id: TabId; label: string }[] = [
  { id: 'color', label: '色彩' },
  { id: 'composition', label: '構圖' },
  { id: 'style', label: '風格' },
  { id: 'suggestions', label: '改善建議' },
]

type Props = {
  result: AnalysisResult
  overlays: OverlayId[]
  onToggleOverlay: (id: OverlayId) => void
}

export function AnalysisPanel({ result, overlays, onToggleOverlay }: Props) {
  const [tab, setTab] = useState<TabId>('color')

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/8 bg-[#12131a]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-5">
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-full bg-black/30 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm transition ${
              tab === t.id ? 'bg-white/10 text-stone-50' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {tab === 'color' ? <ColorTab palette={result.palette} /> : null}
        {tab === 'composition' ? (
          <CompositionTab
            composition={result.composition}
            overlays={overlays}
            onToggle={onToggleOverlay}
          />
        ) : null}
        {tab === 'style' ? <StyleTab style={result.style} /> : null}
        {tab === 'suggestions' ? <SuggestionsTab suggestions={result.suggestions} /> : null}
      </div>
    </section>
  )
}
