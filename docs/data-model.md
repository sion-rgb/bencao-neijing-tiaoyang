# 資料模型

## 分層

```text
src/data/questions/        體質問卷與選項權重
src/data/patterns/         12種體質／證候傾向內容
src/data/ingredients/      低風險白名單及完整安全欄位
src/data/formulas/         固定、可審核、不可動態拼湊的配伍庫
src/data/safety/           安全問題、禁止清單及分級旗標
src/data/classics/         古籍原文、現代整理與來源
src/data/recommendations/  生活方式建議
src/data/knowledge/        PDF知識條目型別、本機全文輸出、索引與清單
knowledge_sources/         PDF來源、版權設定、轉換詞表及拒絕區
tools/                     本機PDF擷取、OCR、繁體轉換及索引工具
src/schemas/               JSON Schema
src/engine/                計分、安全與建議過濾引擎
```

## 問卷

`ConstitutionQuestion`包含唯一ID、範疇、問題、必填狀態及選項。每個選項包含`patternWeights`、`safetyFlags`及`explanationTags`。安全問題另用`SafetyQuestion`，其旗標只傳入安全引擎。`QuestionVisibilityRule`支援答案相等或答案集合；進度只計可見題，答案變更後會清除變成隱藏的答案。

## 計分

每個證候累加權重；舌象的總貢獻在計算時縮放至最多15%。主要結果必須有至少三個不同範疇支持。回答少於最低門檻、分數不足或沒有跨範疇支持時不生成傾向。最高與第二高分差距不超過15%且均達門檻時才顯示混合傾向。矛盾組合會降低可信程度。

## 安全

安全引擎只收集目前可見問題的旗標，再按最嚴格條件決定Level 0–3。漏答可見題或「不確定」視為安全資料不足。二型糖尿病、降血糖藥及胰島素以`MedicalNoticeFlag`獨立表示；二型糖尿病本身不降級、不計分、不封鎖體質結果。用藥者只可看到`diabetesMedicationReviewed`及相應`insulinUseReviewed`完成的Formula。

## Formula Library

`FormulaDefinition`保存唯一ID、3–6味固定選材、`FormulaIngredientRole`、必要回答群組、排除旗標、停止條件、來源、審核狀態、版本、更新日期及`FormulaMedicationSafety`。引擎只選擇approved且安全欄位完整的固定資料；未符合`doseReviewed && sourceVerified && approved`時不顯示份量。

## 經典

`ClassicEntry`把`originalText`與`modernSummary`分開，並保存`sourceStatus`及`sourceUrl`。正式介面同時要求`reviewStatus === "approved"`及`sourceStatus === "verified"`。

`KnowledgeEntry`逐段保存簡體底本、香港繁體轉寫、PDF頁碼、段落順序、檔名、SHA-256、擷取／轉換方法、版權、發布及審核狀態。Production另要求`publishable`、允許的`rightsStatus`及approved；全文按書籍分塊，搜尋索引只保存短預覽與分塊位置。

## 本機狀態

`StoredState`保存schemaVersion、同意狀態、安全答案、體質問卷答案、目前步驟及更新時間。版本不兼容或JSON損壞時只清除本機狀態，不作上傳或推測遷移。
