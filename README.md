# jsonlogic-formula
JsonLogic parser to and from spreadsheet formula syntax;

* **Small.** 1.6 kilobytes (minified and gzipped).
  Zero dependencies.
* **Smart.** Understands & parses custom functions.
* It has good **TypeScript** support.

```ts
import { formulaToJsonlogic } from "jsonlogic-formula"

const formula = "AND(OR(some.value,false),or(TRUE,FALSE))"

formulaToJsonlogic(formula) // => {"and":[{"or":[{"var":"some.value"},false]},{"or":[true,false]}]}
```
[live demo](https://dune.land/dune/895e714b-feb2-47d7-9261-0413737c9c84)

```ts
import { jsonlogicToFormula } from "jsonlogic-formula"

const logic = {"and":[{"or":[{"var":"some.value"},false]},{"or":[true,false]}]}

jsonlogicToFormula(logic) // => "AND(OR(some.value,false),or(TRUE,FALSE))"
```
[live demo](https://dune.land/dune/895e714b-feb2-47d7-9261-0413737c9c84)

## Install

```sh
npm install jsonlogic-formula
```

## API

### formulaToJsonlogic
```ts
function formulaToJsonlogic(value: string): jsonlogic
```

### jsonlogicToFormula
```ts
function jsonlogicToFormula(value: jsonlogic): string
```


# Motivation
Jsonlogic is very powerful tool, but it is not easy for the end users to understand it. Since anyone with basic Excel/Spreadsheet knowledge can understand formula syntax (e.g. `SUM(A1,B1)`) it makese sense to have a parser that can transform formula to jsonlogic and jsonlogic to formula. This makes UX way better.

## Development

Run `npm test`, `npm run test:csp`, `npm run lint`, and `npm run build`.
The CSP check runs parsing with JavaScript string compilation disabled.

Run `npm run benchmark` to measure repeated, varying, and 100-argument
formulas. It reports median/min/max microseconds per parse across nine batches,
after five warmup passes. Compare on the same machine and Node version; these
are local microbenchmarks, not application latency guarantees. To measure an
older parser with identical workloads, save that revision's
`src/formula-to-jsonlogic.ts` outside the repository and pass its absolute path
to `npm run benchmark -- /path/to/formula-to-jsonlogic.ts`.

# License
[MIT](LICENCE) &copy; [Marcis Bergmanis](https://twitter.com/marcisbee)
