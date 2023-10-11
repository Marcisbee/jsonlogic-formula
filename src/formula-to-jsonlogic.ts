const ANY_REGEX_BREAK = /[&;,=><+\-)\*\/]/;

const FN_SEP = ", ";
const FN_NAME_VARIABLE = "V";
const FN_NAME_FUNCTION = "F";
const FN_NAME_OPERATOR = "O";

function parse(ast: any, joinKey = ""): any {
	if (ast == null) {
		return "void 0";
	}

	if (Array.isArray(ast)) {
		if (!joinKey && ast.length > 1) {
			return `[${ast.map((a) => parse(a)).join(",")}]`;
		}

		return ast.map((a) => parse(a)).join(joinKey);
	}

	if (typeof ast === "string") {
		return JSON.stringify(ast);
	}

	return ast.toString();
}

const VariableTokenKey = "@VAR";
function VariableToken(
	variable: string,
	leftSheet?: string,
	rightSheet?: string,
) {
	return {
		$key: VariableTokenKey,
		variable,
		leftSheet,
		rightSheet,
		toString() {
			return `${FN_NAME_VARIABLE}(${JSON.stringify(
				this.variable,
			)}, ${JSON.stringify(this.leftSheet)}, ${JSON.stringify(
				this.rightSheet,
			)})`;
		},
	};
}

const FunctionTokenKey = "@FN";
function FunctionToken(name: string, args: any) {
	return {
		$key: FunctionTokenKey,
		name,
		args,
		toString() {
			return `${FN_NAME_FUNCTION}('${this.name}', ${parse(this.args, FN_SEP)})`;
		},
	};
}

const OperatorTokenKey = "@OP";
function OperatorToken(operator: string, left: any, right?: any) {
	return {
		$key: OperatorTokenKey,
		operator,
		left,
		right,
		toString() {
			return `${FN_NAME_OPERATOR}('${this.operator}', ${parse(
				this.left,
				FN_SEP,
			)}, ${parse(this.right, FN_SEP)})`;
		},
	};
}

function tokneize(value: string) {
	const chunks = value
		.split(
			/("[^"]*"|'[^']*'|\#[A-Z\/0_]+[\!?]?|\[[^\]]*\]|[\w\.]+\s*\(|>=|<=|<>|[!&:;,+\-\/*()=<>%^\s{}@])/,
		)
		.filter((value) => !!value);
	let i = 0;
	let iLen = 0;
	let lastWasText = false;
	let lastWasSpace = false;
	let arrayMode = false;
	let arrayDepth = 0;

	return parseGroups().filter((value) => value !== ",");

	function parseGroups(breakOn?: RegExp) {
		const group: any[] = [];

		let c: string;
		while ((c = chunks[i])) {
			const last = chunks[i - 1];
			const next = chunks[i + 1];
			const len = c.length;

			const _lastWasText = lastWasText;

			lastWasText = false;

			iLen += len;
			lastWasSpace = c === "!" ? lastWasSpace : last === " ";

			if (arrayMode && arrayDepth === 1 && c !== "}") {
				arrayDepth = 2;
				group.push(parseGroups(/}/));
				continue;
			}

			if (c[0] === '"' && c[len - 1] === '"') {
				i++;
				// Handle string escaping with double quotes `60""` => `60"`
				if (_lastWasText) {
					group.push(`${group.pop()}"${c.slice(1, -1)}`);
				} else {
					group.push(c.slice(1, -1));
				}
				lastWasText = true;
				continue;
			}

			if (c[0] === "'" && c[len - 1] === "'") {
				i++;
				continue;
			}

			if (breakOn?.test(c)) {
				return group;
			}

			// Eat whitespace
			if (c === " " || c === "\n" || c === "\r" || c === "\t") {
				i++;
				continue;
			}

			if (arrayMode && c === ";") {
				arrayDepth = 1;
				i++;
				return group;
			}

			if (arrayMode && c === ",") {
				arrayDepth = 2;
				i++;
				continue;
			}

			if (c === "{") {
				if (arrayMode) {
					throw new Error("Nested arrays are not supported");
				}

				arrayMode = true;
				arrayDepth = 1;
				i++;
				group.push(parseGroups(/}/));
				continue;
			}

			if (c === "}" && arrayDepth === 2) {
				arrayDepth = 1;
				continue;
			}

			if (c === "}") {
				arrayMode = false;
				arrayDepth = 0;
				i++;
				continue;
			}

			// Handle functions SUM(...)
			if (len > 1 && c.charAt(len - 1) === "(") {
				i++;
				const token = FunctionToken(
					c.slice(0, -1).trim().toUpperCase(),
					parseGroups().filter((v) => "," !== v),
				);
				group.push(token);

				if (chunks[i - 1] !== ")") {
					throw new Error(`Expected ")" at position ${iLen}`);
				}

				continue;
			}

			if (c === ")") {
				i++;
				return group;
			}

			if (c === "%") {
				i++;
				const token = OperatorToken(c, group.pop());
				group.push(token);
				continue;
			}

			if (c === "*" || c === "/" || c === "&") {
				i++;
				const token = OperatorToken(
					c,
					group.pop(),
					parseGroups(ANY_REGEX_BREAK),
				);
				group.push(token);
				continue;
			}

			if (c === "+" || c === "-" || c === "^") {
				i++;
				// Account for "-1", "+1", "-A1" etc.
				const lastToken = group[group.length - 1];
				if (
					lastToken === "," ||
					lastToken === ";" ||
					lastToken === "" ||
					lastToken == null
				) {
					const token = OperatorToken(c, "0", parseGroups(ANY_REGEX_BREAK));
					group.push(token);
					continue;
				}

				const token = OperatorToken(
					c,
					group.pop(),
					parseGroups(/[;,=><+\-^&)]/),
				);
				group.push(token);
				continue;
			}

			if (
				c === "=" ||
				c === "<>" ||
				c === "<=" ||
				c === ">=" ||
				c === "<" ||
				c === ">"
			) {
				i++;
				const token = OperatorToken(c, group.pop(), parseGroups(/[\;\,=><)]/));
				group.push(token);
				continue;
			}

			// Handle numbers
			// If they are not surrounded by `:` they are not range cells (e.g. 1:2)
			if (/^[0-9.][0-9.,]*$/.test(c) && last !== ":" && next !== ":") {
				i++;
				group.push(Number(c.replace(/,/g, ".")));
				continue;
			}

			if (c === "TRUE") {
				i++;
				group.push(true);
				continue;
			}

			if (c === "FALSE") {
				i++;
				group.push(false);
				continue;
			}

			if (c === "NULL") {
				i++;
				group.push(null);
				continue;
			}

			// Handle variables
			// - Starts with a letter or underscore (_) or backslash (\)
			// - Doesn't include a space or character that isn't allowed
			// - Doesn't conflict with an existing name in the workbook.
			if (/^[A-Za-z_\\][\w.]*$/.test(c)) {
				const token = VariableToken(c);
				group.push(token);

				i++;
				continue;
			}

			group.push(c);
			i++;
		}

		return group;
	}
}

function OPERATOR(type: string, ...args: any[]) {
	if (type === "=") {
		return {
			"===": args,
		};
	}

	if (type === "<>") {
		return {
			"!==": args,
		};
	}

	if (type === "&") {
		return {
			cat: args,
		};
	}

	return {
		[type]: args,
	};
}

function FUNCTION(type: string, ...args: any[]) {
	if (type === "NOT") {
		if (args[0]["!"]) {
			return {
				"!!": args[0]["!"],
			};
		}

		return {
			"!": args,
		};
	}

	return {
		[type.toLowerCase()]: args,
	};
}

function VARIABLE(name: string) {
	return {
		var: name,
	};
}

export function formulaToJsonlogic(value: string) {
	const fn = new Function(
		FN_NAME_VARIABLE,
		FN_NAME_FUNCTION,
		FN_NAME_OPERATOR,
		"return " + parse(tokneize(value)),
	);

	return fn(VARIABLE, FUNCTION, OPERATOR);
}
