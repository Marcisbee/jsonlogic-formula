import { test } from "uvu";
import assert from "uvu/assert";

import { formulaToJsonlogic, jsonlogicToFormula } from "./index";

test("exports `formulaToJsonlogic`", () => {
	assert.instance(formulaToJsonlogic, Function);
});

test("exports `jsonlogicToFormula`", () => {
	assert.instance(jsonlogicToFormula, Function);
});

test.run();
