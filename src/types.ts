export type ReviewStatus = "draft" | "tcm-reviewed" | "safety-reviewed" | "approved";

export type PatternId =
  | "balanced"
  | "qiDeficiency"
  | "spleenQiDeficiency"
  | "spleenYangDeficiency"
  | "phlegmDampness"
  | "dampHeat"
  | "yinDeficiency"
  | "yangDeficiency"
  | "qiStagnation"
  | "bloodStasis"
  | "bloodDeficiency"
  | "fluidDeficiency";

export type QuestionCategory =
  | "body"
  | "energy"
  | "sweat"
  | "digestion"
  | "sleep"
  | "headSkinLimbs"
  | "tongue";

export type PatternWeights = Partial<Record<PatternId, number>>;

export type QuestionOption = {
  optionId: string;
  label: string;
  patternWeights: PatternWeights;
  safetyFlags: string[];
  explanationTags: string[];
};

export type ConstitutionQuestion = {
  id: string;
  category: QuestionCategory;
  prompt: string;
  helpText?: string;
  required: boolean;
  multiple?: boolean;
  options: QuestionOption[];
  reviewStatus: ReviewStatus;
};

export type SafetyQuestion = {
  id: string;
  prompt: string;
  required: true;
  multiple?: boolean;
  options: Array<{ id: string; label: string; flags: string[] }>;
  visibilityRules?: QuestionVisibilityRule[];
  visibilityMode?: "all" | "any";
  reviewStatus: ReviewStatus;
};

export type QuestionVisibilityRule =
  | { type: "answer-equals"; questionId: string; optionId: string }
  | { type: "answer-in"; questionId: string; optionIds: string[] }
  | { type: "not-applicable" };

export type Pattern = {
  id: PatternId;
  name: string;
  shortName: string;
  principle: string;
  priorities: string[];
  habits: string[];
  foodDirections: string[];
  avoid: string[];
  classicIds: string[];
  reviewStatus: ReviewStatus;
};

export type ClassicEntry = {
  id: string;
  book: "黃帝內經" | "本草綱目";
  section: string;
  chapter?: string;
  originalText: string;
  modernSummary: string;
  tags: string[];
  sourceStatus: "verified" | "needs-review";
  sourceUrl: string;
  reviewStatus: ReviewStatus;
};

export type Ingredient = {
  id: string;
  name: string;
  nature: string;
  traditionalUse: string;
  suitablePatterns: PatternId[];
  unsuitablePatterns: PatternId[];
  pregnancyRestriction: string;
  g6pdRestriction: string;
  diabetesRestriction: string;
  liverKidneyRestriction: string;
  interactionNote: string;
  allergyNote: string;
  suggestedForm: string;
  maxDuration: string;
  classicSource: string;
  contraindicationFlags: string[];
  safetyComplete: boolean;
  reviewStatus: ReviewStatus;
};

export type AnswerMap = Record<string, string[]>;

export type Confidence = "較高" | "中等" | "偏低" | "資料不足";

export type AnalysisResult = {
  status: "result" | "insufficient" | "no-clear-tendency";
  primary?: PatternId;
  secondary?: PatternId;
  confidence: Confidence;
  mixed: boolean;
  contradictory: boolean;
  evidence: string[];
  scores: Record<PatternId, number>;
  rawScores: Record<PatternId, number>;
  normalizedScores: Record<PatternId, number>;
  diagnostics: Record<PatternId, PatternScoreDiagnostic>;
  categorySupport: Record<PatternId, string[]>;
  answeredCount: number;
  rankingGap?: number;
  selectionReasons: string[];
};

export type PatternEvidenceGroup = {
  id: string;
  label: string;
  minimumMatches: number;
  optionIds: string[];
};

export type PatternDiagnosticRule = {
  patternId: PatternId;
  coreEvidenceGroups: PatternEvidenceGroup[];
  minimumCoreGroups: number;
  minimumSupportCount: number;
  minimumCategoryCount: number;
  minimumNormalizedScore: number;
  contradictionOptionIds: string[];
};

export type PatternScoreDiagnostic = {
  weightedEvidenceScore: number;
  patternMaximumRelevantScore: number;
  normalizedScore: number;
  finalScore: number;
  supportCount: number;
  supportCategories: QuestionCategory[];
  specificityScore: number;
  contradictionCount: number;
  coreEvidenceSatisfied: string[];
  coreEvidenceRequired: number;
  eligible: boolean;
  contributions: Array<{ questionId: string; optionId: string; category: QuestionCategory; weight: number; core: boolean }>;
};

export type SafetyLevel = 0 | 1 | 2 | 3;

export type MedicalNoticeFlag =
  | "type2-diabetes"
  | "glucose-lowering-medication"
  | "insulin-use"
  | "hypoglycaemia-risk";

export type MedicalConditionPolicy = {
  affectsPatternScore: boolean;
  blocksPatternResult: boolean;
  blocksFoodAdvice: boolean;
  blocksApprovedFormula: boolean;
  showMedicalNotice: boolean;
  noticeFlag: MedicalNoticeFlag;
};

export type SafetyAssessment = {
  level: SafetyLevel;
  reasons: string[];
  flags: string[];
  medicalNotices: MedicalNoticeFlag[];
  allowIngredients: boolean;
  allowApprovedFormulas: boolean;
  conservativeOnly: boolean;
};

export type SourceReference = {
  knowledgeEntryId?: string;
  documentId?: string;
  title: string;
  chapter?: string;
  pageStart?: number;
  pageEnd?: number;
  sourceUrl?: string;
  note?: string;
};

export type FormulaMedicationSafety = {
  diabetesMedicationReviewed: boolean;
  insulinUseReviewed: boolean;
  hypoglycaemiaWarningRequired: boolean;
  knownInteractionNotes: string[];
  safetySources: SourceReference[];
};

export type FormulaIngredientRole = "主要調養" | "協同" | "調和" | "理氣配合" | "食療補充";

export type FormulaIngredient = {
  ingredientId: string;
  role: FormulaIngredientRole;
  reason: string;
  includeWhen?: string[];
};

export type FormulaDefinition = {
  formulaId: string;
  name: string;
  formulaType: "rule-based-gentle-combination";
  category: "daily-food" | "gentle-tea" | "traditional-formula-knowledge";
  displayMode: "automated" | "knowledge-only";
  sourceType: "product-owner-rule" | "verified-classic";
  suitablePatterns: PatternId[];
  requiredAnswerGroups: Array<{ minimumMatches: number; optionIds: string[]; description: string }>;
  exclusionFlags: string[];
  ingredients: FormulaIngredient[];
  optionalIngredients: FormulaIngredient[];
  minimumIngredientCount: number;
  maximumIngredientCount: number;
  traditionalRationale: string;
  suitableAnswerDescription: string;
  unsuitableWhen: string[];
  usageForm: string;
  stopConditions: string[];
  sourceReferences: SourceReference[];
  medicationSafety: FormulaMedicationSafety;
  safetyComplete: boolean;
  sourceVerified: boolean;
  doseText?: string;
  doseSource?: SourceReference;
  doseReviewed: boolean;
  reviewStatus: ReviewStatus;
  version: string;
  lastUpdated: string;
};

export type SelectedFormula = {
  formula: FormulaDefinition;
  ingredients: FormulaIngredient[];
  selectionReasons: string[];
};

export type StoredState = {
  schemaVersion: number;
  consent: boolean;
  safetyAnswers: AnswerMap;
  questionnaireAnswers: AnswerMap;
  currentStep: number;
  updatedAt: string;
  lastResult?: AnalysisResult;
};
