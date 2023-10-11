import { test } from "uvu";
import assert from "uvu/assert";

import { formulaToJsonlogic } from "./formula-to-jsonlogic";

test("exports `formulaToJsonlogic`", () => {
	assert.instance(formulaToJsonlogic, Function);
});

test(`parses "TRUE"`, () => {
	assert.equal(formulaToJsonlogic("TRUE"), true);
});

test(`parses "IF(foo=1,"a","b")"`, () => {
	assert.equal(formulaToJsonlogic(`IF(foo=1,"a","b")`), {
		if: [
			{
				"===": [
					{
						var: "foo",
					},
					1,
				],
			},
			"a",
			"b",
		],
	});
});

test.run();
