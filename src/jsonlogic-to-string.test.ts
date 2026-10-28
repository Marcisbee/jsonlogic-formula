import { test } from "node:test";
import assert from "node:assert/strict";

import { jsonlogicToFormula } from "./jsonlogic-to-string.ts";

test("exports `jsonlogicToFormula`", () => {
	assert.equal(typeof jsonlogicToFormula, "function");
});

test("parses `true`", () => {
	assert.deepStrictEqual(jsonlogicToFormula(true), "TRUE");
});

test("parses `{if: [true, 'a', 'b']}`", () => {
	assert.deepStrictEqual(
		jsonlogicToFormula({ if: [true, "a", "b"] }),
		`IF(TRUE,"a","b")`,
	);
});
