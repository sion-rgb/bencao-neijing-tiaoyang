import { ArrowRight, BookOpenText, Info, Leaf, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_CONFIG, SHORT_DISCLAIMER } from "../config/app";
import { useAppState } from "../state/AppState";

export function HomePage() {
  const { state } = useAppState();
  const hasProgress = Object.keys(state.safetyAnswers).length > 0 || Object.keys(state.questionnaireAnswers).length > 0;
  return (
    <>
      <section className="hero">
        <div className="eyebrow"><Leaf size={16} aria-hidden="true" /> 傳統中醫文化教育工具</div>
        <h1>{APP_CONFIG.name}</h1>
        <p className="hero-subtitle">{APP_CONFIG.subtitle}</p>
        <p className="hero-copy">從日常感受出發，以清楚、可解釋的規則整理體質傾向，並把安全限制放在每項建議之前。</p>
        <div className="hero-actions">
          <Link className="button primary" to={state.consent ? "/safety" : "/consent"}>{hasProgress ? "繼續上次進度" : "開始體質問卷"}<ArrowRight size={18} /></Link>
          <Link className="button secondary" to="/classics"><BookOpenText size={18} />瀏覽中醫經典</Link>
        </div>
        <div className="notice compact" role="note"><ShieldCheck size={20} aria-hidden="true" /><strong>{SHORT_DISCLAIMER}</strong></div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section-heading"><span>使用流程</span><h2 id="how-title">先安全，再理解</h2></div>
        <div className="steps-grid">
          <article className="step-card"><span>01</span><h3>安全篩查</h3><p>緊急警號會立即停止流程；特別狀況只控制建議級別，不參與體質計分。</p></article>
          <article className="step-card"><span>02</span><h3>日常問卷</h3><p>以43題日常語言問題，從多個範疇交叉整理，不用單一答案作結論。</p></article>
          <article className="step-card"><span>03</span><h3>可解釋結果</h3><p>顯示主要回答、傳統原理、生活與飲食方向，以及清楚的安全限制。</p></article>
        </div>
      </section>

      <section className="editorial-band">
        <div><span className="kicker">無AI・無API・不上傳</span><h2>你的回答，只留在這部裝置</h2></div>
        <p>本工具不需要登入，不收集姓名或聯絡資料。你可以隨時清除所有本機資料或匯出自己的結果。</p>
      </section>

      <section className="quick-links" aria-label="其他資料">
        <Link to="/guidelines"><Info aria-hidden="true" /><span><strong>使用須知與保障條款</strong><small>了解限制、緊急警號及責任範圍</small></span><ArrowRight /></Link>
        <Link to="/privacy"><ShieldCheck aria-hidden="true" /><span><strong>私隱與資料控制</strong><small>查看儲存方式及刪除所有資料</small></span><ArrowRight /></Link>
      </section>
    </>
  );
}
