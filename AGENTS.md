# Repository Guidelines

## Build, Test, and Development Commands

- `npm ci`: install dependencies from `package-lock.json` and prepare Husky hooks.
- `npm run dev`: start the Vite development server.
- `npm run check`: run lint, formatting checks, strict TypeScript checking, and coverage tests.
- `npm run format`: apply lint fixes and format files with Oxfmt.
- `npm run build`: type-check and build the site into `dist/`.
- `npm run preview`: serve the existing production build locally.
- `npm run preview:cloudflare`: build and preview through Wrangler.
- `npm test`: run Vitest with enforced coverage thresholds.
- `npm run test:watch`: run Vitest interactively.
- `npm run release`: install dependencies, run all checks, and build.
- `npm run deploy`: build and publish to Cloudflare.

## Coding Style & Naming Conventions

Use two-space indentation, double-quoted strings, semicolons, ES modules, camelCase functions and variables, and lowercase filenames. Include `.ts` or `.tsx` extensions in local imports. Use kebab-case CSS names.

Do not write inline comments in code. Express intent through clear names and small, focused functions.

Never use TypeScript `any`, whether explicit or implicit. Use concrete types, generics, or `unknown` with appropriate narrowing. Do not suppress type errors to bypass this rule.

Use Oxfmt and Oxlint. Resolve unused locals, unused parameters, and switch fallthrough before committing.

## Component Design

Follow SOLID principles with small, focused files and composable React components with typed props and one responsibility. Prefer composition and simple abstractions. Keep business logic in pure, independently testable functions outside components. Use semantic HTML, accessible names, visible keyboard focus, and responsive styles.

## Testing Guidelines

Use Vitest and React Testing Library. Enforce 100% branch, statement, function, and line coverage per source file, including unimported files. The root React entry point, `src/index.tsx`, is the only application-code coverage exception. Do not lower thresholds or add other application-code exclusions. Cover alternate paths, boundaries, and errors as logic is introduced. Every application `.ts` or `.tsx` file must have an adjacent matching `*.test.ts` or `*.test.tsx` mate, including `index.tsx`. Keep route integration tests beside the app module; only shared test setup belongs in `tests/`. Test observable behavior with deterministic inputs.

Run `npm run check` and `npm run build` before merging. CI runs both. Manually verify visible UI changes at desktop and mobile sizes. Do not write implementation-mirroring tests merely to satisfy coverage.

## Commit & Pull Request Guidelines

Use Conventional Commits, following existing `feat:` and `fix:` messages. Husky runs checks before commits; Commitlint validates messages.

Keep pull requests focused. Describe changes, link issues, record validation, and include UI screenshots. Commit dependency lockfile updates; exclude generated output and local configuration.
