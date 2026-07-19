# 資料模型

## 分層

```text
src/data/questions/        體質問卷與選項權重
src/data/patterns/         12種體質／證候傾向內容
src/data/ingredients/      低風險白名單及完整安全欄位
src/data/safety/           安全問題、禁止清單及分級旗標
src/data/classics/         古籍原文、現代整理與來源
src/data/recommendations/  生活方式建議
src/schemas/               JSON Schema
src/engine/                計分、安全與建議過濾引擎
```

## 問卷

`ConstitutionQuestion`包含唯一ID、範疇、問題、必填狀態及選項。每個選項包含`patternWeights`、`safetyFlags`及`explanationTags`。安全問題另用`SafetyQuestion`，其旗標只傳入安全引擎。

## 計分

每個證候累加權重；舌象的總貢獻在計算時縮放至最多15%。主要結果必須有至少三個不同範疇支持。回答少於最低門檻、分數不足或沒有跨範疇支持時不生成傾向。最高與第二高分差距不超過15%且均達門檻時才顯示混合傾向。矛盾組合會降低可信程度。

## 安全

安全引擎收集旗標後按最嚴格條件決定Level 0–3。漏答或「不確定」視為安全資料不足並失敗關閉。建議引擎只有在Level 3、內容approved、安全欄位完整、體質配對且沒有禁忌旗標時才可回傳最多三項選材。

## 經典

`ClassicEntry`把`originalText`與`modernSummary`分開，並保存`sourceStatus`及`sourceUrl`。正式介面同時要求`reviewStatus === "approved"`及`sourceStatus === "verified"`。

## 本機狀態

`StoredState`保存schemaVersion、同意狀態、安全答案、體質問卷答案、目前步驟及更新時間。版本不兼容或JSON損壞時只清除本機狀態，不作上傳或推測遷移。
