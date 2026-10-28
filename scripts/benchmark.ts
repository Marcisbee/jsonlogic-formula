import { createRequire } from "node:module";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { formulaToJsonlogic } from "../src/formula-to-jsonlogic.ts";

// An optional source path allows the same workloads to measure a prior revision.
const require = createRequire(import.meta.url);
const parse: typeof formulaToJsonlogic = process.argv[2]
	? require(resolve(process.argv[2])).formulaToJsonlogic
	: formulaToJsonlogic;
const cases = {
	repeated: Array(1000).fill('IF(foo=1,"a",SUM(1,2,3))'),
	unique: Array.from(
		{ length: 1000 },
		(_, i) => `IF(foo=${i},"value ${i}",SUM(${i},2,3))`,
	),
	wide: Array(100).fill(
		`SUM(${Array.from({ length: 100 }, (_, i) => i).join(",")})`,
	),
};

console.log(`Node ${process.version}; microseconds per parse; 9 batches`);
for (const [name, inputs] of Object.entries(cases)) {
	for (let i = 0; i < 5; i++) {
		for (const input of inputs) parse(input);
	}
	const times = [];
	for (let i = 0; i < 9; i++) {
		const start = performance.now();
		for (let repeat = 0; repeat < 10; repeat++) {
			for (const input of inputs) parse(input);
		}
		times.push(((performance.now() - start) * 1000) / (10 * inputs.length));
	}
	times.sort((a, b) => a - b);
	console.log(name, { median: times[4], min: times[0], max: times[8] });
}
