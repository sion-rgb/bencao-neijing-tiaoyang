import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { constitutionQuestions } from "../src/data/questions/constitutionQuestions";
import { constitutionProfiles } from "../src/data/scoring/constitutionProfiles";
import { analyseConstitution } from "../src/engine/scoringEngine";
import type { AnswerMap, PatternId } from "../src/types";

let seed = 20260720;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const randomAnswers = (): AnswerMap => Object.fromEntries(constitutionQuestions.map((question) => [question.id, [question.options[Math.floor(random() * question.options.length)].optionId]]));
const fixtureResults = constitutionProfiles.map((profile) => {
  const result = analyseConstitution(profile.answers);
  return { id: profile.id, expected: profile.expected, actual: result.primary ?? result.status, passed: result.primary === profile.expected, confidence: result.confidence, normalized: result.normalizedScores[profile.expected], core: result.diagnostics[profile.expected].coreEvidenceSatisfied };
});
const distribution: Record<string, number> = {};
for (let index = 0; index < 500; index += 1) {
  const result = analyseConstitution(randomAnswers());
  const key = result.primary ?? result.status;
  distribution[key] = (distribution[key] ?? 0) + 1;
}
const qiCount = distribution.qiDeficiency ?? 0;
const resultCount = Object.entries(distribution).filter(([key]) => !["insufficient", "no-clear-tendency"].includes(key)).reduce((sum, [, value]) => sum + value, 0);
const report = {
  schemaVersion: 2,
  generatedAt: "2026-07-20T00:00:00.000Z",
  normalization: "weightedEvidenceScore / patternMaximumRelevantScore, with core evidence, category breadth, specificity and contradiction adjustments",
  fixtureSummary: { total: fixtureResults.length, passed: fixtureResults.filter((item) => item.passed).length },
  fixtureResults,
  randomSurvey: { seed: 20260720, count: 500, distribution, qiDeficiencyResultRatio: resultCount ? qiCount / resultCount : 0 }
};
await mkdir(path.join(process.cwd(), "reports"), { recursive: true });
await writeFile(path.join(process.cwd(), "reports", "scoring-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
const rows = Object.entries(distribution).sort((a, b) => b[1] - a[1]).map(([key, count]) => `| ${key} | ${count} | ${(count / 500 * 100).toFixed(1)}% |`).join("\n");
await writeFile(path.join(process.cwd(), "reports", "scoring-audit.md"), `# 體質計分審核報告\n\n- 36 個指定體質 profile：${report.fixtureSummary.passed}/${report.fixtureSummary.total} 符合預期。\n- 500 份固定種子隨機問卷：氣虛佔有效結果 ${(report.randomSurvey.qiDeficiencyResultRatio * 100).toFixed(1)}%。\n- 計分：加權證據 ÷ 該證型最大相關分數，再加入核心證據、範疇廣度、特異性與反向證據。\n\n| 結果 | 數量 | 全部問卷比例 |\n|---|---:|---:|\n${rows}\n`, "utf8");
console.log(`Scoring audit: ${report.fixtureSummary.passed}/${report.fixtureSummary.total} profiles; qi ratio ${(report.randomSurvey.qiDeficiencyResultRatio * 100).toFixed(1)}%.`);
if (report.fixtureSummary.passed !== 36) process.exitCode = 1;
if (report.randomSurvey.qiDeficiencyResultRatio > 0.35) process.exitCode = 1;
