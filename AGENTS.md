# AGENTS

Scope: this file applies to all work under astrology/astro-server/.

## Repo Identity
- Canonical role: astrology GraphQL backend.
- Stack: Node.js + TypeScript + Apollo GraphQL.

## Fast Start
- Install: `npm install`
- Dev: `npm run dev`
- Tests: `npm run test`, `npm run test:houses`
- Build: `npm run build`

## Architecture Notes
- Entry: `src/index.ts`.
- Schema merge point: `src/schemas/typeDefs.ts`.
- Resolver orchestration: `src/resolvers.ts`.
- Domain logic lives in `src/services/`.

## Jira
- Site: https://macovin.atlassian.net
- Project: Shimmering Stars (`SS`)
- Default issue type: Task
- Create and update tickets in `SS` unless the user names another project.
- Pair frontend work with `shimmering-stars` under the same `SS` project.

## Conventions That Matter
- Keep resolvers thin and push business logic into services.
- Preserve schema-first edits: update schema definitions and resolver shape together.
- Keep location/timezone/chart calculations deterministic and explicit.

## Working Rules for Agents
- Validate resolver/schema changes against frontend query usage when possible.
- Keep test commands non-interactive.
- Keep changes surgical and avoid unrelated refactors.
