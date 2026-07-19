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
  reviewStatus: ReviewStatus;
};

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
  categorySupport: Record<PatternId, string[]>;
  answeredCount: number;
};

export type SafetyLevel = 0 | 1 | 2 | 3;

export type SafetyAssessment = {
  level: SafetyLevel;
  reasons: string[];
  flags: string[];
  allowIngredients: boolean;
  conservativeOnly: boolean;
};

export type StoredState = {
  schemaVersion: number;
  consent: boolean;
  safetyAnswers: AnswerMap;
  questionnaireAnswers: AnswerMap;
  currentStep: number;
  updatedAt: string;
};
