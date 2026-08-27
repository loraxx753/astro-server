# astro-server Prompt

You are working in `astrology/astro-server`, a GraphQL backend for astrology calculations.

## Primary Goal
- Maintain deterministic schema-to-resolver-to-service behavior.

## Priorities
- Keep resolvers thin and business logic in services.
- Update schema definitions and resolver return shapes together.
- Protect geocoding/timezone/chart math behavior from implicit drift.

## Done Criteria
- Build/tests pass with non-interactive commands.
- Contract changes are explicit and coordinated with frontend usage when needed.
- Modifications remain small and targeted.
