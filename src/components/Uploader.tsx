import { useCallback, useRef, useState } from 'react'
import { isSupportedImage } from '../lib/image'

type Props = {
  onFile: (file: File) => void
  compact?: boolean
}

export function Uploader({ onFile, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')

  const take = useCallback(
    (file?: File) => {
      if (!file) return
      if (!isSupportedImage(file)) {
        setError('請上傳 JPG、PNG 或 WebP 圖片')
        return
      }
      setError('')
      onFile(file)
    },
    [onFile],
  )

  if (compact) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => take(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-200/40 hover:bg-white/10"
        >
          重新上傳
        </button>
      </>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => take(e.target.files?.[0])}
      />
      <button
        type="button"
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          take(e.dataTransfer.files[0])
        }}
        onClick={() => inputRef.current?.click()}
        className={`group relative w-full overflow-hidden rounded-3xl border border-dashed px-8 py-20 text-center transition ${
          drag
            ? 'border-amber-200/70 bg-amber-200/8'
            : 'border-white/15 bg-[#12131a] hover:border-amber-200/35 hover:bg-[#161821]'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(600px_circle_at_50%_0%,rgba(196,180,154,0.12),transparent_55%)]" />
        <div className="relative">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-200">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 16V4m0 0 4 4M12 4 8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="font-display text-2xl text-stone-100">拖曳圖片到這裡</p>
          <p className="mt-3 text-sm text-stone-400">
            或點擊選擇檔案 · 支援 JPG、PNG、WebP · 分析全程在瀏覽器完成
          </p>
        </div>
      </button>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={async () => {
            const res = await fetch('/sample.jpg')
            const blob = await res.blob()
            take(new File([blob], 'sample.jpg', { type: 'image/jpeg' }))
          }}
          className="text-sm text-amber-200/80 underline-offset-4 transition hover:text-amber-100 hover:underline"
        >
          載入範例圖片
        </button>
      </div>
      {error ? <p className="mt-3 text-center text-sm text-rose-300">{error}</p> : null}
    </div>
  )
}
