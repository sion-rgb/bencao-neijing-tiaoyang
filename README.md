# 本草內經・體質調養

手機優先、可安裝的繁體中文 PWA，以傳統中醫文化框架整理體質傾向與一般養生方向。整個應用在瀏覽器內以確定性規則運作，沒有 AI、API、後端、登入、追蹤或健康資料上傳。

> 本專案只供傳統中醫文化及養生教育參考，不構成醫療診斷、治療、處方或個人化醫療建議。

## 功能

- 首次使用知情確認及12組安全篩查問題
- 緊急警號立即停止，不生成體質或選材結果
- 43題繁體中文體質問卷，支援上一步、暫存、恢復、跳過選填題與重新開始
- 12種體質／證候傾向、主要及次要傾向、矛盾與資料不足處理
- Level 0–3安全分級；安全資料不參與體質計分
- 白名單、全域禁止清單、條件禁忌及安全欄位完整性閘門
- 經典資料庫、搜尋、分類、收藏及原文／現代整理分欄
- localStorage版本管理、清除所有本機資料、JSON匯出及列印
- PWA離線快取、手機優先響應式介面、鍵盤及ARIA支援
- JSON Schema、build前資料驗證及Vitest測試

## 安裝與開發

需求：Node.js 20或以上、npm 10或以上。

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
npm run typecheck
npm test
npm run build
```

`npm run build`會先執行資料驗證。如選材缺少安全資料、已批准經典缺少來源、禁止選材出現在資料、問題引用不存在的體質，或內容ID失效，build會失敗。輸出位於`dist/`。

## 部署至GitHub Pages

1. 把本專案推送至GitHub repository。
2. 在Repository的 **Settings → Pages**，把Source設為 **GitHub Actions**。
3. 將下列工作流程存為`.github/workflows/deploy.yml`（專案已附上此檔）。
4. 推送至`main`後，Action會驗證、測試、build並部署`dist/`。

本專案使用HashRouter及`base: "./"`，可在repository子路徑運作。

## 部署至Cloudflare Pages

- Framework preset：`Vite`
- Build command：`npm run build`
- Build output directory：`dist`
- Node.js version：20或以上

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
