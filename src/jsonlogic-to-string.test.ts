import { test } from "uvu";
import assert from "uvu/assert";

import { jsonlogicToFormula } from "./jsonlogic-to-string";

test("exports `jsonlogicToFormula`", () => {
	assert.instance(jsonlogicToFormula, Function);
});

test("parses `true`", () => {
	assert.equal(jsonlogicToFormula(true), "TRUE");
});

test("parses `{if: [true, 'a', 'b']}`", () => {
	assert.equal(
		jsonlogicToFormula({ if: [true, "a", "b"] }),
		`IF(TRUE,"a","b")`,
	);
});

test.run();
