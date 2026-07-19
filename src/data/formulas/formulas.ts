import { diagnosticRuleMap } from "../scoring/diagnosticRules";
import type { FormulaDefinition, FormulaIngredient, FormulaIngredientRole, PatternId, SourceReference } from "../../types";

type FixedIngredient = [string, FormulaIngredientRole, string];
type FormulaConfig = {
  id: string;
  name: string;
  pattern: PatternId;
  category: FormulaDefinition["category"];
  displayMode?: FormulaDefinition["displayMode"];
  sourceType?: FormulaDefinition["sourceType"];
  ingredients: FixedIngredient[];
  optional?: FixedIngredient & { includeWhen: string[] };
  rationale: string;
  source: SourceReference;
  groups?: FormulaDefinition["requiredAnswerGroups"];
};

const sources = {
  routine: { knowledgeEntryId: "huangdi-neijing-published-00002", documentId: "huangdi-neijing", title: "《黃帝內經・素問》上古天真論", pageStart: 6, pageEnd: 6, note: "只作生活有常的文化脈絡；產品食物組合不是古方。" },
  yam: { knowledgeEntryId: "bencao-gangmu-published-00251", documentId: "bencao-gangmu", title: "《本草綱目》山藥釋名／氣味資料", pageStart: 291, pageEnd: 291 },
  poria: { knowledgeEntryId: "qijing-bamai-kao-published-00084", documentId: "qijing-bamai-kao", title: "《奇經八脈考》茯苓、五味子等方義材料", pageStart: 24, pageEnd: 24 },
  rice: { knowledgeEntryId: "bencao-gangmu-published-00158", documentId: "bencao-gangmu", title: "《本草綱目》粳米氣味資料", pageStart: 176, pageEnd: 176 },
  date: { knowledgeEntryId: "shennong-bencao-jing-published-00264", documentId: "shennong-bencao-jing", title: "《神農本草經》大棗", pageStart: 62, pageEnd: 62 },
  coix: { knowledgeEntryId: "shennong-bencao-jing-published-00101", documentId: "shennong-bencao-jing", title: "《神農本草經》薏苡仁", pageStart: 26, pageEnd: 26 },
  lily: { knowledgeEntryId: "shennong-bencao-jing-published-00340", documentId: "shennong-bencao-jing", title: "《神農本草經》百合", pageStart: 81, pageEnd: 81 },
  ginger: { knowledgeEntryId: "shennong-bencao-jing-published-00314", documentId: "shennong-bencao-jing", title: "《神農本草經》乾薑", pageStart: 78, pageEnd: 78 },
  redBean: { knowledgeEntryId: "shennong-bencao-jing-published-00465", documentId: "shennong-bencao-jing", title: "《神農本草經》赤小豆資料", pageStart: 112, pageEnd: 112 },
  sesame: { knowledgeEntryId: "shennong-bencao-jing-published-00273", documentId: "shennong-bencao-jing", title: "《神農本草經》胡麻", pageStart: 65, pageEnd: 65 },
  longan: { knowledgeEntryId: "shennong-bencao-jing-published-00417", documentId: "shennong-bencao-jing", title: "《神農本草經》龍眼", pageStart: 95, pageEnd: 95 },
  digestion: { knowledgeEntryId: "yixue-sanzijing-published-00042", documentId: "yixue-sanzijing", title: "《醫學三字經》食積相關原文", pageStart: 26, pageEnd: 26 },
  peachRed: { knowledgeEntryId: "zhongyi-neike-fangji-suoyin-published-00484", documentId: "zhongyi-neike-fangji-suoyin", title: "《醫宗金鑑》桃紅四物湯索引資料", pageStart: 39, pageEnd: 39 }
} satisfies Record<string, SourceReference>;

const I = (id: string, role: FormulaIngredientRole, reason: string): FixedIngredient => [id, role, reason];
const configs: FormulaConfig[] = [
  { id: "balanced-food-001", name: "平和日常穀食組合", pattern: "balanced", category: "daily-food", ingredients: [I("rice", "主要調養", "作均衡主食方向"), I("lotus_seed", "協同", "增加食材多樣性"), I("chinese_yam", "食療補充", "作熟食根莖輪替")], rationale: "以日常熟食、穀物與根莖維持飲食有節，不作偏寒偏熱的藥性調整。", source: sources.routine },
  { id: "balanced-food-002", name: "平和多樣熟食組合", pattern: "balanced", category: "daily-food", ingredients: [I("oat", "主要調養", "作全穀主食輪替"), I("rice", "協同", "配合日常用餐"), I("red_date", "食療補充", "少量作普通食材")], rationale: "重點是食物多樣與適量，不把任何單一食材視為治療。", source: sources.routine },
  { id: "qi-food-001", name: "氣虛日常熟食組合", pattern: "qiDeficiency", category: "daily-food", ingredients: [I("rice", "主要調養", "支援規律用餐"), I("red_date", "協同", "少量配合熟食"), I("chinese_yam", "食療補充", "作根莖主食輪替")], rationale: "由多項疲倦、活動後乏力及恢復不足支持時，只提供容易執行的熟食方向。", source: sources.date },
  { id: "qi-food-002", name: "氣虛蓮子山藥食物組合", pattern: "qiDeficiency", category: "daily-food", ingredients: [I("rice", "主要調養", "維持主食基礎"), I("lotus_seed", "協同", "配合熟食口感與多樣性"), I("chinese_yam", "食療補充", "只作煮熟食物")], rationale: "固定三味普通食物，不由程式即時拼湊，也不提供療效或份量。", source: sources.yam },
  {
    id: "spleen-qi-gentle-001", name: "氣虛／脾氣虛溫和配伍參考", pattern: "spleenQiDeficiency", category: "gentle-tea",
    ingredients: [I("prepared_licorice", "調和", "作為配伍中的調和選材"), I("dried_tangerine_peel", "理氣配合", "避免配伍過於壅滯，配合脾胃氣機方向"), I("poria", "協同", "配合脾虛及水濕傾向")],
    optional: Object.assign(I("chinese_yam", "食療補充", "在食慾差或便稀等脾胃表現時加入熟食方向"), { includeWhen: ["digestion_appetite_low", "digestion_stool_loose"] }),
    groups: [
      { minimumMatches: 3, optionIds: ["energy_fatigue_often", "energy_after_exertion_often", "energy_voice_often", "sweat_easy_yes", "energy_morning_low", "energy_activity_often", "sweat_after_often"], description: "至少三項不同氣虛表現" },
      { minimumMatches: 1, optionIds: ["digestion_appetite_low", "digestion_bloating_often", "digestion_stool_loose", "digestion_stool_sticky", "digestion_cold_food_loose", "digestion_cold_food_bloat", "body_heavy_often"], description: "至少一項脾胃或身體沉重表現" }
    ],
    rationale: "由氣虛核心證據及脾胃回答共同支持；這是產品固定規則，不冒充古方。", source: sources.poria
  },
  { id: "spleen-qi-food-002", name: "脾氣虛蓮芡熟食組合", pattern: "spleenQiDeficiency", category: "daily-food", ingredients: [I("rice", "主要調養", "作規律熟食基礎"), I("lotus_seed", "協同", "配合熟食方向"), I("foxnut", "協同", "增加食材多樣性"), I("chinese_yam", "食療補充", "在脾胃表現成立時作熟食")], rationale: "食慾、腹脹及大便等回答同時支持時，提供固定四味熟食方向。", source: sources.yam },
  { id: "spleen-yang-food-001", name: "脾陽不足溫熟食物組合", pattern: "spleenYangDeficiency", category: "daily-food", ingredients: [I("rice", "主要調養", "作溫熱熟食基礎"), I("ginger", "調和", "少量作烹調食材"), I("chestnut", "食療補充", "作澱粉食物輪替")], rationale: "只在生冷後不適兼怕冷核心證據成立時顯示，避免濃煎或猛烈溫熱材料。", source: sources.ginger },
  { id: "spleen-yang-food-002", name: "脾陽不足山藥栗子組合", pattern: "spleenYangDeficiency", category: "daily-food", ingredients: [I("chinese_yam", "主要調養", "煮熟作根莖食物"), I("rice", "協同", "配合規律用餐"), I("chestnut", "食療補充", "作普通食物輪替")], rationale: "偏冷及消化核心表現共同成立時，仍只提供普通熟食方向。", source: sources.rice },
  { id: "phlegm-food-001", name: "痰濕清淡穀豆組合", pattern: "phlegmDampness", category: "daily-food", ingredients: [I("coix_seed", "主要調養", "作充分煮熟穀物"), I("adzuki_bean", "協同", "作豆類食物輪替"), I("winter_melon", "食療補充", "增加清淡蔬菜選擇")], rationale: "身重、黏滯及油膩後加重等核心證據成立時，提供清淡熟食組合。", source: sources.coix },
  { id: "phlegm-gentle-002", name: "痰濕脾胃固定配伍知識", pattern: "phlegmDampness", category: "gentle-tea", ingredients: [I("poria", "主要調養", "配合水濕文化思路"), I("dried_tangerine_peel", "理氣配合", "配合脹滿與氣機方向"), I("coix_seed", "食療補充", "作煮熟穀食方向")], rationale: "固定三味，不根據關鍵詞生成；只有低風險篩查通過才顯示。", source: sources.poria },
  { id: "damp-heat-food-001", name: "濕熱清淡豆瓜組合", pattern: "dampHeat", category: "daily-food", ingredients: [I("mung_bean", "主要調養", "作普通豆類熟食"), I("adzuki_bean", "協同", "增加豆類輪替"), I("winter_melon", "食療補充", "配合清淡蔬菜方向")], rationale: "濕、熱及黏滯核心證據共同成立時，避免辛辣煎炸，僅列普通食物。", source: sources.redBean },
  { id: "damp-heat-food-002", name: "濕熱薏米冬瓜熟食組合", pattern: "dampHeat", category: "daily-food", ingredients: [I("coix_seed", "主要調養", "充分煮熟作穀物"), I("winter_melon", "協同", "作清淡瓜菜"), I("mung_bean", "食療補充", "作豆類輪替")], rationale: "固定三味食物，不作清熱治病或降血糖宣稱。", source: sources.coix },
  { id: "yin-food-001", name: "陰虛百合梨食物組合", pattern: "yinDeficiency", category: "daily-food", ingredients: [I("lily_bulb", "主要調養", "徹底煮熟作食材"), I("pear", "協同", "作含水分水果選擇"), I("black_sesame", "食療補充", "少量作種子食物")], rationale: "夜間燥熱、口乾等核心證據成立時，提供普通含水食物方向。", source: sources.lily },
  { id: "yin-food-002", name: "陰虛清潤熟食組合", pattern: "yinDeficiency", category: "daily-food", ingredients: [I("lily_bulb", "主要調養", "作熟食"), I("rice", "協同", "維持均衡主食"), I("pear", "食療補充", "作普通水果")], rationale: "不使用濃縮滋補品，只列固定三味普通食物。", source: sources.lily },
  { id: "yang-food-001", name: "陽虛溫熟食物組合", pattern: "yangDeficiency", category: "daily-food", ingredients: [I("rice", "主要調養", "作熱食基礎"), I("ginger", "調和", "少量作烹調配合"), I("chestnut", "食療補充", "作澱粉食物輪替")], rationale: "怕冷、手足冷兼夜尿或浮腫等核心證據成立時，只列普通熟食。", source: sources.ginger },
  { id: "yang-food-002", name: "陽虛山藥薑棗熟食組合", pattern: "yangDeficiency", category: "daily-food", ingredients: [I("chinese_yam", "主要調養", "煮熟作根莖"), I("ginger", "調和", "少量作烹調"), I("red_date", "食療補充", "少量作普通食材")], rationale: "固定熟食方向，不提供濃煎、克數或治療用途。", source: sources.date },
  { id: "qi-stagnation-food-001", name: "氣滯清香日常食物組合", pattern: "qiStagnation", category: "daily-food", ingredients: [I("oat", "主要調養", "維持規律用餐"), I("rose", "協同", "只作食用花材文化方向"), I("dried_tangerine_peel", "理氣配合", "配合飯後脹滿回答")], rationale: "鬱悶嘆氣兼脹滿核心證據成立時，固定列出三項食材；不宣稱治療情緒。", source: sources.digestion },
  { id: "qi-stagnation-food-002", name: "氣滯輕食輪替組合", pattern: "qiStagnation", category: "daily-food", ingredients: [I("rice", "主要調養", "保持定時用餐"), I("rose", "協同", "少量食用花材方向"), I("pear", "食療補充", "作普通水果輪替")], rationale: "著重飲食節奏及避免過飽；不是疏肝處方。", source: sources.digestion },
  { id: "blood-stasis-classic-001", name: "桃紅四物湯古方組成（只讀）", pattern: "bloodStasis", category: "traditional-formula-knowledge", displayMode: "knowledge-only", sourceType: "verified-classic", ingredients: [I("peach_kernel", "主要調養", "古方固定組成"), I("safflower", "協同", "古方固定組成"), I("rehmannia", "協同", "古方固定組成"), I("peony", "協同", "古方固定組成"), I("angelica", "協同", "古方固定組成"), I("ligusticum", "調和", "古方固定組成")], rationale: "只展示《醫宗金鑑》索引所載固定組成；涉及活血方向，永不進入自動建議。", source: sources.peachRed },
  { id: "blood-stasis-food-002", name: "血瘀食物方向組合（只讀）", pattern: "bloodStasis", category: "daily-food", displayMode: "knowledge-only", ingredients: [I("black_bean", "主要調養", "普通豆類方向"), I("hawthorn", "協同", "只作酸味食材知識"), I("rice", "食療補充", "維持均衡主食")], rationale: "血瘀涉及出血、抗凝藥及手術風險；本組合只讀，不作自動建議。", source: sources.digestion },
  { id: "blood-deficiency-food-001", name: "血虛棗芝麻日常組合", pattern: "bloodDeficiency", category: "daily-food", ingredients: [I("red_date", "主要調養", "少量作普通食材"), I("black_sesame", "協同", "作種子食物輪替"), I("rice", "食療補充", "維持均衡主食")], rationale: "面唇偏淡兼睡眠或抽筋核心證據成立時，只列普通食物，不等同驗血結果。", source: sources.sesame },
  { id: "blood-deficiency-food-002", name: "血虛龍眼熟食組合", pattern: "bloodDeficiency", category: "daily-food", ingredients: [I("longan", "主要調養", "少量作含天然糖分食物"), I("red_date", "協同", "少量作熟食配合"), I("black_sesame", "食療補充", "作種子食物輪替")], rationale: "固定三味普通食物；糖尿病者須計入原有膳食安排，服藥者不顯示。", source: sources.longan },
  { id: "fluid-food-001", name: "津液不足百合梨組合", pattern: "fluidDeficiency", category: "daily-food", ingredients: [I("pear", "主要調養", "作含水分水果"), I("lily_bulb", "協同", "煮熟作食材"), I("black_sesame", "食療補充", "少量作食物輪替")], rationale: "口乾、大便乾及皮膚乾等核心證據成立時，提供含水食物方向。", source: sources.lily },
  { id: "fluid-food-002", name: "津液不足清淡熟食組合", pattern: "fluidDeficiency", category: "daily-food", ingredients: [I("rice", "主要調養", "維持正常用餐"), I("pear", "協同", "作普通水果"), I("lily_bulb", "食療補充", "徹底煮熟作食材")], rationale: "固定三味，不以甜飲代替清水，也不解釋嚴重口渴等警號。", source: sources.lily }
];

const exclusions = ["minor", "pregnant", "breastfeeding", "g6pd", "type1Diabetes", "gestationalDiabetes", "liverDisease", "kidneyDisease", "heartDisease", "anticoagulant", "upcomingSurgery", "polypharmacy", "multipleTcm", "multipleSupplements"];

function toIngredient([ingredientId, role, reason]: FixedIngredient): FormulaIngredient { return { ingredientId, role, reason }; }

export const formulas: FormulaDefinition[] = configs.map((config) => {
  const rule = diagnosticRuleMap[config.pattern];
  const optionalIngredients = config.optional ? [{ ...toIngredient(config.optional), includeWhen: config.optional.includeWhen }] : [];
  return {
    formulaId: config.id,
    name: config.name,
    formulaType: "rule-based-gentle-combination",
    category: config.category,
    displayMode: config.displayMode ?? "automated",
    sourceType: config.sourceType ?? "product-owner-rule",
    suitablePatterns: [config.pattern],
    requiredAnswerGroups: config.groups ?? rule.coreEvidenceGroups.slice(0, rule.minimumCoreGroups).map((group) => ({ minimumMatches: group.minimumMatches, optionIds: group.optionIds, description: group.label })),
    exclusionFlags: exclusions,
    ingredients: config.ingredients.map(toIngredient),
    optionalIngredients,
    minimumIngredientCount: config.ingredients.length,
    maximumIngredientCount: config.ingredients.length + optionalIngredients.length,
    traditionalRationale: config.rationale,
    suitableAnswerDescription: `只有${rule.minimumCoreGroups}組或以上核心證據及計分門檻同時成立才符合資料規則。`,
    unsuitableWhen: ["核心證據不足或只有單一症狀", "急性、嚴重或持續加重的不適", "任何安全排除條件成立", config.displayMode === "knowledge-only" ? "只讀知識，任何情況都不作自動建議" : "正在使用胰島素或降血糖藥而尚未完成該配伍安全審核"],
    usageForm: config.displayMode === "knowledge-only" ? "只展示固定古方／食物知識；不提供份量、煎煮法、療程或使用建議。" : "作普通食物或固定溫和組合參考；沒有經審核來源時不顯示份量。",
    stopConditions: ["皮疹、氣促、面唇腫脹或其他過敏表現", "冒冷汗、發抖、心悸、頭暈、神志不清", "噁心、嘔吐、腹痛或任何持續不適"],
    sourceReferences: [config.source, { title: "產品固定規則", note: "古籍只提供材料或方名的文化脈絡；本組合不是從搜尋結果生成，也不冒充古方或名家原方。" }],
    medicationSafety: { diabetesMedicationReviewed: false, insulinUseReviewed: false, hypoglycaemiaWarningRequired: true, knownInteractionNotes: ["尚未完成胰島素及降血糖藥交互作用審核，因此相關使用者不顯示。"], safetySources: [] },
    safetyComplete: true,
    sourceVerified: true,
    doseReviewed: false,
    reviewStatus: "approved",
    version: "2.0.0",
    lastUpdated: "2026-07-20"
  };
});
