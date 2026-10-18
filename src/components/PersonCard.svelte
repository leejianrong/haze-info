<script lang="ts">
  import type { Person } from '../data/schema.ts'
  import { formatDate } from '../lib/format.ts'

  let { person }: { person: Person } = $props()
</script>

<article class="person" data-person={person.id}>
  <div class="photo">
    {#if person.portrait}
      <img
        src={person.portrait.url}
        alt={`Portrait of ${person.name}`}
        width="120"
        height="150"
        loading="lazy"
        referrerpolicy="no-referrer"
      />
      <p class="credit">
        <a href={person.portrait.sourceUrl} rel="noopener">Photo: {person.portrait.credit}</a>
        ({person.portrait.licence})
      </p>
    {:else}
      <svg
        class="silhouette"
        viewBox="0 0 120 150"
        role="img"
        aria-label={`No portrait available for ${person.name}`}
      >
        <rect width="120" height="150" class="bg" />
        <circle cx="60" cy="58" r="26" class="fg" />
        <path d="M14 150 q0 -58 46 -58 q46 0 46 58z" class="fg" />
      </svg>
    {/if}
  </div>

  <div class="body">
    <h4>{person.name}</h4>
    <p class="role">
      {person.role}, {person.organisation}.
      <a href={person.roleSource.url} rel="noopener">{person.roleSource.publisher}</a>
    </p>

    {#if person.quotes.length === 0}
      <p class="none">No quote about the haze has been recorded.</p>
    {/if}
    {#each person.quotes as q (q.source.url + q.text)}
      <figure class="quote">
        <blockquote>&ldquo;{q.text}&rdquo;</blockquote>
        {#if q.translated}
          <p class="translated">
            Translated from {q.original?.language === 'id' ? 'Indonesian' : q.original?.language}.
            <span lang={q.original?.language}>Original: &ldquo;{q.original?.text}&rdquo;</span>
          </p>
        {/if}
        <figcaption>
          {formatDate(q.date)}. {q.context}
          <a href={q.source.url} rel="noopener">{q.source.publisher}</a>
          {#if q.replyUrl}
            <a class="reply" href={q.replyUrl} rel="noopener">Company response</a>
          {/if}
        </figcaption>
      </figure>
    {/each}
  </div>
</article>

<style>
  .person {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--ink);
    background: var(--paper);
  }
  .photo img,
  .silhouette {
    display: block;
    width: 120px;
    height: 150px;
    object-fit: cover;
    border: 1px solid var(--ink);
  }
  .silhouette .bg {
    fill: color-mix(in srgb, var(--ink) 12%, var(--paper));
  }
  .silhouette .fg {
    fill: color-mix(in srgb, var(--ink) 35%, var(--paper));
  }
  .credit {
    margin: 4px 0 0;
    font-family: var(--f-data);
    font-size: 0.6rem;
    color: var(--ink-2);
    max-width: 120px;
  }
  h4 {
    margin: 0;
    font-family: var(--f-display);
    font-stretch: 72%;
    font-weight: 800;
    font-size: 1.6rem;
    line-height: 1.05;
  }
  .role {
    margin: 4px 0 12px;
    font-family: var(--f-data);
    font-size: 0.74rem;
    color: var(--ink-2);
  }
  .none {
    margin: 0;
    font-size: 0.9rem;
    color: var(--ink-2);
  }
  .quote {
    margin: 0 0 14px;
    border-left: 3px solid var(--ember);
    padding-left: 12px;
  }
  blockquote {
    margin: 0;
    font-size: 1.05rem;
  }
  .translated,
  figcaption {
    margin: 6px 0 0;
    font-family: var(--f-data);
    font-size: 0.7rem;
    color: var(--ink-2);
  }
  .reply {
    margin-left: 8px;
  }
  @media (max-width: 520px) {
    .person {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
