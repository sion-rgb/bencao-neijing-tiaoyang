import { constitutionQuestions } from "../src/data/questions/constitutionQuestions";
import type { AnswerMap } from "../src/types";

export const safeAnswers: AnswerMap = {
  age: ["age_18_39"], sex: ["sex_male"], pregnancy: ["pregnancy_na"], breastfeeding: ["breastfeeding_na"],
  g6pd: ["g6pd_no"], diabetes: ["diabetes_none"], glucose_medicine: ["glucose_medicine_na"],
  conditions: ["condition_none"], medicines: ["medicine_none"], surgery: ["surgery_no"], allergy: ["allergy_no"], emergency: ["emergency_none"]
};

export function fullAnswers(overrides: AnswerMap = {}): AnswerMap {
  const answers: AnswerMap = {};
  for (const question of constitutionQuestions) answers[question.id] = [question.options.at(-1)!.optionId];
  return { ...answers, ...overrides };
}

export function phlegmAnswers(): AnswerMap {
  return fullAnswers({
    body_heavy: ["body_heavy_often"], body_swelling: ["body_swelling_sometimes"], energy_morning: ["energy_morning_low"], energy_activity: ["energy_activity_often"],
    sweat_sticky: ["sweat_sticky_often"], digestion_stool: ["digestion_stool_sticky"], digestion_toilet: ["digestion_toilet_often"], digestion_greasy: ["digestion_greasy_heavy"],
    sleep_restored: ["sleep_restored_low"], head_heavy: ["head_heavy_often"], skin_texture: ["skin_texture_oily"]
  });
}
