import { constitutionQuestions } from "../data/questions/constitutionQuestions";
import { patterns } from "../data/patterns/patterns";
import type { AnalysisResult, AnswerMap, PatternId, QuestionCategory } from "../types";

const MIN_ANSWERED = 24;
const MIN_SCORE = 7;
const MIXED_GAP_RATIO = 0.15;

const contradictionPairs: Array<[string, string]> = [
  ["body_temperature_cold", "body_climate_hot"],
  ["body_temperature_hot", "body_climate_cold"],
  ["digestion_stool_dry", "digestion_stool_loose"],
  ["skin_texture_dry", "skin_texture_oily"],
  ["tongue_color_pale", "tongue_color_red"]
];

function blankScores(): Record<PatternId, number> {
  return Object.fromEntries(patterns.map((pattern) => [pattern.id, 0])) as Record<PatternId, number>;
}

function blankSupport(): Record<PatternId, Set<QuestionCategory>> {
  return Object.fromEntries(patterns.map((pattern) => [pattern.id, new Set<QuestionCategory>()])) as Record<PatternId, Set<QuestionCategory>>;
}

export function calculateTongueShare(answers: AnswerMap): number {
  let tongue = 0;
  let nonTongue = 0;
  for (const question of constitutionQuestions) {
    for (const selectedId of answers[question.id] ?? []) {
      const selected = question.options.find((item) => item.optionId === selectedId);
      const amount = Object.values(selected?.patternWeights ?? {}).reduce((sum, value) => sum + (value ?? 0), 0);
      if (question.category === "tongue") tongue += amount;
      else nonTongue += amount;
    }
  }
  if (tongue + nonTongue === 0) return 0;
  if (nonTongue === 0) return 0;
  const scale = tongue / (tongue + nonTongue) > 0.15 && tongue > 0 ? (nonTongue * 0.15) / (tongue * 0.85) : 1;
  return (tongue * scale) / (nonTongue + tongue * scale);
}

export function analyseConstitution(answers: AnswerMap): AnalysisResult {
  const scores = blankScores();
  const nonTongueScores = blankScores();
  const tongueScores = blankScores();
  const support = blankSupport();
  const selectedIds = new Set(Object.values(answers).flat());
  const answeredCount = constitutionQuestions.filter((question) => (answers[question.id]?.length ?? 0) > 0).length;

  for (const question of constitutionQuestions) {
    for (const selectedId of answers[question.id] ?? []) {
      const selected = question.options.find((item) => item.optionId === selectedId);
      if (!selected) continue;
      for (const [patternId, rawWeight] of Object.entries(selected.patternWeights) as Array<[PatternId, number]>) {
        const weight = rawWeight ?? 0;
        if (question.category === "tongue") tongueScores[patternId] += weight;
        else nonTongueScores[patternId] += weight;
        if (weight > 0) support[patternId].add(question.category);
      }
    }
  }

  const totalNonTongue = Object.values(nonTongueScores).reduce((sum, value) => sum + value, 0);
  const totalTongue = Object.values(tongueScores).reduce((sum, value) => sum + value, 0);
  const tongueScale = totalTongue > 0 && totalTongue / (totalTongue + totalNonTongue) > 0.15
    ? (totalNonTongue * 0.15) / (totalTongue * 0.85)
    : 1;
  for (const pattern of patterns) scores[pattern.id] = nonTongueScores[pattern.id] + tongueScores[pattern.id] * tongueScale;

  const categorySupport = Object.fromEntries(patterns.map((pattern) => [pattern.id, [...support[pattern.id]]])) as Record<PatternId, string[]>;
  if (answeredCount < MIN_ANSWERED) {
    return { status: "insufficient", confidence: "資料不足", mixed: false, contradictory: false, evidence: [], scores, categorySupport, answeredCount };
  }

  const contradictory = contradictionPairs.some(([a, b]) => selectedIds.has(a) && selectedIds.has(b));
  const ranking = patterns
    .map((pattern) => ({ id: pattern.id, score: scores[pattern.id], categories: support[pattern.id].size }))
    .filter((item) => item.categories >= 3)
    .sort((a, b) => b.score - a.score);

  const first = ranking[0];
  const second = ranking[1];
  if (!first || first.score < MIN_SCORE) {
    return { status: "no-clear-tendency", confidence: contradictory ? "偏低" : "中等", mixed: false, contradictory, evidence: [], scores, categorySupport, answeredCount };
  }

  const mixed = Boolean(second && second.score >= MIN_SCORE && (first.score - second.score) / Math.max(first.score, 1) <= MIXED_GAP_RATIO);
  let confidence: AnalysisResult["confidence"] = answeredCount >= 36 && !contradictory && first.categories >= 4 ? "較高" : "中等";
  if (contradictory || answeredCount < 30 || first.categories === 3) confidence = "偏低";

  const evidence = constitutionQuestions
    .flatMap((question) => (answers[question.id] ?? []).map((selectedId) => ({ question, selected: question.options.find((item) => item.optionId === selectedId) })))
    .filter(({ selected }) => selected && ((selected.patternWeights[first.id] ?? 0) > 0 || (mixed && second && (selected.patternWeights[second.id] ?? 0) > 0)))
    .sort((a, b) => Math.max(...Object.values(b.selected?.patternWeights ?? {}), 0) - Math.max(...Object.values(a.selected?.patternWeights ?? {}), 0))
    .flatMap(({ selected }) => selected?.explanationTags ?? [])
    .filter((tag, index, list) => tag && list.indexOf(tag) === index)
    .slice(0, 5);

  return {
    status: "result",
    primary: first.id,
    secondary: mixed ? second?.id : undefined,
    confidence,
    mixed,
    contradictory,
    evidence,
    scores,
    categorySupport,
    answeredCount
  };
}
