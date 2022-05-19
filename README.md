# SLA-TS

TypeScript library to help building SLA4API compliant API contracts.
Provides a model compliant with the schema, and a internal DSL using the builder pattern with capabilities to generate the JSON and YAML version of the SLA contract. 

[![Node.js CI](https://github.com/metadevpro/sla-ts/actions/workflows/node.js.yml/badge.svg)](https://github.com/metadevpro/sla-ts/actions/workflows/node.js.yml)

Conforms to the specification at [SLA4API 1.0.0 Draft](https://github.com/isa-group/SLA4OAI-Specification/blob/main/versions/1.0.0-Draft.md)

## Contains

Under `src/` you will find:

- `model/` The schema for a valid SLA Document (plans & agreements).
- `dsl/`   A utility interanl DSL to build SLA documents.
- `validator/` A validator for SLA documents.
- `cli/` A command line interface to generate documentation an validation for an SLA document.

## Install

Locally in your project:

```bash
npm i sla-ts --save
```

Globally as a CLI tool: _(planned / not yet)_

```bash
npm i -g sla-ts
```

## Test

```bash
npm test
```

## How to use the CLI

Locally:

```bash
npm run cli
npm run cli validate samples/sla1-invalid.json
npm run cli validate samples/sla1.yaml
npm run cli document samples/sla1.yaml samples/sla1.html
```

As a global tool: _(planned / not yet)_

```bash
sla-ts
sla-ts validate samples/sla1-invalid.json
sla-ts validate samples/sla1.yaml
sla-ts document samples/sla1.yaml samples/sla1.html
```

## Versions & Changelog

See [changelog](changelog.md).

## References

- SLA4OAI Spec 1.0.0  https://github.com/isa-group/SLA4OAI-Specification/blob/main/versions/1.0.0-Draft.md
- OpenAPI spec 3.1.0. https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md

## License

Licensed under the MIT License.

## Credits

Contact: Pedro J. Molina | github: [pjmolina](https://github.com/pjmolina) | twitter: [pmolinam](https://twitter.com/pmolinam)

(c) 2022. Pedro J. Molina at Metadev S.L. https://metadev.pro & contributors.