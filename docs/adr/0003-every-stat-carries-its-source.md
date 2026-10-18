# ADR-0003: Every statistic is a record with source, as-of date and method, enforced in CI

- Status: Accepted
- Date: 2026-10-18
- Deciders: Jian

## Context

Sources already disagree. Singapore's October 9 PSI peak is reported as 181 by one outlet and 192 by another. Burned-area totals differ between Nusantara Atlas, the Forestry Ministry's SiPongi system and Walhi because their methods and periods differ. Trust is the product.

## Decision

Statistics are stored as `{ value, unit, source: {title, url, publisher}, asOf, method }` in typed JSON under `src/data/`. Components render stats only through a `<Stat>` component that always exposes the source and date. A `validate-data` script, run in CI and pre-push, fails on a missing field, a malformed date, or a source URL that does not resolve. Where primary sources conflict, the methodology page names which one the site uses (NEA for PSI).

## Alternatives considered

| Option                                       | Why not                                               |
| -------------------------------------------- | ----------------------------------------------------- |
| Numbers written directly in Svelte templates | Unauditable, easy to leave uncited                    |
| Footnotes at page end                        | Readers do not follow them; cannot be machine-checked |

## Consequences

Authoring is slower. Link rot will fail builds, so the URL check must tolerate transient failures (retry, and treat paywalled hosts as warnings). The site is credible and every number can be audited.
