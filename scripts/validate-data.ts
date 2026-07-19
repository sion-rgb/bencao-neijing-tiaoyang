import Ajv2020 from "ajv/dist/2020.js";
import questionSchema from "../src/schemas/question.schema.json" with { type: "json" };
import patternSchema from "../src/schemas/pattern.schema.json" with { type: "json" };
import ingredientSchema from "../src/schemas/ingredient.schema.json" with { type: "json" };
import classicSchema from "../src/schemas/classic.schema.json" with { type: "json" };
import safetySchema from "../src/schemas/safety-rule.schema.json" with { type: "json" };
import formulaSchema from "../src/schemas/formula.schema.json" with { type: "json" };
import { constitutionQuestions } from "../src/data/questions/constitutionQuestions";
import { patterns } from "../src/data/patterns/patterns";
import { ingredients } from "../src/data/ingredients/ingredients";
import { classics } from "../src/data/classics/classics";
import { safetyQuestions } from "../src/data/safety/safetyQuestions";
import { prohibitedIngredients } from "../src/data/safety/prohibited";
import { formulas } from "../src/data/formulas/formulas";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const failures: string[] = [];

function validateCollection(name: string, schema: object, values: unknown[]) {
  const validate = ajv.compile(schema);
  values.forEach((value, index) => {
    if (!validate(value)) failures.push(`${name}[${index}] schema: ${ajv.errorsText(validate.errors)}`);
  });
}

function assertUnique(name: string, values: string[]) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) failures.push(`${name} has duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);
}

validateCollection("questions", questionSchema, constitutionQuestions);
validateCollection("patterns", patternSchema, patterns);
validateCollection("ingredients", ingredientSchema, ingredients);
validateCollection("classics", classicSchema, classics);
validateCollection("safetyQuestions", safetySchema, safetyQuestions);
validateCollection("formulas", formulaSchema, formulas);

assertUnique("questions", constitutionQuestions.map((item) => item.id));
assertUnique("question options", constitutionQuestions.flatMap((item) => item.options.map((option) => option.optionId)));
assertUnique("patterns", patterns.map((item) => item.id));
assertUnique("ingredients", ingredients.map((item) => item.id));
assertUnique("classics", classics.map((item) => item.id));
assertUnique("safety questions", safetyQuestions.map((item) => item.id));
assertUnique("formulas", formulas.map((item) => item.formulaId));

const patternIds = new Set(patterns.map((item) => item.id));
const classicIds = new Set(classics.map((item) => item.id));
for (const question of constitutionQuestions) {
  for (const option of question.options) {
    for (const patternId of Object.keys(option.patternWeights)) if (!patternIds.has(patternId as never)) failures.push(`Question ${question.id} references missing pattern ${patternId}`);
  }
}
for (const pattern of patterns) {
  for (const classicId of pattern.classicIds) if (!classicIds.has(classicId)) failures.push(`Pattern ${pattern.id} references missing classic ${classicId}`);
}
for (const ingredient of ingredients) {
  if (!ingredient.safetyComplete) failures.push(`Ingredient ${ingredient.id} has incomplete safety data`);
  if (prohibitedIngredients.some((name) => ingredient.name.includes(name) || ingredient.traditionalUse.includes(name))) failures.push(`Ingredient ${ingredient.id} contains prohibited material`);
  for (const patternId of [...ingredient.suitablePatterns, ...ingredient.unsuitablePatterns]) if (!patternIds.has(patternId)) failures.push(`Ingredient ${ingredient.id} references missing pattern ${patternId}`);
}
for (const classic of classics) {
  if (!classic.sourceUrl) failures.push(`Classic ${classic.id} has no source`);
  if (classic.reviewStatus === "approved" && classic.sourceStatus !== "verified") failures.push(`Approved classic ${classic.id} is not verified`);
}
const ingredientIds = new Set(ingredients.map((item) => item.id));
const questionOptionIds = new Set(constitutionQuestions.flatMap((item) => item.options.map((option) => option.optionId)));
const publishedDir = path.join(process.cwd(), "src", "data", "knowledge", "published");
const publishedEntryIds = new Set<string>();
for (const file of (await readdir(publishedDir)).filter((item) => item.endsWith(".json"))) {
  const entries = JSON.parse(await readFile(path.join(publishedDir, file), "utf8")) as Array<{ id: string }>;
  for (const entry of entries) publishedEntryIds.add(entry.id);
}
for (const formula of formulas) {
  if (formula.ingredients.length < 3 || formula.ingredients.length > 6) failures.push(`Formula ${formula.formulaId} must contain 3-6 fixed ingredients`);
  if (!formula.safetyComplete || formula.reviewStatus !== "approved") failures.push(`Formula ${formula.formulaId} is not approved with complete safety fields`);
  for (const item of [...formula.ingredients, ...formula.optionalIngredients]) {
    if (!ingredientIds.has(item.ingredientId)) failures.push(`Formula ${formula.formulaId} references missing ingredient ${item.ingredientId}`);
    if (!item.role || !item.reason) failures.push(`Formula ${formula.formulaId} ingredient ${item.ingredientId} lacks role or reason`);
  }
  for (const group of formula.requiredAnswerGroups) for (const optionId of group.optionIds) if (!questionOptionIds.has(optionId)) failures.push(`Formula ${formula.formulaId} references missing answer option ${optionId}`);
  if (formula.doseText && !(formula.doseReviewed && formula.sourceVerified && formula.reviewStatus === "approved")) failures.push(`Formula ${formula.formulaId} has an unreviewed dose`);
  if (formula.sourceType === "product-owner-rule" && formula.sourceReferences.some((source) => /古方|倪海廈原方/u.test(source.title))) failures.push(`Formula ${formula.formulaId} mislabels a product rule as a classical formula`);
  const knowledgeSources = formula.sourceReferences.filter((source) => source.knowledgeEntryId);
  if (!knowledgeSources.length) failures.push(`Formula ${formula.formulaId} has no published KnowledgeEntry source`);
  for (const source of knowledgeSources) if (!publishedEntryIds.has(source.knowledgeEntryId!)) failures.push(`Formula ${formula.formulaId} references missing KnowledgeEntry ${source.knowledgeEntryId}`);
  if (formula.category === "traditional-formula-knowledge" && formula.displayMode !== "knowledge-only") failures.push(`High-risk classic ${formula.formulaId} must be knowledge-only`);
}

if (constitutionQuestions.length < 30 || constitutionQuestions.length > 45) failures.push(`Question count must be 30-45, got ${constitutionQuestions.length}`);
if (patterns.length !== 12) failures.push(`Pattern count must be 12, got ${patterns.length}`);
if (formulas.length < 24) failures.push(`Formula Library must contain at least 24 entries, got ${formulas.length}`);
for (const pattern of patterns) if (formulas.filter((formula) => formula.suitablePatterns.includes(pattern.id)).length < 2) failures.push(`Pattern ${pattern.id} needs at least two fixed formulas`);

if (failures.length) {
  console.error("Data validation failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Data validation passed: ${constitutionQuestions.length} questions, ${patterns.length} patterns, ${ingredients.length} ingredients, ${formulas.length} formulas, ${classics.length} verified classics.`);
