import { constitutionQuestions } from "../data/questions/constitutionQuestions";
import { patterns } from "../data/patterns/patterns";
import { diagnosticRuleMap } from "../data/scoring/diagnosticRules";
import type { AnalysisResult, AnswerMap, PatternId, PatternScoreDiagnostic, QuestionCategory } from "../types";

const MIN_ANSWERED = 24;
const MIXED_GAP_RATIO = 0.1;
const contradictionPairs: Array<[string, string]> = [
  ["body_temperature_cold", "body_climate_hot"], ["body_temperature_hot", "body_climate_cold"],
  ["digestion_stool_dry", "digestion_stool_loose"], ["skin_texture_dry", "skin_texture_oily"],
  ["tongue_color_pale", "tongue_color_red"]
];

const blankNumberRecord = () => Object.fromEntries(patterns.map((pattern) => [pattern.id, 0])) as Record<PatternId, number>;

function maximumRelevantScore(patternId: PatternId) {
  return constitutionQuestions.reduce((sum, question) => sum + Math.max(0, ...question.options.map((option) => option.patternWeights[patternId] ?? 0)), 0);
}

function selectedDetails(answers: AnswerMap) {
  return constitutionQuestions.flatMap((question) => (answers[question.id] ?? []).flatMap((optionId) => {
    const option = question.options.find((candidate) => candidate.optionId === optionId);
    return option ? [{ question, option }] : [];
  }));
}

export function calculateTongueShare(answers: AnswerMap): number {
  const details = selectedDetails(answers);
  const tongue = details.filter(({ question }) => question.category === "tongue").reduce((sum, { option }) => sum + Object.values(option.patternWeights).reduce((total, value) => total + (value ?? 0), 0), 0);
  const nonTongue = details.filter(({ question }) => question.category !== "tongue").reduce((sum, { option }) => sum + Object.values(option.patternWeights).reduce((total, value) => total + (value ?? 0), 0), 0);
  if (!tongue || !nonTongue) return 0;
  const scale = tongue / (tongue + nonTongue) > 0.15 ? (nonTongue * 0.15) / (tongue * 0.85) : 1;
  return (tongue * scale) / (nonTongue + tongue * scale);
}

export function analyseConstitution(answers: AnswerMap): AnalysisResult {
  const rawScores = blankNumberRecord();
  const normalizedScores = blankNumberRecord();
  const scores = blankNumberRecord();
  const details = selectedDetails(answers);
  const selectedIds = new Set(details.map(({ option }) => option.optionId));
  const answeredCount = constitutionQuestions.filter((question) => (answers[question.id]?.length ?? 0) > 0).length;
  const nonTongueTotal = details.filter(({ question }) => question.category !== "tongue").reduce((sum, { option }) => sum + Object.values(option.patternWeights).reduce((total, value) => total + (value ?? 0), 0), 0);
  const tongueTotal = details.filter(({ question }) => question.category === "tongue").reduce((sum, { option }) => sum + Object.values(option.patternWeights).reduce((total, value) => total + (value ?? 0), 0), 0);
  const tongueScale = tongueTotal > 0 && nonTongueTotal > 0 && tongueTotal / (tongueTotal + nonTongueTotal) > 0.15 ? (nonTongueTotal * 0.15) / (tongueTotal * 0.85) : 1;

  const diagnostics = {} as Record<PatternId, PatternScoreDiagnostic>;
  const categorySupport = {} as Record<PatternId, string[]>;
  for (const pattern of patterns) {
    const rule = diagnosticRuleMap[pattern.id];
    const contributions = details.flatMap(({ question, option }) => {
      const rawWeight = option.patternWeights[pattern.id] ?? 0;
      if (rawWeight <= 0) return [];
      const weight = question.category === "tongue" ? rawWeight * tongueScale : rawWeight;
      return [{ questionId: question.id, optionId: option.optionId, category: question.category, weight, core: rule.coreEvidenceGroups.some((group) => group.optionIds.includes(option.optionId)) }];
    });
    const weightedEvidenceScore = contributions.reduce((sum, item) => sum + item.weight, 0);
    const maximum = maximumRelevantScore(pattern.id);
    const normalizedScore = maximum ? Math.min(100, weightedEvidenceScore / maximum * 100) : 0;
    const supportCategories = [...new Set(contributions.map((item) => item.category))] as QuestionCategory[];
    const coreEvidenceSatisfied = rule.coreEvidenceGroups.filter((group) => group.optionIds.filter((id) => selectedIds.has(id)).length >= group.minimumMatches).map((group) => group.label);
    const contradictionCount = rule.contradictionOptionIds.filter((id) => selectedIds.has(id)).length;
    const specificityScore = contributions.length ? contributions.reduce((sum, item) => sum + Math.min(item.weight, 2) / 2, 0) / contributions.length * 10 : 0;
    const finalScore = normalizedScore + coreEvidenceSatisfied.length * 7 + supportCategories.length * 1.5 + specificityScore * 0.5 - contradictionCount * 6;
    const eligible = contributions.length >= rule.minimumSupportCount && supportCategories.length >= rule.minimumCategoryCount && normalizedScore >= rule.minimumNormalizedScore && coreEvidenceSatisfied.length >= rule.minimumCoreGroups && (pattern.id !== "balanced" || contradictionCount === 0);
    rawScores[pattern.id] = Number(weightedEvidenceScore.toFixed(3));
    normalizedScores[pattern.id] = Number(normalizedScore.toFixed(3));
    scores[pattern.id] = Number(finalScore.toFixed(3));
    categorySupport[pattern.id] = supportCategories;
    diagnostics[pattern.id] = {
      weightedEvidenceScore: rawScores[pattern.id], patternMaximumRelevantScore: maximum, normalizedScore: normalizedScores[pattern.id], finalScore: scores[pattern.id],
      supportCount: contributions.length, supportCategories, specificityScore: Number(specificityScore.toFixed(3)), contradictionCount,
      coreEvidenceSatisfied, coreEvidenceRequired: rule.minimumCoreGroups, eligible, contributions
    };
  }

  const contradictory = contradictionPairs.some(([first, second]) => selectedIds.has(first) && selectedIds.has(second));
  const base = { mixed: false, contradictory, evidence: [] as string[], scores, rawScores, normalizedScores, diagnostics, categorySupport, answeredCount, selectionReasons: [] as string[] };
  if (answeredCount < MIN_ANSWERED) return { ...base, status: "insufficient", confidence: "資料不足" };

  const ranking = patterns.map((pattern) => ({ id: pattern.id, score: scores[pattern.id], diagnostic: diagnostics[pattern.id] })).filter((item) => item.diagnostic.eligible).sort((a, b) => b.score - a.score || b.diagnostic.coreEvidenceSatisfied.length - a.diagnostic.coreEvidenceSatisfied.length);
  const first = ranking[0];
  const second = ranking[1];
  if (!first) return { ...base, status: "no-clear-tendency", confidence: contradictory ? "偏低" : "中等", selectionReasons: ["沒有證型同時通過核心證據、支持數、範疇數及標準化分數門檻"] };

  const rankingGap = second ? (first.score - second.score) / Math.max(first.score, 1) : 1;
  const mixed = Boolean(second && rankingGap <= MIXED_GAP_RATIO);
  let confidence: AnalysisResult["confidence"] = answeredCount >= 36 && !contradictory && first.diagnostic.supportCategories.length >= 4 && first.diagnostic.contradictionCount === 0 ? "較高" : "中等";
  if (contradictory || answeredCount < 30 || first.diagnostic.contradictionCount > 0) confidence = "偏低";
  const evidence = details
    .filter(({ option }) => (option.patternWeights[first.id] ?? 0) > 0 || (mixed && second && (option.patternWeights[second.id] ?? 0) > 0))
    .sort((a, b) => (b.option.patternWeights[first.id] ?? 0) - (a.option.patternWeights[first.id] ?? 0))
    .flatMap(({ option }) => option.explanationTags).filter((tag, index, list) => tag && list.indexOf(tag) === index).slice(0, 6);
  const selectionReasons = [
    `標準化分數 ${first.diagnostic.normalizedScore.toFixed(1)} / 100`,
    `獲 ${first.diagnostic.supportCount} 項回答、${first.diagnostic.supportCategories.length} 個範疇支持`,
    `通過 ${first.diagnostic.coreEvidenceSatisfied.length} 組核心證據：${first.diagnostic.coreEvidenceSatisfied.join("、")}`,
    first.diagnostic.contradictionCount ? `有 ${first.diagnostic.contradictionCount} 項反向證據，已扣分` : "未見該證型的反向核心答案"
  ];
  return { ...base, status: "result", primary: first.id, secondary: mixed ? second?.id : undefined, confidence, mixed, evidence, rankingGap, selectionReasons };
}
