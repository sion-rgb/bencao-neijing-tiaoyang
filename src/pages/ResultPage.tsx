import { AlertTriangle, BookOpenText, Download, Leaf, Printer, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { APP_CONFIG } from "../config/app";
import { disclaimerParagraphs } from "../content/disclaimer";
import { classics } from "../data/classics/classics";
import { ingredients } from "../data/ingredients/ingredients";
import { patternMap } from "../data/patterns/patterns";
import { getDailyFoodDirections } from "../data/recommendations/foodDirections";
import { analyseConstitution } from "../engine/scoringEngine";
import { getApprovedFormulas, getLifestyleRecommendation, INGREDIENT_DISCLAIMER } from "../engine/recommendationEngine";
import { assessSafety } from "../engine/safetyEngine";
import { useAppState } from "../state/AppState";
import { exportResult } from "../utils/storage";
import type { SafetyAssessment } from "../types";

const confidenceText = {
  較高: "回答較完整、支持來自多個範疇，而且未見明顯矛盾。這仍不是診斷機率。",
  中等: "已有多個範疇支持，但部分傾向接近或回答仍有變化空間。",
  偏低: "支持範疇較少、回答有矛盾，或仍有較多未回答項目。",
  資料不足: "目前回答不足以形成可靠的體質傾向。"
} as const;

function MedicalNoticeCards({ safety }: { safety: SafetyAssessment }) {
  const hasType2 = safety.medicalNotices.includes("type2-diabetes");
  const hasMedication = safety.medicalNotices.includes("glucose-lowering-medication") || safety.medicalNotices.includes("insulin-use");
  if (!hasType2 && !hasMedication) return null;
  return (
    <section className="medical-notices" aria-label="糖尿病使用者注意事項">
      {hasType2 && <article className="notice warning medical-notice-card"><AlertTriangle aria-hidden="true" /><div><h2>二型糖尿病使用者注意事項</h2><p>你已表示有二型糖尿病。本工具仍可按你提供的傳統中醫症狀整理體質及溫和配伍參考，但結果不代表血糖控制情況，也不應用作更改胰島素、降血糖藥或原有治療。</p><ul><li>本工具的中醫體質結果不代表血糖控制情況，亦不提供降血糖保證。</li><li>不應因本結果自行停用、減少或更改胰島素或降血糖藥。</li><li>食療、代茶飲及中藥配伍也可能影響個人身體反應；開始新的配伍後，應留意身體反應及原有血糖監測安排。</li><li>如出現冒冷汗、發抖、心悸、頭暈、神志不清、嚴重口渴、不斷小便、噁心、嘔吐或呼吸異常，停止使用本工具並尋求協助。</li></ul></div></article>}
      {hasMedication && <article className="notice danger medical-notice-card"><AlertTriangle aria-hidden="true" /><div><h2>胰島素／降血糖藥加強注意事項</h2><p>你仍可查看體質結果，但只會顯示已完成糖尿病用藥安全欄位審核的固定配伍。未完成交互作用資料的配伍不會顯示，系統不會猜測安全性。</p><p>任何配伍都不得代替藥物，也不應用作自行減藥或停藥；本工具不提供以「降血糖」為目的的建議。</p></div></article>}
    </section>
  );
}

export function ResultPage() {
  const { state, resetQuestionnaire } = useAppState();
  const navigate = useNavigate();
  const safety = assessSafety(state.safetyAnswers);
  if (safety.level === 0) return <Navigate to="/emergency" replace />;
  const result = analyseConstitution(state.questionnaireAnswers);

  const startAgain = () => {
    resetQuestionnaire();
    navigate("/questionnaire");
  };

  if (result.status !== "result" || !result.primary) {
    return (
      <div className="narrow-page result-empty">
        <span className="kicker">分析結果</span>
        <h1>{result.status === "insufficient" ? "目前資料不足" : "目前未見明顯偏向"}</h1>
        <p>{result.status === "insufficient" ? `你目前回答了 ${result.answeredCount} 題。為避免強行生成結果，請先完成更多不同範疇的問題。` : "各項分數未達到跨三個範疇的最低支持條件，因此不會強行指定單一體質。"}</p>
        <MedicalNoticeCards safety={safety} />
        <div className="card"><h2>可信程度：{result.confidence}</h2><p>{confidenceText[result.confidence]}</p></div>
        <button className="button primary full" type="button" onClick={() => navigate("/questionnaire")}>返回問卷繼續回答</button>
        <Link className="button ghost full" to="/guidelines">閱讀使用須知</Link>
      </div>
    );
  }

  const primary = patternMap[result.primary];
  const secondary = result.secondary ? patternMap[result.secondary] : undefined;
  const lifestyle = getLifestyleRecommendation(result.primary);
  const dailyFoodDirections = getDailyFoodDirections(result.primary);
  const selectedFormulas = getApprovedFormulas(result.primary, state.questionnaireAnswers, safety);
  const classicEntries = classics.filter((entry) => primary.classicIds.includes(entry.id) && entry.reviewStatus === "approved" && entry.sourceStatus === "verified");
  const exported = {
    app: { name: APP_CONFIG.name, version: APP_CONFIG.version },
    createdAt: new Date().toISOString(),
    result: { primary: primary.name, secondary: secondary?.name, confidence: result.confidence, evidence: result.evidence, mixed: result.mixed },
    safety: { level: safety.level, reasons: safety.reasons },
    notice: disclaimerParagraphs[0]
  };

  return (
    <div className="result-page">
      <div className="result-header">
        <div><span className="kicker">你的體質傾向</span><h1>較接近「{primary.shortName}{secondary ? `夾${secondary.shortName}` : ""}傾向」</h1><p>根據目前回答整理；使用的是確定性規則，不是醫療診斷或概率。</p></div>
        <div className="result-actions no-print">
          <button type="button" className="icon-button" onClick={() => exportResult(exported)}><Download size={18} />匯出 JSON</button>
          <button type="button" className="icon-button" onClick={() => window.print()}><Printer size={18} />列印</button>
        </div>
      </div>

      <section className="result-hero-card">
        <div className="seal" aria-hidden="true">{primary.shortName.slice(0, 2)}</div>
        <div><span>主要體質傾向</span><h2>{primary.name}</h2>{secondary && <p>次要體質傾向：{secondary.name}</p>}</div>
        <div className="confidence"><span>可信程度</span><strong>{result.confidence}</strong><small>{result.contradictory ? "部分回答互相矛盾，已降低可信程度" : confidenceText[result.confidence]}</small></div>
      </section>

      <div className="result-grid">
        <section className="result-card"><div className="card-title"><Sparkles aria-hidden="true" /><h2>主要依據</h2></div><ul className="evidence-list">{result.evidence.map((item) => <li key={item}>{item}</li>)}</ul><p className="card-footnote">主要結果獲得 {result.categorySupport[result.primary].length} 個不同範疇支持；單一答案不會決定結果。</p></section>
        <section className="result-card"><div className="card-title"><Leaf aria-hidden="true" /><h2>傳統中醫理解</h2></div><p>{primary.principle}</p>{secondary && <p>次要的{secondary.shortName}表現亦較接近，但只在分數與主要傾向非常接近時列出。</p>}</section>
        <section className="result-card"><div className="card-title"><ShieldCheck aria-hidden="true" /><h2>調養重點</h2></div><ul>{primary.priorities.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="result-card"><h2>適合的生活習慣</h2><ul>{primary.habits.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="result-card"><h2>飲食方向</h2><ul>{primary.foodDirections.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul><p className="card-footnote">只列食物類別與一般方向，不把任何食物稱為治療。</p></section>
        <section className="result-card"><h2>應少做的事情</h2><ul>{primary.avoid.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>

      <section className="feature-card">
        <div className="feature-label">傳統養生方向</div>
        <h2>{lifestyle.title}</h2>
        <p>{lifestyle.principle}</p>
        <dl className="detail-grid"><div><dt>建議方式</dt><dd>{lifestyle.method}</dd></div><div><dt>建議時間</dt><dd>{lifestyle.timing}</dd></div><div><dt>最長使用期</dt><dd>{lifestyle.maxDuration}</dd></div><div><dt>不適合情況</dt><dd>{lifestyle.unsuitableFor}</dd></div><div><dt>何時停止</dt><dd>{lifestyle.stopWhen}</dd></div><div><dt>是否需確認</dt><dd>{lifestyle.professionalReview}</dd></div></dl>
      </section>

      <MedicalNoticeCards safety={safety} />

      <section className="ingredient-section">
        <div className="section-heading"><span>日常食材方向</span><h2>普通食物，不稱為配方</h2></div>
        <div className="result-card"><ul>{dailyFoodDirections.map((direction) => <li key={direction}>{direction}</li>)}</ul><p className="card-footnote">二型糖尿病使用者應按原有膳食及血糖監測安排處理份量；這些方向不代表可改善或控制血糖。</p></div>
      </section>

      <section className="ingredient-section formula-section">
        <div className="section-heading"><span>完整溫和配伍參考</span><h2>{safety.allowApprovedFormulas ? "只從固定且已批准的 Formula Library 選擇" : "本次不顯示中藥或代茶飲配伍"}</h2></div>
        {!safety.allowApprovedFormulas ? (
          <div className="notice warning"><AlertTriangle aria-hidden="true" /><div><strong>安全級別 Level {safety.level}</strong><p>{safety.reasons.join("；")}。本工具只提供一般作息、活動及普通食物方向，不顯示中藥名稱、複方、劑量或煎煮方法。</p></div></div>
        ) : selectedFormulas.length ? selectedFormulas.map(({ formula, ingredients: formulaIngredients, selectionReasons }) => (
          <article key={formula.formulaId} className="feature-card formula-card">
            <div className="feature-label">審核狀態：{formula.reviewStatus}・版本 {formula.version}</div>
            <h2>{formula.name}</h2>
            <p><strong>適用體質傾向：</strong>{formula.suitablePatterns.map((id) => patternMap[id].name).join("、")}</p>
            <h3>配伍組成</h3>
            <ul className="formula-ingredients">{formulaIngredients.map((item) => {
              const ingredient = ingredients.find((candidate) => candidate.id === item.ingredientId);
              return <li key={item.ingredientId}><strong>{ingredient?.name ?? item.ingredientId}</strong><span>{item.role}</span><p>{item.reason}</p></li>;
            })}</ul>
            <dl className="detail-grid"><div><dt>傳統中醫配伍思路</dt><dd>{formula.traditionalRationale}</dd></div><div><dt>選擇原因</dt><dd>{selectionReasons.join("；")}</dd></div><div><dt>不適合情況</dt><dd>{formula.unsuitableWhen.join("；")}</dd></div><div><dt>使用形式</dt><dd>{formula.usageForm}</dd></div><div><dt>停止條件</dt><dd>{formula.stopConditions.join("；")}</dd></div><div><dt>來源依據</dt><dd>{formula.sourceReferences.map((source) => `${source.title}${source.note ? `（${source.note}）` : ""}`).join("；")}</dd></div></dl>
            {formula.doseText && formula.doseReviewed && formula.sourceVerified && formula.reviewStatus === "approved" && <p><strong>經審核份量：</strong>{formula.doseText}</p>}
            <p className="ingredient-disclaimer">{INGREDIENT_DISCLAIMER}</p>
          </article>
        )) : <div className="notice"><ShieldCheck aria-hidden="true" /><div><strong>目前沒有符合全部條件的已審核配伍</strong><p>{safety.medicalNotices.includes("glucose-lowering-medication") ? "正在使用胰島素或降血糖藥時，未完成相關用藥安全欄位的配伍不會顯示。" : "完整配伍需要至少三項氣虛表現及一項脾胃表現；單一疲倦或單一山藥不會形成配伍。"}</p></div></div>}
      </section>

      <section className="classics-result"><div className="card-title"><BookOpenText aria-hidden="true" /><h2>經典依據</h2></div>{classicEntries.map((entry) => <article key={entry.id}><span>{entry.book}・{entry.chapter}</span><blockquote>「{entry.originalText}」</blockquote><p>{entry.modernSummary}</p><a href={entry.sourceUrl} target="_blank" rel="noreferrer">查看公有領域原文來源</a></article>)}</section>

      <section className="safety-summary"><div><span className="kicker">安全提醒</span><h2>建議安全級別：Level {safety.level}</h2></div><ul>{safety.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></section>

      <section className="disclaimer-block"><h2>重要提醒</h2>{disclaimerParagraphs.map((text) => <p key={text}>{text}</p>)}</section>
      <div className="bottom-actions no-print"><button className="button ghost" type="button" onClick={startAgain}><RotateCcw size={18} />重新填寫體質問卷</button><Link className="button secondary" to="/guidelines">查看完整使用須知</Link></div>
    </div>
  );
}
