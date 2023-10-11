const OPERATOR_MAP: Record<string, string> = {
	"==": "=",
	"===": "=",
	"!=": "<>",
	"!==": "<>",
	CAT: "&",
};

// Logical operators
// ==
// ===
// !=
// !==
// !
// !!

// Numeric operations
// >, >=, <, and <=

// Arithmetic
// + - * / %

export function jsonlogicToFormula(value: any, depth = 0): string | string[] {
	if (Array.isArray(value)) {
		if (depth > 0) {
			return `{${value
				.map((v) => jsonlogicToFormula(v, depth + 1))
				.join(";")}}`;
		}

		return value.flatMap((v) => jsonlogicToFormula(v, depth + 1));
	}

	if (typeof value === "object" && value) {
		const keys = Object.keys(value);

		if (keys.length === 1) {
			const name = keys[0].toUpperCase();

			if (name === "VAR") {
				const result = value[keys[0]];

				if (typeof result === "string") {
					return result || "root";
				}

				return jsonlogicToFormula(result, depth + 1);
			}

			// New function restarts depth
			const result = jsonlogicToFormula(value[keys[0]], 0);
			const arrayResult = ([] as string[]).concat(result);

			if (/^[!=><]+$/.test(name) || name === "CAT") {
				const op = OPERATOR_MAP[name] || name;
				const chunk1 = arrayResult.slice(0, 2);
				const chunk2 = arrayResult.slice(1, 3);

				if (chunk2.length > 1) {
					return `AND(${chunk1.join(op)},${chunk2.join(op)})`;
				}

				if (op === "!") {
					return `NOT(${chunk1})`;
				}

				if (op === "!!") {
					return `NOT(NOT(${chunk1}))`;
				}

				return chunk1.join(op);
			}

			if (/^[+\-*\/%]+$/.test(name)) {
				const op = OPERATOR_MAP[name] || name;

				if (arrayResult.length === 1) {
					return `-${arrayResult.join(op)}`;
				}

				return arrayResult.join(op);
			}

			return `${name}(${arrayResult.join(",")})`;
		}

		// Not supported jsonlogic syntax
		return JSON.stringify(value);
	}

	if (typeof value === "boolean") {
		return String(value).toUpperCase();
	}

	return JSON.stringify(value);
}
