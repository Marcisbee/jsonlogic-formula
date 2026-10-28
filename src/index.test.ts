import { test } from "node:test";
import assert from "node:assert/strict";

import { formulaToJsonlogic, jsonlogicToFormula } from "./index.ts";

test("exports `formulaToJsonlogic`", () => {
	assert.equal(typeof formulaToJsonlogic, "function");
});

test("exports `jsonlogicToFormula`", () => {
	assert.equal(typeof jsonlogicToFormula, "function");
});
