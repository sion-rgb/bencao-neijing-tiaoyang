import { constitutionQuestions } from "../questions/constitutionQuestions";
import type { AnswerMap, PatternId } from "../../types";
import { diagnosticRuleMap } from "./diagnosticRules";

export type ConstitutionProfile = { id: string; expected: PatternId; answers: AnswerMap; description: string };

const optionQuestion = new Map(constitutionQuestions.flatMap((question) => question.options.map((option) => [option.optionId, question.id] as const)));

function neutralAnswers(): AnswerMap {
  return Object.fromEntries(constitutionQuestions.map((question) => {
    const neutral = question.options.find((option) => Object.keys(option.patternWeights).length === 0 || option.optionId.endsWith("_rare") || option.optionId.endsWith("_normal") || option.optionId.endsWith("_none") || option.optionId.endsWith("_good") || option.optionId.endsWith("_unsure"));
    return [question.id, [neutral?.optionId ?? question.options.at(-1)!.optionId]];
  }));
}

function makeProfile(patternId: PatternId, variant: number): ConstitutionProfile {
  const answers = neutralAnswers();
  const rule = diagnosticRuleMap[patternId];
  const positive = constitutionQuestions.flatMap((question) => question.options
    .filter((option) => (option.patternWeights[patternId] ?? 0) > 0)
    .map((option) => ({ questionId: question.id, optionId: option.optionId, weight: option.patternWeights[patternId] ?? 0 })))
    .sort((a, b) => b.weight - a.weight || a.optionId.localeCompare(b.optionId));
  for (const item of positive.slice(variant, variant + Math.max(9, rule.minimumSupportCount + 3))) answers[item.questionId] = [item.optionId];
  for (const group of rule.coreEvidenceGroups) {
    for (const optionId of group.optionIds.slice(0, group.minimumMatches)) {
      const questionId = optionQuestion.get(optionId);
      if (questionId) answers[questionId] = [optionId];
    }
  }
  return { id: `${patternId}-${variant + 1}`, expected: patternId, answers, description: `${patternId} 核心證據組合，第 ${variant + 1} 個邊界變體` };
}

export const constitutionProfiles: ConstitutionProfile[] = [
  "balanced", "qiDeficiency", "spleenQiDeficiency", "spleenYangDeficiency", "phlegmDampness", "dampHeat",
  "yinDeficiency", "yangDeficiency", "qiStagnation", "bloodStasis", "bloodDeficiency", "fluidDeficiency"
].flatMap((patternId) => [0, 1, 2].map((variant) => makeProfile(patternId as PatternId, variant)));
