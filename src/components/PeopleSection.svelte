<script lang="ts">
  import type { Person } from '../data/schema.ts'
  import PersonCard from './PersonCard.svelte'

  let { title, people }: { title: string; people: Person[] } = $props()
</script>

{#if people.length > 0}
  <section class="people" aria-label={title} data-people-section>
    <h3>{title}</h3>
    <p class="intro">
      Names and roles come from official sources. A quote shows what a person said, in their own
      words. It does not show who started any fire.
    </p>
    <div class="list">
      {#each people as p (p.id)}
        <PersonCard person={p} />
      {/each}
    </div>
  </section>
{/if}

<style>
  .people {
    margin-top: 40px;
    display: grid;
    gap: 12px;
  }
  h3 {
    font-family: var(--f-display);
    font-stretch: 72%;
    font-weight: 800;
    font-size: 2rem;
    line-height: 1;
    margin: 0;
  }
  .intro {
    margin: 0;
    font-size: 0.95rem;
    color: var(--ink-2);
  }
  .list {
    display: grid;
    gap: 14px;
  }
</style>
