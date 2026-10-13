# FrameLab

圖片構圖與色彩分析器。上傳 JPG、PNG 或 WebP 後，在瀏覽器以 Canvas 像素統計產生色票、構圖指標、風格數據與改善建議，並可匯出 PNG。圖片不會傳送到外部伺服器。

## 本機開發

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

## 技術

- React + Vite + TypeScript
- Tailwind CSS
- Canvas 像素分析（k-means 取色、亮度重心、對稱度、直方圖）

構圖分析沒有影像語意理解能力，無法辨識主體或故事焦點。
