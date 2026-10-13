import type { AnalysisResult, OverlayId } from '../types'

type Props = {
  src: string
  result: AnalysisResult | null
  overlays: OverlayId[]
  analyzing: boolean
}

export function ImageStage({ src, result, overlays, analyzing }: Props) {
  const c = result?.composition.visualCenter

  return (
    <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-3xl border border-white/8 bg-[#101117] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <img
        src={src}
        alt="已上傳圖片預覽"
        className="block max-h-[min(72vh,820px)] max-w-full"
      />
      {overlays.length > 0 ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {overlays.includes('thirds') ? (
            <>
              <line x1="33.333" y1="0" x2="33.333" y2="100" className="stroke-amber-100/55" strokeWidth="0.35" />
              <line x1="66.666" y1="0" x2="66.666" y2="100" className="stroke-amber-100/55" strokeWidth="0.35" />
              <line x1="0" y1="33.333" x2="100" y2="33.333" className="stroke-amber-100/55" strokeWidth="0.35" />
              <line x1="0" y1="66.666" x2="100" y2="66.666" className="stroke-amber-100/55" strokeWidth="0.35" />
            </>
          ) : null}
          {overlays.includes('center') ? (
            <>
              <line x1="50" y1="0" x2="50" y2="100" className="stroke-sky-200/50" strokeWidth="0.35" strokeDasharray="1.6 1.2" />
              <line x1="0" y1="50" x2="100" y2="50" className="stroke-sky-200/50" strokeWidth="0.35" strokeDasharray="1.6 1.2" />
            </>
          ) : null}
          {overlays.includes('diagonal') ? (
            <>
              <line x1="0" y1="0" x2="100" y2="100" className="stroke-rose-200/45" strokeWidth="0.35" />
              <line x1="100" y1="0" x2="0" y2="100" className="stroke-rose-200/45" strokeWidth="0.35" />
            </>
          ) : null}
          {overlays.includes('weight') && c ? (
            <>
              <circle cx={c.x * 100} cy={c.y * 100} r="3.2" className="fill-amber-300/20 stroke-amber-200" strokeWidth="0.5" />
              <circle cx={c.x * 100} cy={c.y * 100} r="0.9" className="fill-amber-100" />
            </>
          ) : null}
        </svg>
      ) : null}
      {analyzing ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-sm text-stone-100">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200/20 border-t-amber-200" />
            正在分析像素…
          </div>
        </div>
      ) : null}
    </div>
  )
}
