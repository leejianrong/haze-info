# ADR-0006: Story-scroll with a pinned map, plus per-company pages

- Status: Accepted
- Date: 2026-10-18
- Deciders: Jian

## Context

The aim is to take a reader from where the fires are, to who holds the land, to who is harmed, to what the government did. A dashboard supports exploration but does not carry that argument.

## Decision

A single scrolling page with a short newcomer primer and five chapters (Source, Companies, People, Government, Take action). A MapLibre map stays pinned and changes layers per chapter. Each company card opens `#/company/<slug>`. A `#/method` page explains sources and wording rules. The scroll layout falls back to stacked sections on small screens, and the map sits above content rather than beside it.

## Alternatives considered

| Option                     | Why not                                                        |
| -------------------------- | -------------------------------------------------------------- |
| Map-first dashboard        | Weaker narrative; the audience is general public, not analysts |
| Separate pages per chapter | Loses the continuous argument and the shared map context       |

## Consequences

Scroll-driven map animation is the hardest part to do well on mobile and must be tested at 360px. Respect `prefers-reduced-motion`. Content order is fixed, so a reader who only wants one company must use the cards.
