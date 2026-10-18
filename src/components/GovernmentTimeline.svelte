<script lang="ts">
  import government from '../data/government.json'
  import { GovernmentEntrySchema } from '../data/schema.ts'
  import { formatDate } from '../lib/format.ts'
  import { dayLabel, groupByMonth, monthLabel } from '../lib/timeline.ts'

  const entries = government.map((e) => GovernmentEntrySchema.parse(e))
  const groups = groupByMonth(entries)
  let openId = $state<string | null>(groups[0]?.entries[0]?.id ?? null)
</script>

<div class="timeline">
  <p class="count">{entries.length} dated entries, each pairing a commitment with an outcome.</p>
  {#each groups as g (g.key)}
    <h3>{monthLabel(g.key)}</h3>
    <ul>
      {#each g.entries as e (e.id)}
        {@const open = openId === e.id}
        <li>
          <button
            class="head"
            aria-expanded={open}
            aria-controls={`panel-${e.id}`}
            onclick={() => (openId = open ? null : e.id)}
          >
            <span class="when">{dayLabel(e.date)}</span>
            <span class="t">{e.title}</span>
            <span class="pm" aria-hidden="true">{open ? '−' : '+'}</span>
          </button>
          <div class="body" id={`panel-${e.id}`} hidden={!open}>
            <div class="cols">
              <div>
                <h4>Commitment</h4>
                <p>{e.commitment}</p>
              </div>
              <div>
                <h4>Outcome</h4>
                <p>{e.outcome}</p>
              </div>
            </div>
            {#if e.officialResponse}
              <div class="response">
                <h4>Official response</h4>
                <p>{e.officialResponse.summary}</p>
              </div>
            {/if}
            <p class="sources">
              Sources:
              {#each e.sources as s, i (s.url)}
                <a href={s.url} rel="noopener">{s.publisher}</a>{i < e.sources.length - 1
                  ? ', '
                  : ''}
              {/each}
              . Checked {formatDate(e.asOf)}.
            </p>
          </div>
        </li>
      {/each}
    </ul>
  {/each}
</div>

<style>
  .timeline {
    display: grid;
    gap: 8px;
  }
  .count {
    font-family: var(--f-data);
    font-size: 0.74rem;
    color: var(--ink-2);
    margin: 0;
  }
  h3 {
    font-family: var(--f-data);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 16px 0 0;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--ink);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    border-bottom: 1px solid var(--rule);
  }
  .head {
    width: 100%;
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr) 1.6rem;
    gap: 10px;
    align-items: baseline;
    text-align: left;
    background: transparent;
    border: 0;
    padding: 14px 0;
    cursor: pointer;
    color: var(--ink);
  }
  .when {
    font-family: var(--f-data);
    font-size: 0.76rem;
    color: var(--ink-2);
  }
  .t {
    font-family: var(--f-display);
    font-stretch: 78%;
    font-weight: 700;
    font-size: 1.25rem;
    line-height: 1.12;
  }
  .pm {
    font-family: var(--f-data);
    text-align: right;
  }
  .body {
    padding: 0 0 16px;
    display: grid;
    gap: 12px;
  }
  .body[hidden] {
    display: none;
  }
  .cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  h4 {
    font-family: var(--f-data);
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-2);
    margin: 0 0 4px;
  }
  .body p {
    margin: 0;
    font-size: 0.96rem;
  }
  .response {
    border-left: 3px solid var(--ember);
    padding-left: 12px;
  }
  .sources {
    font-family: var(--f-data);
    font-size: 0.72rem;
    color: var(--ink-2);
  }
</style>
