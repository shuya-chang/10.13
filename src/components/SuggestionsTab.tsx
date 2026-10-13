import type { Suggestion } from '../types'

type Props = { suggestions: Suggestion[] }

export function SuggestionsTab({ suggestions }: Props) {
  return (
    <div className="space-y-3">
      {suggestions.map((s) => (
        <article
          key={s.title}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/14"
        >
          <p className="text-[11px] tracking-widest text-amber-200/80">{s.category}</p>
          <h3 className="mt-1 text-[15px] text-stone-100">{s.title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-400">{s.detail}</p>
        </article>
      ))}
    </div>
  )
}
