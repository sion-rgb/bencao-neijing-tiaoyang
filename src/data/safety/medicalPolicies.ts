import type { MedicalConditionPolicy } from "../../types";

export const medicalConditionPolicies: Record<"type2Diabetes", MedicalConditionPolicy> = {
  type2Diabetes: {
    affectsPatternScore: false,
    blocksPatternResult: false,
    blocksFoodAdvice: false,
    blocksApprovedFormula: false,
    showMedicalNotice: true,
    noticeFlag: "type2-diabetes"
  }
};
