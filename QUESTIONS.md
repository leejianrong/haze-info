# Questions

Statuses: `DECIDED` (user answered) · `ASSUMED` (default taken, correct it if wrong) · `FORK` (waiting on the user) · `DEFERRED` (not needed this milestone).

Research context (as of 2026-10-18): Singapore 24h PSI ~181-192 (sources disagree); about 2M Malaysian students out of school Oct 9; flights cancelled. Nusantara Atlas: 285,914 ha burned Jan-Jul, 68,324 ha inside industrial concessions (palm 15,146 / mining 12,120 / pulp 10,485). Greenpeace (Oct 5) linked 20+ concessions; companies deny. Indonesia suspended 21 firms, penalised 20, investigating 19 unnamed.

## Open forks

None. Round 1 closed.

## Register

| ID  | Question                                                                  | Status   | Answer or default                                                         | Landed                  |
| --- | ------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- | ----------------------- |
| F1  | Attribution wording                                                       | DECIDED  | "Detected inside concession", status-based wording, show company response | ADR-0002                |
| F2  | Financials scope                                                          | DECIDED  | 8-10 companies, listed-parent filings only, else "undisclosed"            | ADR-0005                |
| F3  | Data freshness                                                            | DECIDED  | Snapshots plus live PSI with fallback; hotspots via scheduled Action      | ADR-0004                |
| F4  | Government stance                                                         | DECIDED  | Sourced commitment-versus-outcome timeline                                | ADR-0007                |
| F5  | Stack and hosting                                                         | DECIDED  | Vite + Svelte + TS on GitHub Pages (user's change from React)             | ADR-0001                |
| F6  | Language                                                                  | DECIDED  | English only, i18n-ready text                                             | PLAN §Scope             |
| F7  | Main experience                                                           | DECIDED  | Story-scroll with pinned map                                              | ADR-0006                |
| F8  | Purpose: educate newcomers, convey seriousness, drive pressure for change | DECIDED  | Primer, Take-action chapter, declared advocacy stance                     | PLAN §Purpose, ADR-0008 |
| Q9  | Primary user                                                              | ASSUMED  | Newcomer, SG/MY, mobile first                                             | PLAN §Users             |
| Q10 | Data model and identity                                                   | ASSUMED  | Slug IDs; every stat has source, asOf, method                             | ADR-0003                |
| Q11 | Storage                                                                   | ASSUMED  | Typed JSON in repo                                                        | PLAN §Implementation    |
| Q12 | Concurrency                                                               | ASSUMED  | n/a, no runtime writers; Action commits are the only automated writer     | ADR-0004                |
| Q13 | Failure behaviour                                                         | ASSUMED  | Live feed failure shows last snapshot with label; never blank             | ADR-0004                |
| Q14 | Dependencies                                                              | ASSUMED  | MapLibre GL (BSD-3), D3 (ISC), Vite (MIT), Svelte (MIT); keyless tiles    | PLAN §Implementation    |
| Q15 | Security and secrets                                                      | ASSUMED  | FIRMS key only as a repo secret in the Action; no trackers, no user data  | ADR-0004, ADR-0008      |
| Q16 | Versioning                                                                | ASSUMED  | Schema versioned; dated snapshots                                         | ADR-0003                |
| Q17 | Success measures                                                          | ASSUMED  | Uncited numbers = 0 (CI), Lighthouse mobile perf >= 85, a11y >= 95        | SLICES V3, V8           |
| Q18 | Concession polygon licence                                                | ASSUMED  | Reusable; verified first thing in V1                                      | PLAN A4, SLICES V1      |
| Q19 | Action targets and contacts                                               | ASSUMED  | Verified by a person at writing time                                      | PLAN A8, ADR-0008       |
| Q20 | Pre-launch legal review                                                   | DEFERRED | Recommended, the user's call                                              | PLAN §Open risks        |
| Q21 | 2015/2019 deep-dives, share cards, embeds, translations                   | DEFERRED | After MVP                                                                 | PLAN §Scope             |

## Coverage

| Category                 | Covered by               |
| ------------------------ | ------------------------ |
| Primary user and actors  | F8, Q9                   |
| Scope boundary           | F6, F8, PLAN §Scope      |
| Data model and identity  | Q10                      |
| State and storage        | Q11                      |
| Concurrency and conflict | Q12                      |
| Interfaces and contracts | F7, F8 (UI only, no API) |
| Failure behaviour        | Q13                      |
| External dependencies    | F5, Q14, Q18             |
| Runtime and deployment   | F5                       |
| Measurable success       | Q17                      |
| Security and secrets     | Q15                      |
| Versioning and migration | Q16                      |
| Legal (domain)           | F1, Q20                  |
