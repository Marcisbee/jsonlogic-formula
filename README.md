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

# License
[MIT](LICENCE) &copy; [Marcis Bergmanis](https://twitter.com/marcisbee)
