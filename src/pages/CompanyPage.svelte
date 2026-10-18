<script lang="ts">
  import Stat from '../components/Stat.svelte'
  import { ALLEGATION_STATUSES, type Company } from '../data/schema.ts'
  import { STATUS_PHRASE } from '../data/wording.ts'
  import { formatDate } from '../lib/format.ts'

  let { company }: { company: Company } = $props()
</script>

<article>
  <a class="back" href="#/">All companies</a>
  <header>
    {#if company.parent}
      <p class="meta">Parent: {company.parent.name}{company.parent.listed ? ' (listed)' : ''}</p>
    {/if}
    <h1>{company.name}</h1>
    {#if company.summary}<p class="summary">{company.summary}</p>{/if}
  </header>

  {#each company.concessions as c (c.name)}
    <section class="block">
      <h2>{c.name}</h2>
      <p class="meta">{c.sector} · {c.region}</p>
      <div class="grid">
        <Stat stat={c.burnedHa} label="Burned in 2026" />
        <div>
          <h3>How strong is the evidence</h3>
          <ul class="ladder">
            {#each ALLEGATION_STATUSES as s (s)}
              <li class:on={s === c.allegationStatus}>{STATUS_PHRASE[s]}</li>
            {/each}
          </ul>
        </div>
        <div>
          <h3>What the company says</h3>
          {#if c.response.status === 'published'}
            <p>{c.response.summary}</p>
            <p class="meta">
              <a href={c.response.source.url} rel="noopener">{c.response.source.title}</a>,
              {formatDate(c.response.asOf)}
            </p>
          {:else if c.response.status === 'none-found'}
            <p class="pending">No response found as of {formatDate(c.response.asOf)}.</p>
          {:else}
            <p class="pending">Not researched yet.</p>
          {/if}
        </div>
      </div>
      <ul class="evidence">
        {#each c.evidence as e (e.summary)}
          <li>
            {e.summary} (<a href={e.source.url} rel="noopener">{e.source.publisher}</a>, {formatDate(
              e.asOf,
            )})
          </li>
        {/each}
      </ul>
    </section>
  {/each}

  <section class="block">
    <h2>Revenue and profit</h2>
    {#if 'undisclosed' in company.financials}
      <p class="undisclosed">Undisclosed</p>
      <p>{company.financials.reason}</p>
    {:else}
      <p class="meta">
        {company.financials.parent}, fiscal year {company.financials.fiscalYear}, {company
          .financials.currency}. Group figures, not the subsidiary's.
      </p>
      <div class="grid">
        <Stat stat={company.financials.revenue} label="Revenue" />
        <Stat stat={company.financials.netProfit} label="Net profit" />
      </div>
    {/if}
  </section>

  <section class="block">
    <h2>Land and environment</h2>
    <div class="grid">
      {#if 'undisclosed' in company.landHeldHa}
        <div>
          <h3>Land held</h3>
          <p class="pending">{company.landHeldHa.reason}</p>
        </div>
      {:else}
        <Stat stat={company.landHeldHa} label="Land held" />
      {/if}
      {#each company.environmentalImpact as s (s.method + s.asOf)}
        <Stat stat={s} />
      {/each}
    </div>
  </section>
</article>

<style>
  article {
    display: grid;
    gap: 28px;
  }
  .back {
    font-family: var(--f-data);
    font-size: 0.78rem;
    color: var(--ember-text);
  }
  h1 {
    font-family: var(--f-display);
    font-stretch: 72%;
    font-weight: 800;
    font-size: clamp(2.2rem, 6vw, 3.6rem);
    line-height: 1;
    margin: 4px 0 8px;
    text-wrap: balance;
  }
  h2 {
    font-family: var(--f-display);
    font-stretch: 78%;
    font-weight: 800;
    font-size: 1.8rem;
    line-height: 1.05;
    margin: 0 0 4px;
  }
  h3 {
    font-family: var(--f-data);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-2);
    margin: 0 0 8px;
  }
  .meta {
    font-family: var(--f-data);
    font-size: 0.78rem;
    color: var(--ink-2);
    margin: 0 0 10px;
  }
  .block {
    border-top: 2px solid var(--ink);
    padding-top: 18px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 24px;
  }
  .ladder {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 2px solid var(--rule);
  }
  .ladder li {
    padding: 4px 0 4px 16px;
    position: relative;
    color: var(--ink-2);
    font-size: 0.95rem;
  }
  .ladder li::before {
    content: '';
    position: absolute;
    left: -7px;
    top: 11px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--ground);
    border: 2px solid var(--rule);
  }
  .ladder li.on {
    color: var(--ink);
    font-weight: 600;
  }
  .ladder li.on::before {
    background: var(--ember);
    border-color: var(--ember);
  }
  .evidence {
    font-size: 0.9rem;
    color: var(--ink-2);
    padding-left: 1.1em;
  }
  .pending {
    border: 1px dashed var(--ink-2);
    padding: 10px 12px;
    color: var(--ink-2);
    font-size: 0.9rem;
  }
  .undisclosed {
    font-family: var(--f-display);
    font-stretch: 70%;
    font-weight: 800;
    font-size: 1.8rem;
    border-bottom: 3px solid var(--ember);
    width: fit-content;
    margin: 0 0 10px;
  }
</style>
