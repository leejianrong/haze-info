# ADR-0009: Profile named individuals only as accountability cards with sourced quotes

- Status: Accepted
- Date: 2026-10-18
- Deciders: Jian

## Context

The site is adding profiles of the people behind the companies and the Indonesian government, with portraits and what they have said about the haze. This carries risks the company pages do not: harassment of individuals, defamation of people no authority has found at fault (ADR-0002), copyright in photographs, and mistranslation of quotes. The owner asked for "mugshots". The booking-photo look implies a criminal record, which contradicts the evidence-first approach that makes the site credible (ADR-0002, ADR-0007).

## Decision

**Who may be profiled**

1. Indonesian officials in office whose role is part of the response: the president, ministers, deputy ministers, agency heads and official spokespeople.
2. Directors and senior executives of the listed parent of a profiled company, taken from that company's own filings.
3. A named company spokesperson, but only as the author of a quote (no portrait).

Staff of private companies and of unlisted subsidiaries are never profiled.

**What a profile shows:** name, role with a link to the source for the role, a portrait where licensed, and quotes about the haze. Each quote is verbatim, with its date, the context it was said in, and a link to the source. Quotes made in Indonesian or Malay keep the original text beside our translation, and say that it is a translation. Where a company has responded, we link to the response.

**What a profile never shows:** criminal-record styling (booking photos, height charts, "wanted" language), claims of guilt or intent, quotes that are not about the haze, private details, or a portrait without a recorded licence and credit. A person with no licensed portrait gets a neutral silhouette.

**Enforcement:** the Person schema and `validate-data` reject a quote without source, date and context, a portrait without a licence, a translated quote without its original, a portrait on a spokesperson, and judging or criminal vocabulary in our own text (quotes are exempt because they are verbatim). Profiles are not deployed until a legal read is recorded (HAZE-32).

## Alternatives considered

| Option                                            | Why not                                                                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Mugshot-style grid for everyone named             | Implies criminality for people with no finding against them; invites harassment; weakens the site's credibility |
| Names and roles only, no portraits or quotes      | Safe but loses the force of seeing who said what                                                                |
| Profile all management of every concession holder | Reaches private individuals with no public role in the response; legal and safety risk                          |

## Consequences

Profiles are slower to produce, because every photo needs a licence and every quote a source. Many officials will start as silhouettes until a licensed portrait is found. Quotes cannot be trimmed to sharpen them, so some will read less punchily. In return each card can be defended line by line, and the owner can add or remove a person without touching code.
