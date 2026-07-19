import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import schema from "../src/schemas/classic.schema.json" with { type: "json" };

const source = process.argv[2];
if (!source) {
  console.error("Usage: npm run import:classics -- path/to/classics.json");
  process.exit(1);
}

const input = JSON.parse(readFileSync(resolve(source), "utf8")) as unknown;
if (!Array.isArray(input)) {
  console.error("Classic import must be a JSON array.");
  process.exit(1);
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
for (const [index, entry] of input.entries()) {
  if (!validate(entry)) {
    console.error(`Entry ${index} failed schema validation: ${ajv.errorsText(validate.errors)}`);
    process.exit(1);
  }
  const item = entry as { reviewStatus: string; sourceStatus: string };
  if (item.reviewStatus === "approved" && item.sourceStatus !== "verified") {
    console.error(`Entry ${index} cannot be approved while sourceStatus is not verified.`);
    process.exit(1);
  }
}

const target = resolve("src/data/classics/imported.json");
writeFileSync(target, JSON.stringify(input, null, 2) + "\n", "utf8");
console.log(`Imported ${input.length} classic entries to ${target}. Run npm run validate:data before build.`);
