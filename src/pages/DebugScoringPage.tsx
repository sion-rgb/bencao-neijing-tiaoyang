import { patternMap } from "../data/patterns/patterns";
import { analyseConstitution } from "../engine/scoringEngine";
import { useAppState } from "../state/AppState";

export function DebugScoringPage() {
  const { state } = useAppState();
  const result = analyseConstitution(state.questionnaireAnswers);
  const ordered = Object.entries(result.diagnostics).sort((a, b) => b[1].finalScore - a[1].finalScore);
  return <div className="content-page"><div className="page-intro"><span className="kicker">DEV ONLY</span><h1>計分稽核</h1><p>此路由只在開發模式存在；Production 不註冊也不顯示。</p></div>
    <section className="feature-card"><h2>結果摘要</h2><dl className="detail-grid"><div><dt>狀態</dt><dd>{result.status}</dd></div><div><dt>主要／次要</dt><dd>{result.primary ?? "—"} / {result.secondary ?? "—"}</dd></div><div><dt>混合差距</dt><dd>{result.rankingGap?.toFixed(4) ?? "—"}</dd></div><div><dt>回答數</dt><dd>{result.answeredCount}</dd></div></dl></section>
    <div className="debug-score-grid">{ordered.map(([patternId, diagnostic]) => <article className="result-card" key={patternId}><h2>{patternMap[patternId as keyof typeof patternMap].name}</h2><dl><dt>raw / maximum</dt><dd>{diagnostic.weightedEvidenceScore} / {diagnostic.patternMaximumRelevantScore}</dd><dt>normalized / final</dt><dd>{diagnostic.normalizedScore} / {diagnostic.finalScore}</dd><dt>support / categories</dt><dd>{diagnostic.supportCount} / {diagnostic.supportCategories.join("、")}</dd><dt>specificity</dt><dd>{diagnostic.specificityScore}</dd><dt>core</dt><dd>{diagnostic.coreEvidenceSatisfied.join("、") || "無"}（需 {diagnostic.coreEvidenceRequired} 組）</dd><dt>contradictions</dt><dd>{diagnostic.contradictionCount}</dd><dt>eligible</dt><dd>{String(diagnostic.eligible)}</dd></dl><details><summary>逐題貢獻</summary><pre>{JSON.stringify(diagnostic.contributions, null, 2)}</pre></details></article>)}</div>
  </div>;
}
