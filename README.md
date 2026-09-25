# Anaplian.io

Personal website with a dark, minimal landing page and a billable hours calculator placeholder.

## Get started

Use Node.js 26 and npm (`nvm use` if you use nvm). CI reads the Node version from `.nvmrc`.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The home page is `/`; the placeholder is `/apps/billable-hours`. Direct navigation is supported by Vite and Cloudflare’s configured SPA fallback.

## Validation

```sh
npm run check
npm run build
npm run preview
```

`check` runs Oxlint, Oxfmt, strict TypeScript checks, and Vitest coverage. `npm test` runs tests once with coverage; `npm run test:watch` starts interactive tests. Coverage must reach 100% for branches, lines, functions, and statements in each source file. Only `src/index.tsx` is excluded from application coverage. Open `coverage/index.html` for the report.

Tests live beside their source files: `app.tsx` has `app.test.tsx`. Every application TypeScript module has a test mate, including the coverage-exempt entry point. Shared test setup remains in `tests/setup.ts`.

Use `npm run format` to apply formatting and lint fixes. Husky runs checks before commits and validates Conventional Commit messages. GitHub Actions runs checks and builds on pushes and pull requests.

## Cloudflare

`npm run preview:cloudflare` builds and runs a local Wrangler preview. `npm run deploy` builds and publishes using your configured Cloudflare credentials.

See [AGENTS.md](AGENTS.md) for contributor conventions.
