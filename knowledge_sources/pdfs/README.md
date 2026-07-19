# 本機 PDF 匯入區

把來源 PDF 放入此資料夾後執行：

```powershell
npm install
npm run ingest:pdf
npm run convert:traditional
npm run validate:knowledge
npm run build:knowledge-index
```

只處理單一檔案：

```powershell
npm run ingest:pdf -- --file "knowledge_sources/pdfs/example.pdf"
```

PDF 原檔及本機產生的全文 JSON 預設由 `.gitignore` 排除，不會自動提交到公開 GitHub。請先在 `knowledge_sources/manifests/sources.json` 設定書名、版權狀態及發布權限；`rightsStatus: "unknown"` 必須配合 `publishable: false`。

文字型 PDF 會直接讀取文字層並保留 PDF 頁碼及段落次序。沒有有效文字層的頁面會列入 `needsOcrPages`，不會假裝擷取成功。

## Windows 選配本機 OCR

需要 Python、Tesseract（含 `chi_sim`／`chi_tra` 語言資料）及 Poppler，然後在虛擬環境安裝：

```powershell
py -m venv .venv
.venv\Scripts\python -m pip install -r tools\pdf_ingest\requirements.txt
$env:PYTHON = ".venv\Scripts\python.exe"
npm run ingest:pdf -- --file "knowledge_sources/pdfs/scanned.pdf" --ocr
```

OCR 完全在本機執行，不使用雲端 OCR 或任何 AI API。所有 OCR 條目均標記為 `ocr`、`needs-review` 及 `draft`；低可信內容不得直接發布。
