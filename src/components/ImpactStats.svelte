<script lang="ts">
  import impactData from '../data/impact.json'
  import { ImpactStatSchema } from '../data/schema.ts'
  import StatView from './Stat.svelte'

  const items = impactData.map((i) => ImpactStatSchema.parse(i))
</script>

<ul class="impact">
  {#each items as i (i.id)}
    <li>
      <StatView stat={i.stat} label={i.label} />
      {#if i.context}<p class="ctx">{i.context}</p>{/if}
    </li>
  {/each}
</ul>

<style>
  .impact {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 22px;
    border-top: 2px solid var(--ink);
    padding-top: 16px;
  }
  .ctx {
    margin: 6px 0 0;
    font-size: 0.86rem;
    color: var(--ink-2);
    max-width: 34ch;
  }
</style>
