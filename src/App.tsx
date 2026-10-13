import { useCallback, useEffect, useRef, useState } from 'react'
import { AnalysisPanel } from './components/AnalysisPanel'
import { ImageStage } from './components/ImageStage'
import { Uploader } from './components/Uploader'
import { analyzeImageData } from './lib/analyze'
import { exportAnalysisPng } from './lib/exportPng'
import { bitmapToAnalysisData, loadImageBitmap } from './lib/image'
import type { AnalysisResult, OverlayId } from './types'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [overlays, setOverlays] = useState<OverlayId[]>(['thirds', 'weight'])
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src)
    }
  }, [src])

  const onFile = useCallback(async (next: File) => {
    setError('')
    setAnalyzing(true)
    setResult(null)
    setFile(next)
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(next)
    })
    try {
      await new Promise((r) => window.setTimeout(r, 40))
      const bmp = await loadImageBitmap(next)
      setBitmap((old) => {
        old?.close()
        return bmp
      })
      const { data, displayWidth, displayHeight } = bitmapToAnalysisData(bmp)
      setResult(analyzeImageData(data, displayWidth, displayHeight))
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失敗，請改試其他圖片')
    } finally {
      setAnalyzing(false)
    }
  }, [])

  function toggleOverlay(id: OverlayId) {
    setOverlays((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]))
  }

  async function handleExport() {
    if (!result || !src) return
    setExporting(true)
    try {
      const image = imgRef.current
      if (image && image.complete) {
        await exportAnalysisPng(image, result, file?.name ?? 'image')
      } else if (bitmap) {
        await exportAnalysisPng(bitmap, result, file?.name ?? 'image')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '匯出失敗')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_-10%,rgba(196,180,154,0.12),transparent_50%),radial-gradient(700px_circle_at_90%_10%,rgba(90,110,140,0.12),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-amber-200/70">STUDIO TOOL</p>
            <h1 className="font-display text-3xl text-stone-50 sm:text-4xl">FrameLab</h1>
            <p className="mt-1 text-sm text-stone-400">圖片構圖與色彩分析器 · 像素在本機完成運算</p>
          </div>
          {src ? (
            <div className="flex flex-wrap items-center gap-2">
              <Uploader compact onFile={onFile} />
              <button
                type="button"
                disabled={!result || exporting || analyzing}
                onClick={handleExport}
                className="rounded-full bg-amber-200 px-4 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {exporting ? '匯出中…' : '匯出 PNG'}
              </button>
            </div>
          ) : null}
        </header>

        {!src ? (
          <main className="flex flex-1 flex-col items-center justify-center pb-16">
            <Uploader onFile={onFile} />
            <p className="mt-8 max-w-lg text-center text-sm leading-6 text-stone-500">
              上傳後會從實際像素擷取代表色、視覺重心、對稱度與風格數據，並給出對應建議。圖片不會傳送到外部伺服器。
            </p>
          </main>
        ) : (
          <main className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div>
              <ImageStage src={src} result={result} overlays={overlays} analyzing={analyzing} />
              <img ref={imgRef} src={src} alt="" className="hidden" />
              {file && result ? (
                <p className="mt-3 text-xs text-stone-500">
                  {file.name} · {result.width} × {result.height}px
                </p>
              ) : null}
            </div>
            {result && !analyzing ? (
              <AnalysisPanel
                result={result}
                overlays={overlays}
                onToggleOverlay={toggleOverlay}
              />
            ) : (
              <section className="rounded-3xl border border-white/8 bg-[#12131a] p-6">
                <div className="h-4 w-28 animate-pulse rounded bg-white/8" />
                <div className="mt-6 space-y-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
                  <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
                  <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
                </div>
              </section>
            )}
          </main>
        )}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <footer className="mt-auto pt-8 text-center text-[11px] text-stone-600">
          FrameLab 使用 Canvas 像素統計，不具備影像語意理解。
        </footer>
      </div>
    </div>
  )
}
