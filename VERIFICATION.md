# Verification log

## Actual checks in generation environment

1. `npm install --offline --ignore-scripts --no-audit --no-fund`: failed, ENOTCACHED, missing @dnd-kit/core in the offline cache. No network install was attempted because internet access is disabled.
2. `npm run build`: attempted; exit 127, `tsc: not found` (dependencies not installed).
3. `npm run lint`: attempted; exit 127, `eslint: not found` (dependencies not installed).
4. All 18 source TypeScript/TSX files parsed successfully using the environment's existing Babel parser with TypeScript and JSX plugins. This is syntax validation, not type checking.
5. Real seed and service source modules were transpiled with the environment's existing Babel tools and executed under Node against a memory-backed localStorage shim. Result:

```text
PASS: seed counts, create, update, conversion, double-conversion guard, delete, reset and persistence
```

The service test exercised initial counts, create, update, lead conversion, repeated-conversion rejection, deletion, reset and persistence. It did not test browser rendering, npm-installed tooling, TypeScript types, lint rules, drag/drop or accessibility.

## Required local checks

```sh
npm install
npm run build
npm run lint
npm test
npm run dev
```

Execute the README manual checklist before calling this application verified. Browser console warnings and UI behavior remain unverified.
