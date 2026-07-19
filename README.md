# 本草內經・體質調養

🌐 **線上使用：**<br>
https://sion-rgb.github.io/bencao-neijing-tiaoyang/

[立即開啟本草內經・體質調養](https://sion-rgb.github.io/bencao-neijing-tiaoyang/) ・ [GitHub Pages 部署狀態](https://github.com/sion-rgb/bencao-neijing-tiaoyang/actions/workflows/deploy.yml)

手機優先、可安裝的繁體中文 PWA，以傳統中醫文化框架整理體質傾向與一般養生方向。整個應用在瀏覽器內以確定性規則運作，沒有 AI、API、後端、登入、追蹤或健康資料上傳。

> 本專案只供傳統中醫文化及養生教育參考，不構成醫療診斷、治療、處方或個人化醫療建議。

## 功能

- 首次使用知情確認及條件式安全篩查；男性不會看到或被計入懷孕／哺乳問題
- 緊急警號立即停止，不生成體質或選材結果
- 43題繁體中文體質問卷，支援上一步、暫存、恢復、跳過選填題與重新開始
- 12種體質／證候傾向；按各證型最大相關分數正規化，並檢查核心證據、跨範疇支持及反向證據
- Level 0–3安全分級；二型糖尿病是獨立注意狀態，不參與體質計分或自動封鎖結果
- 24項固定且可審核的 Formula Library（每個體質至少2項），不會在執行時拼湊藥材或以單味山藥當作完整配伍
- 白名單、全域禁止清單、條件禁忌及安全欄位完整性閘門
- 10書、3,714條Production古籍資料庫；全文搜尋、多欄篩選、收藏、引用複製及繁體轉寫／簡體底本切換
- 完全本機的 PDF 文字層擷取、選配 OCR、OpenCC `s2hk` 轉換、來源雜湊及版權發布閘門
- localStorage版本管理、清除所有本機資料、JSON匯出及列印
- PWA離線快取、手機優先響應式介面、鍵盤及ARIA支援
- JSON Schema、build前資料驗證及Vitest測試

## 安裝與開發

🌐 [先使用線上版本](https://sion-rgb.github.io/bencao-neijing-tiaoyang/)

需求：Node.js 22.13或以上、npm 10或以上。

```bash
npm install
npm run dev
```

開發伺服器會顯示本機網址。資料只會寫入瀏覽器 localStorage。

請勿直接雙擊`dist/index.html`；瀏覽器的`file://`安全限制會阻擋Vite模組。要檢查生產版本，請使用：

```bash
npm run build
npm run preview
```

## 檢查與Build

```bash
npm run validate:data
npm run validate:knowledge
npm run audit:scoring
npm run typecheck
npm test
npm run build
```

`npm run build`會先執行資料驗證、知識庫驗證及Production索引重建。如選材或Formula缺少安全資料、已批准經典缺少來源、禁止選材出現在資料、問題引用不存在的體質、版權狀態不允許發布，或內容ID失效，build會失敗。輸出位於`dist/`。

## 本機 PDF 知識庫

知識流程分成兩層：原始 PDF 及逐行抽取結果只留本機；`src/data/knowledge/published/`只保存已明確分離並批准公開的公有領域古籍文字。公開層及其 metadata 會提交，因此乾淨 clone 不需要 PDF 也可重建完整Production索引。

原始 PDF 放入 `knowledge_sources/pdfs/`，PDF 及 `src/data/knowledge/generated/` 預設受 `.gitignore` 保護。先在 `knowledge_sources/manifests/sources.json` 設定掃描來源；來源檔本身權利不明時必須保持 `rightsStatus: "unknown"` 及 `publishable: false`。

```bash
npm run ingest:pdf
npm run ingest:pdf -- --file knowledge_sources/pdfs/example.pdf
npm run convert:traditional
npm run publish:ancient-text
npm run validate:knowledge
npm run build:knowledge-index
```

流程優先讀取文字層並保存 PDF 頁碼、段落次序、檔名、SHA-256、擷取方法、匯入日期及工具版本。沒有有效文字層的頁面標記為待 OCR；選配本機 OCR 的 Windows 安裝方法見 [`knowledge_sources/pdfs/README.md`](knowledge_sources/pdfs/README.md)。流程不用 OpenAI、Gemini、Claude、雲端 OCR 或任何 API Key。

每段同時保留 `originalTextSimplified`（介面：簡體底本）及 `textTraditional`（介面：繁體轉寫）。OpenCC 使用香港繁體 `s2hk`，再套用 `knowledge_sources/conversion-glossary/tcm-s2hk.json` 的可審核中醫詞表。

`publish:ancient-text`只適合在有本機抽取檔及完成逐書權利／內容判定時執行；它排除封面、目錄、白話譯文、現代導言、註釋、現代啟示及行銷內容，並產生逐書 manifest 與[匯入報告](reports/knowledge-import-report.md)。PDF掃描檔永不公開。`中醫內科方劑索引`只保留明確標出古籍來源的方名、組成等事實資料；`本草綱目`只保留短篇名物／氣味事實，排除現代化的編號主治敘述。

Production 只輸出同時符合 `publishable === true`、版權為 public-domain／licensed／user-owned、且 `reviewStatus === "approved"` 的條目。Build Gate要求10本指定書每本至少50條、索引非空、所有分塊存在。搜尋索引只有短預覽；完整內容按書籍拆成帶內容雜湊的小JSON，使用者搜尋並選取後才lazy-load。未審核OCR、未知版權及draft只留本機，不進入公開Build。

計分以36個指定profile及500份固定種子隨機問卷稽核，結果見[計分審核報告](reports/scoring-audit.md)。開發模式可在`/#/debug/scoring`檢查raw、normalized、核心證據、支持範疇、反向證據、逐題貢獻及混合差距；Production不註冊這個路由。

## Formula Library

固定配伍位於 `src/data/formulas/`。每項必須有唯一 ID、3–6 味固定選材、角色與原因、必要回答組合、排除條件、來源、藥物安全欄位、版本及審核日期。規則引擎只選 approved Formula，絕不從 PDF 關鍵字自動組方。產品設定規則必須清楚標示，不得冒充古方或名家原方；份量只有在 `doseReviewed`、`sourceVerified` 及 `approved` 全部成立時顯示。

## 部署至GitHub Pages

🌐 **目前線上版本：** https://sion-rgb.github.io/bencao-neijing-tiaoyang/

1. 把本專案推送至GitHub repository。
2. 在Repository的 **Settings → Pages**，把Source設為 **GitHub Actions**。
3. 將下列工作流程存為`.github/workflows/deploy.yml`（專案已附上此檔）。
4. 推送至`main`後，Action會驗證、測試、build並部署`dist/`。

本專案使用HashRouter及`base: "./"`，可在repository子路徑運作。

## 部署至Cloudflare Pages

- Framework preset：`Vite`
- Build command：`npm run build`
- Build output directory：`dist`
- Node.js version：22.13或以上

不需要環境變數、Functions、D1、R2或伺服器。

## 加入新問題

1. 在`src/data/questions/constitutionQuestions.ts`新增唯一`id`。
2. 每個選項提供`optionId`、`label`、`patternWeights`、`safetyFlags`及`explanationTags`。
3. 不可讓單一問題成為結論；主要結果必須來自至少三個問題範疇。
4. 舌象問題須使用`category: "tongue"`，引擎會把總貢獻上限限制在15%。
5. 依`src/schemas/question.schema.json`檢查，再執行完整驗證和測試。

## 加入新體質

1. 更新`src/types.ts`內`PatternId`。
2. 在`src/data/patterns/patterns.ts`加入完整內容及唯一ID。
3. 更新相關問題權重、建議與測試。
4. MVP固定為12種；如擴充，需同步更新資料驗證規則與內容審核。

## 加入新經典內容

1. 在`src/data/classics/classics.ts`加入`ClassicEntry`。
2. 原文必須逐字核對公有領域底本，保存篇章與可開啟的`sourceUrl`。
3. 不可把現代整理寫成古文引句；原文與整理分開。
4. 未核實內容只可標記`sourceStatus: "needs-review"`及非`approved`狀態，正式模式不顯示。
5. 不收錄受版權保護的現代譯本全文。

可把符合Schema的陣列存成JSON後執行：

```bash
npm run import:classics -- path/to/classics.json
```

匯入器會驗證每項資料，並拒絕把未核實來源標為approved。

## 加入新選材

1. 只可在`src/data/ingredients/ingredients.ts`的白名單資料加入。
2. 完成寒熱屬性、適用／不適用傾向、懷孕、G6PD、糖尿病、肝腎、交互作用、過敏、形式、最長時間、來源及禁忌旗標。
3. `safetyComplete`未通過時不可設為`approved`，也不可在結果頁顯示。
4. 對照`src/data/safety/prohibited.ts`；禁止選材不可加入劑量、煎法或替代品。
5. 先完成[安全審核清單](docs/safety-review-checklist.md)，再執行完整測試。

## 安全資料審核清單

最低要求：適用範圍、所有指定高風險群組、藥物／手術／出血禁忌、過敏、停止條件、最長時間、來源及審核人紀錄均已完成。詳見[docs/safety-review-checklist.md](docs/safety-review-checklist.md)。安全資料不完整時，系統應不顯示，而不是降級為模糊建議。

## 內容審核流程

`draft → tcm-reviewed → safety-reviewed → approved`

1. 編輯建立draft。
2. 中醫內容審核者檢查概念、用字與古籍來源。
3. 安全審核者檢查禁忌、風險群組、交互作用及停止條件。
4. 指定發布審批者確認兩項審核及測試紀錄後設為approved。
5. 正式build只顯示approved內容；開發模式如日後啟用draft預覽，必須加上明顯標記。

詳見[內容審核清單](docs/content-review-checklist.md)。

## 免責聲明修改位置

- 集中文案：`src/content/disclaimer.ts`
- 首頁短提示：`src/config/app.ts`
- 完整說明文件：`docs/disclaimer.md`

修改後須同時檢查首次確認頁、結果頁與使用須知頁，意思不可削弱。應交由法律與醫療安全專業人士覆核後才發布。

---

🌐 [線上使用本草內經・體質調養](https://sion-rgb.github.io/bencao-neijing-tiaoyang/) ・ [查看GitHub原始碼](https://github.com/sion-rgb/bencao-neijing-tiaoyang)
