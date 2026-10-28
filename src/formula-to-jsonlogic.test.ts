import { test } from "node:test";
import assert from "node:assert/strict";

import { formulaToJsonlogic } from "./formula-to-jsonlogic.ts";

test("exports `formulaToJsonlogic`", () => {
	assert.equal(typeof formulaToJsonlogic, "function");
});

const expectResult: [any, any][] = [
	["TRUE", true],
	["NOT(null)", { "!": [null] }],
	["NOT(NOT(false))", { "!!": [false] }],
	["CUSTOM()", { custom: [] }],
	["1+2*3", { "+": [1, { "*": [2, 3] }] }],
	["8/2", { "/": [8, 2] }],
	['"a"&"b"', { cat: ["a", "b"] }],
	["1<>2", { "!==": [1, 2] }],
	["-A1", { "-": [0, { var: "A1" }] }],
	['CONCAT(",",";")', { concat: [",", ";"] }],
	["SUM({1})", { sum: [[[1]]] }],
	[
		"SUM({1,2;3,4})",
		{
			sum: [
				[
					[1, 2],
					[3, 4],
				],
			],
		},
	],
	["true", true],
	["FALSE", false],
	["false", false],
	["null", null],
	["NULL", null],
	["0", 0],
	["1", 1],
	["10", 10],
	["123123", 123123],
	["0123123", 123123],
	["123.45", 123.45],
	["0.45", 0.45],
	[`""`, ""],
	[`"a"`, "a"],
	[`"Hello world!"`, "Hello world!"],
	[`"Hello\nworld!"`, "Hello\nworld!"],
	[`"IF(a,b)"`, "IF(a,b)"],
	[`"Escaped quote -> "" very cool!"`, 'Escaped quote -> " very cool!'],
	[`"0"`, "0"],
	[`"1"`, "1"],
	[`"null"`, "null"],
	[`"true"`, "true"],
	[`"false"`, "false"],
	["(1+2)", { "+": [1, 2] }],
	["(1*2)+3", { "+": [{ "*": [1, 2] }, 3] }],
];

for (const [input, expectation] of expectResult) {
	test(`parses ${JSON.stringify(input)}`, () => {
		assert.deepStrictEqual(formulaToJsonlogic(input), expectation);
	});
}

test(`parses "IF(foo=1,"a","b")"`, () => {
	assert.deepStrictEqual(formulaToJsonlogic(`IF(foo=1,"a","b")`), {
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

test(`parses " IF( foo = 1 , " a " , " b " ) "`, () => {
	assert.deepStrictEqual(
		formulaToJsonlogic(` IF( foo = 1 , " a " , " b " ) `),
		{
			if: [
				{
					"===": [
						{
							var: "foo",
						},
						1,
					],
				},
				" a ",
				" b ",
			],
		},
	);
});

test(`parses "IF(null=null,null,NULL)"`, () => {
	assert.deepStrictEqual(formulaToJsonlogic("IF(null=null,null,NULL)"), {
		if: [
			{
				"===": [null, null],
			},
			null,
			null,
		],
	});
});

test(`parses "OR(true,false)"`, () => {
	assert.deepStrictEqual(
		formulaToJsonlogic("AND(OR(true,false),or(TRUE,FALSE))"),
		{
			and: [
				{
					or: [true, false],
				},
				{
					or: [true, false],
				},
			],
		},
	);
});

// Error handling
test(`throws "`, () => {
	assert.throws(() => formulaToJsonlogic(`"a`), /Unclosed quote \("\) at 1/);
});

test(`throws OR("asd)`, () => {
	assert.throws(
		() => formulaToJsonlogic(`OR("asd)`),
		/Unclosed quote \("\) at 4/,
	);
});

test("throws (", () => {
	assert.throws(
		() => formulaToJsonlogic("("),
		/Unclosed parenthesis "\(" at 1/,
	);
});

test("throws OR(", () => {
	assert.throws(
		() => formulaToJsonlogic("OR("),
		/Unclosed parenthesis "\(" at 3/,
	);
});
