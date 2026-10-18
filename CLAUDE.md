# Haze Info

Interactive, frontend-only site about the October 2026 Indonesian haze: where it comes from, which companies hold the burning land, the human impact, the government response, and what readers can do. It is an advocacy project that wins on accuracy, not adjectives.

## Status

Planning is done; build has just started. Trust the code over the docs where they disagree, and update the docs.

| Thing                                               | State                                                     |
| --------------------------------------------------- | --------------------------------------------------------- |
| Plan, ADRs, slices                                  | Done: `PLAN.md`, `docs/adr/`, `SLICES.md`, `QUESTIONS.md` |
| App scaffold (Vite + Svelte + TS), CI, Pages deploy | Done, placeholder page only                               |
| Data schema, validator, company pages, map          | Not started (board: Pandan `HAZE`)                        |

## Commands

- `make` lists targets. `make install`, `make dev`, `make build`, `make gate`.
- `make gate` = lint + type-check + unit tests. Run it before every push; `make hooks` installs it as a pre-push hook.
- Work tracking: `pandan board use HAZE`, then `pandan list --column todo`.

## Rules that are easy to break

- Every statistic needs `source`, `asOf` and `method` (ADR-0003). Never write a number straight into a template.
- Never write that a company "caused" the haze unless its `allegationStatus` is `ministry-sanctioned` or `court-finding` (ADR-0002). Show the company's response where one exists.
- Company financials come from listed-parent filings only, otherwise "undisclosed" (ADR-0005).
- People profiles follow ADR-0009: officials in office and listed-parent leadership only, verbatim sourced quotes about the haze, a licence recorded for every portrait, no criminal-record styling.
- Frontend only. No backend, no cookies, no user data. Secrets live only as GitHub repo secrets (FIRMS key for the hotspot Action).
- Routing is hash-based and Vite `base` is `./` (ADR-0001).

## Workflow

- One branch per slice or story, PR-only into `main`, CI green before merge. Branch names start with the card ref, for example `haze-4-validate-data`.
- Move the card to done only after its PR merges.
- Deploys run from the CI success event and ship that exact SHA. They are off until the repo variable `DEPLOY_ENABLED` is `true`.

## Where things live

- `PLAN.md`: what and why. `SLICES.md`: build order and acceptance tests. `docs/adr/`: decisions. `QUESTIONS.md`: decision register.
- `src/`: the app. `scripts/`: tooling, including git hooks.
