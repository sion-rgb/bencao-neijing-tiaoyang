import Ajv2020 from "ajv/dist/2020.js";
import questionSchema from "../src/schemas/question.schema.json" with { type: "json" };
import patternSchema from "../src/schemas/pattern.schema.json" with { type: "json" };
import ingredientSchema from "../src/schemas/ingredient.schema.json" with { type: "json" };
import classicSchema from "../src/schemas/classic.schema.json" with { type: "json" };
import safetySchema from "../src/schemas/safety-rule.schema.json" with { type: "json" };
import { constitutionQuestions } from "../src/data/questions/constitutionQuestions";
import { patterns } from "../src/data/patterns/patterns";
import { ingredients } from "../src/data/ingredients/ingredients";
import { classics } from "../src/data/classics/classics";
import { safetyQuestions } from "../src/data/safety/safetyQuestions";
import { prohibitedIngredients } from "../src/data/safety/prohibited";

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

assertUnique("questions", constitutionQuestions.map((item) => item.id));
assertUnique("question options", constitutionQuestions.flatMap((item) => item.options.map((option) => option.optionId)));
assertUnique("patterns", patterns.map((item) => item.id));
assertUnique("ingredients", ingredients.map((item) => item.id));
assertUnique("classics", classics.map((item) => item.id));
assertUnique("safety questions", safetyQuestions.map((item) => item.id));

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

if (constitutionQuestions.length < 30 || constitutionQuestions.length > 45) failures.push(`Question count must be 30-45, got ${constitutionQuestions.length}`);
if (patterns.length !== 12) failures.push(`Pattern count must be 12, got ${patterns.length}`);

if (failures.length) {
  console.error("Data validation failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Data validation passed: ${constitutionQuestions.length} questions, ${patterns.length} patterns, ${ingredients.length} ingredients, ${classics.length} verified classics.`);
