<script lang="ts">
  import guidanceData from '../data/health-guidance.json'
  import { HealthGuidanceSchema } from '../data/schema.ts'

  const links = guidanceData.map((g) => HealthGuidanceSchema.parse(g))
</script>

<section class="guide" aria-label="Official health guidance">
  <p class="intro">
    For what to do about your own health, follow the official advice. We link to it and do not give
    medical advice.
  </p>
  <ul>
    {#each links as g (g.id)}
      <li>
        <a href={g.url} rel="noopener">{g.title}</a>
        <span class="pub">{g.publisher}</span>
        <span class="sum">{g.summary}</span>
      </li>
    {/each}
  </ul>
</section>

<style>
  .guide {
    background: var(--paper);
    border: 1px solid var(--ink);
    padding: clamp(14px, 3vw, 24px);
    display: grid;
    gap: 12px;
  }
  .intro {
    margin: 0;
    font-size: 0.96rem;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 14px;
  }
  li {
    display: grid;
    gap: 2px;
  }
  li a {
    font-family: var(--f-display);
    font-stretch: 80%;
    font-weight: 700;
    font-size: 1.1rem;
    line-height: 1.15;
  }
  .pub {
    font-family: var(--f-data);
    font-size: 0.7rem;
    color: var(--ink-2);
  }
  .sum {
    font-size: 0.9rem;
    color: var(--ink-2);
  }
</style>
