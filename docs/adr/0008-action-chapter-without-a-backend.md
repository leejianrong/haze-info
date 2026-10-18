# ADR-0008: Provide a "Take action" chapter built from links and pre-filled messages, with no data collection

- Status: Accepted
- Date: 2026-10-18
- Deciders: Jian

## Context

The goal includes putting pressure on companies and governments so that change happens. The project is frontend only, so we cannot host petitions, store signatures or send email. Collecting personal data would also add privacy duties the project does not want. The site names specific companies, so action messages must obey the same attribution rules as the rest of the site.

## Decision

Action cards are data (`target`, `ask`, `template`, `channel`). Channels are `mailto:`, a link to a target's own contact or social page, or a link to an established organisation's campaign. Templates cite site statistics by record id so the numbers stay current and sourced. A message that names a company uses wording derived from its `allegationStatus` (ADR-0002) and asks for a specific, checkable thing (publish fire-free supply chain data, disclose concession boundaries, support a named investigation). Nothing the user types is sent to or stored by us. The methodology page states that the site is an advocacy project.

## Alternatives considered

| Option                              | Why not                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Own petition with signature counter | Needs a backend and personal data; out of scope                                      |
| Link out to NGO campaigns only      | Weaker; readers drop off without a concrete first step. NGO links are still included |
| No call to action                   | Contradicts the stated purpose                                                       |

## Consequences

We cannot measure how many people acted. Contact details go stale, so the validator checks links and a person verifies each address at writing time. Pre-written messages can be sent in bulk, so they must be factual and civil. Mailto behaves unevenly on mobile, so every card also offers "copy message".
