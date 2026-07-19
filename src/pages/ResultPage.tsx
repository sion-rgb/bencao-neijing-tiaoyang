import { AlertTriangle, BookOpenText, Download, Leaf, Printer, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { APP_CONFIG } from "../config/app";
import { disclaimerParagraphs } from "../content/disclaimer";
import { classics } from "../data/classics/classics";
import { patternMap } from "../data/patterns/patterns";
import { analyseConstitution } from "../engine/scoringEngine";
import { getAllowedIngredients, getLifestyleRecommendation, INGREDIENT_DISCLAIMER } from "../engine/recommendationEngine";
import { assessSafety } from "../engine/safetyEngine";
import { useAppState } from "../state/AppState";
import { exportResult } from "../utils/storage";

const confidenceText = {
  較高: "回答較完整、支持來自多個範疇，而且未見明顯矛盾。這仍不是診斷機率。",
  中等: "已有多個範疇支持，但部分傾向接近或回答仍有變化空間。",
  偏低: "支持範疇較少、回答有矛盾，或仍有較多未回答項目。",
  資料不足: "目前回答不足以形成可靠的體質傾向。"
} as const;

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
        <div className="card"><h2>可信程度：{result.confidence}</h2><p>{confidenceText[result.confidence]}</p></div>
        <button className="button primary full" type="button" onClick={() => navigate("/questionnaire")}>返回問卷繼續回答</button>
        <Link className="button ghost full" to="/guidelines">閱讀使用須知</Link>
      </div>
    );
  }

  const primary = patternMap[result.primary];
  const secondary = result.secondary ? patternMap[result.secondary] : undefined;
  const lifestyle = getLifestyleRecommendation(result.primary);
  const allowedIngredients = getAllowedIngredients(result.primary, safety);
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

      <section className="ingredient-section">
        <div className="section-heading"><span>食療選材參考</span><h2>{safety.allowIngredients ? "先生活，後選材" : "本次不顯示中藥或代茶飲選材"}</h2></div>
        {!safety.allowIngredients ? (
          <div className="notice warning"><AlertTriangle aria-hidden="true" /><div><strong>安全級別 Level {safety.level}</strong><p>{safety.reasons.join("；")}。本工具只提供一般作息、活動及普通食物方向，不顯示中藥名稱、複方、劑量或煎煮方法。</p></div></div>
        ) : allowedIngredients.length ? (
          <><div className="ingredient-grid">{allowedIngredients.map((item) => <article key={item.id} className="ingredient-card"><span>{item.nature}</span><h3>{item.name}</h3><p>{item.traditionalUse}</p><dl><dt>參考形式</dt><dd>{item.suggestedForm}</dd><dt>最長時間</dt><dd>{item.maxDuration}</dd><dt>不適合或應停止</dt><dd>{item.allergyNote}</dd><dt>專業確認</dt><dd>{item.interactionNote}</dd></dl></article>)}</div><p className="ingredient-disclaimer">{INGREDIENT_DISCLAIMER}</p></>
        ) : <div className="notice"><ShieldCheck aria-hidden="true" /><p>即使安全級別允許，目前也沒有同時通過體質配對、禁忌與完整安全資料的選材，因此不提供選材建議。</p></div>}
      </section>

      <section className="classics-result"><div className="card-title"><BookOpenText aria-hidden="true" /><h2>經典依據</h2></div>{classicEntries.map((entry) => <article key={entry.id}><span>{entry.book}・{entry.chapter}</span><blockquote>「{entry.originalText}」</blockquote><p>{entry.modernSummary}</p><a href={entry.sourceUrl} target="_blank" rel="noreferrer">查看公有領域原文來源</a></article>)}</section>

      <section className="safety-summary"><div><span className="kicker">安全提醒</span><h2>建議安全級別：Level {safety.level}</h2></div><ul>{safety.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></section>

      <section className="disclaimer-block"><h2>重要提醒</h2>{disclaimerParagraphs.map((text) => <p key={text}>{text}</p>)}</section>
      <div className="bottom-actions no-print"><button className="button ghost" type="button" onClick={startAgain}><RotateCcw size={18} />重新填寫體質問卷</button><Link className="button secondary" to="/guidelines">查看完整使用須知</Link></div>
    </div>
  );
}
