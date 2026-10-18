<script lang="ts">
  import primer from '../data/primer.json'
  import { PrimerCardSchema } from '../data/schema.ts'

  const cards = primer.map((c) => PrimerCardSchema.parse(c))
  let index = $state(0)
  let showFacts = $state(false)
  const card = $derived(cards[index])

  function go(i: number) {
    index = Math.max(0, Math.min(cards.length - 1, i))
    showFacts = false
  }
</script>

<div
  class="primer"
  role="group"
  aria-roledescription="carousel"
  aria-label="Haze explained in three steps"
  data-step={index}
>
  <p class="step">Step {index + 1} of {cards.length}</p>
  <h3>{card.title}</h3>
  <p class="summary">{card.summary}</p>

  <button class="toggle" aria-expanded={showFacts} onclick={() => (showFacts = !showFacts)}>
    {showFacts ? 'Hide the evidence' : 'Show the evidence'}
  </button>
  {#if showFacts}
    <ul class="facts">
      {#each card.facts as f (f.text)}
        <li>
          {f.text}
          <a href={f.source.url} rel="noopener">{f.source.publisher}</a>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="nav">
    <button class="btn alt" disabled={index === 0} onclick={() => go(index - 1)}>Back</button>
    <button class="btn" disabled={index === cards.length - 1} onclick={() => go(index + 1)}>
      Next
    </button>
    <div class="dots">
      {#each cards as c, i (c.id)}
        <button
          aria-label={`Go to step ${i + 1}: ${c.title}`}
          aria-current={i === index ? 'true' : 'false'}
          onclick={() => go(i)}
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  .primer {
    background: var(--paper);
    border: 1px solid var(--ink);
    padding: clamp(16px, 3vw, 28px);
    display: grid;
    gap: 14px;
  }
  .step {
    font-family: var(--f-data);
    font-size: 0.72rem;
    color: var(--ink-2);
    margin: 0;
  }
  h3 {
    font-family: var(--f-display);
    font-stretch: 72%;
    font-weight: 800;
    font-size: clamp(1.7rem, 3.4vw, 2.3rem);
    line-height: 1.05;
    margin: 0;
  }
  .summary {
    margin: 0;
  }
  .toggle {
    justify-self: start;
    background: transparent;
    border: 0;
    padding: 0;
    font-family: var(--f-data);
    font-size: 0.78rem;
    color: var(--ember-text);
    text-decoration: underline;
    cursor: pointer;
  }
  .facts {
    margin: 0;
    padding-left: 1.1em;
    font-size: 0.92rem;
    color: var(--ink-2);
    display: grid;
    gap: 8px;
  }
  .facts a {
    font-family: var(--f-data);
    font-size: 0.7rem;
    margin-left: 4px;
  }
  .nav {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .btn {
    font-family: var(--f-display);
    font-stretch: 80%;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 1rem;
    background: var(--ink);
    color: var(--ground);
    border: 1px solid var(--ink);
    padding: 10px 18px;
    cursor: pointer;
  }
  .btn.alt {
    background: transparent;
    color: var(--ink);
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .dots {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }
  .dots button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--ink);
    background: transparent;
    padding: 0;
    cursor: pointer;
  }
  .dots button[aria-current='true'] {
    background: var(--ember);
    border-color: var(--ember);
  }
</style>
