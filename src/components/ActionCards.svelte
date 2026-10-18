<script lang="ts">
  import actionData from '../data/actions.json'
  import { ActionCardSchema } from '../data/schema.ts'
  import { actionValues } from '../lib/action-values.ts'
  import { mailto, renderTemplate } from '../lib/actions.ts'
  import { formatDate } from '../lib/format.ts'

  const values = actionValues()
  const cards = actionData.map((c) => {
    const card = ActionCardSchema.parse(c)
    return { card, message: renderTemplate(card.template.body, values) }
  })
  let copiedId = $state<string | null>(null)
  let failedId = $state<string | null>(null)

  async function copy(id: string, text: string) {
    copiedId = failedId = null
    try {
      await navigator.clipboard.writeText(text)
      copiedId = id
    } catch {
      // Clipboard can be refused (older browsers, some app views). Select the text so Ctrl+C works.
      const el = document.getElementById(`msg-${id}`)
      if (el) {
        const r = document.createRange()
        r.selectNodeContents(el)
        const s = getSelection()
        s?.removeAllRanges()
        s?.addRange(r)
      }
      failedId = id
    }
  }
</script>

<div class="actions">
  {#each cards as { card, message } (card.id)}
    <article class="card" data-action={card.id}>
      <h3>{card.title}</h3>
      <p class="ask">{card.ask}</p>
      <p class="to">
        To: {card.target.name}{card.target.role ? `, ${card.target.role}` : ''}
        <span class="how">
          ({card.target.contact.kind === 'email' ? card.target.contact.value : 'contact page'}, read
          on
          <a href={card.target.contact.source.url} rel="noopener"
            >{card.target.contact.source.publisher}</a
          >
          {formatDate(card.target.contact.verifiedOn)})
        </span>
      </p>
      <p class="msg" id={`msg-${card.id}`}>{message}</p>
      <div class="buttons">
        <button class="btn" onclick={() => copy(card.id, message)}>Copy message</button>
        {#if card.target.contact.kind === 'email'}
          <a class="btn alt" href={mailto(card.target.contact.value, card.title, message)}
            >Open email</a
          >
        {:else}
          <a class="btn alt" href={card.target.contact.value} rel="noopener"
            >Open the contact page</a
          >
        {/if}
      </div>
      <p class="status" aria-live="polite">
        {#if copiedId === card.id}Copied{:else if failedId === card.id}Selected. Press Ctrl+C to
          copy.{/if}
      </p>
    </article>
  {/each}
</div>

<style>
  .actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .card {
    background: var(--paper);
    border: 1px solid var(--ink);
    padding: 18px;
    display: grid;
    gap: 10px;
    align-content: start;
  }
  h3 {
    margin: 0;
    font-family: var(--f-display);
    font-stretch: 78%;
    font-weight: 800;
    font-size: 1.35rem;
    line-height: 1.1;
  }
  .ask {
    margin: 0;
    font-size: 0.95rem;
  }
  .to {
    margin: 0;
    font-family: var(--f-data);
    font-size: 0.72rem;
    color: var(--ink-2);
  }
  .msg {
    margin: 0;
    white-space: pre-wrap;
    font-size: 0.88rem;
    background: var(--ground);
    border: 1px solid var(--rule);
    padding: 12px 14px;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .btn {
    font-family: var(--f-display);
    font-stretch: 80%;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.95rem;
    background: var(--ink);
    color: var(--ground);
    border: 1px solid var(--ink);
    padding: 10px 16px;
    cursor: pointer;
    text-decoration: none;
  }
  .btn.alt {
    background: transparent;
    color: var(--ink);
  }
  .status {
    margin: 0;
    min-height: 1.2em;
    font-family: var(--f-data);
    font-size: 0.72rem;
    color: var(--ink-2);
  }
</style>
