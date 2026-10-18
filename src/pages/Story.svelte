<script lang="ts">
  import { onMount } from 'svelte'
  import MapView from '../components/MapView.svelte'
  import PeopleSection from '../components/PeopleSection.svelte'
  import { peopleIn } from '../data/people.ts'
  import PsiBadge from '../components/PsiBadge.svelte'
  import ActionCards from '../components/ActionCards.svelte'
  import CompanyRanking from '../components/CompanyRanking.svelte'
  import HealthGuidance from '../components/HealthGuidance.svelte'
  import ImpactStats from '../components/ImpactStats.svelte'
  import BurnScale from '../components/BurnScale.svelte'
  import GovernmentTimeline from '../components/GovernmentTimeline.svelte'
  import Primer from '../components/Primer.svelte'
  import { CHAPTERS, chapterById, type ChapterId } from '../lib/chapters.ts'

  let active = $state<ChapterId>('source')
  const focus = $derived(chapterById(active).focus)
  const reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  onMount(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) active = e.target.id as ChapterId
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  })

  function go(id: ChapterId) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }
</script>

<div class="story" data-active-chapter={active}>
  <header class="hero">
    <h1>Haze Info</h1>
    <p class="lede">
      Fires in Indonesia are burning peat and plantation land. The smoke reaches Singapore and
      Malaysia within days.
    </p>
    <p class="meta"><a href="#/method">How we know</a></p>
  </header>

  <nav class="chapters" aria-label="Chapters">
    {#each CHAPTERS as c (c.id)}
      <button aria-current={active === c.id ? 'true' : undefined} onclick={() => go(c.id)}>
        {c.nav}
      </button>
    {/each}
  </nav>

  <div class="columns">
    <aside class="pin" aria-label="Map">
      <MapView {focus} />
    </aside>

    <div class="chapters-col">
      <section id="source">
        <h2>Where it starts</h2>
        <p>
          Fires are lit across Sumatra and Kalimantan in the dry season, to clear land. In dry years
          they spread into peat, which smoulders for weeks.
        </p>
        <Primer />
        <h3 class="sub">Big enough to see from space</h3>
        <BurnScale />
      </section>

      <section id="companies">
        <h2>Who holds the land</h2>
        <p>
          Fire inside a concession does not prove the holder lit it. Each profile shows how strong
          the evidence is and what the company says.
        </p>
        <CompanyRanking />
        <PeopleSection
          title="Who runs the listed parents"
          people={peopleIn(['company-leadership', 'company-spokesperson'])}
        />
      </section>

      <section id="people">
        <h2>Who breathes it</h2>
        <PsiBadge />
        <h3 class="sub">What it has done so far</h3>
        <ImpactStats />
        <h3 class="sub">Looking after yourself</h3>
        <HealthGuidance />
      </section>

      <section id="government">
        <h2>What Jakarta did</h2>
        <GovernmentTimeline />
        <PeopleSection title="Who said what" people={peopleIn(['government'])} />
      </section>

      <section id="act">
        <h2>What you can do</h2>
        <p>
          Each message is ready to send. It uses the figures on this page and says only what the
          evidence shows.
        </p>
        <ActionCards />
      </section>
    </div>
  </div>
</div>

<style>
  .hero {
    padding-bottom: 24px;
  }
  h1 {
    font-family: var(--f-display);
    font-stretch: 70%;
    font-weight: 800;
    font-size: clamp(3rem, 9vw, 6rem);
    line-height: 0.95;
    text-transform: uppercase;
    margin: 0 0 12px;
  }
  .lede {
    font-size: 1.2rem;
    max-width: 34ch;
  }
  .meta {
    font-family: var(--f-data);
    font-size: 0.8rem;
  }
  .chapters {
    position: sticky;
    top: 0;
    z-index: 6;
    display: flex;
    overflow-x: auto;
    background: var(--ground);
    border-block: 1px solid var(--ink);
    margin-inline: calc(-1 * max(16px, env(safe-area-inset-left, 0px)));
  }
  .chapters button {
    flex: 1 0 auto;
    background: transparent;
    border: 0;
    border-right: 1px solid var(--rule);
    padding: 14px 18px;
    font-family: var(--f-display);
    font-stretch: 75%;
    font-weight: 700;
    font-size: 1.05rem;
    text-transform: uppercase;
    color: var(--ink);
    white-space: nowrap;
    cursor: pointer;
  }
  .chapters button[aria-current='true'] {
    background: var(--ink);
    color: var(--ground);
  }
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
    gap: clamp(20px, 4vw, 48px);
    align-items: start;
    margin-top: 24px;
  }
  .pin {
    position: sticky;
    top: 64px;
    --map-h: min(70vh, 560px);
  }
  .chapters-col section {
    min-height: 70vh;
    padding-block: 12px 40px;
  }
  /* Skip layout and paint for chapters that are off screen on first load. */
  .chapters-col section:not(:first-child) {
    content-visibility: auto;
    contain-intrinsic-size: auto 900px;
  }
  .chapters-col section:last-child {
    min-height: 40vh;
  }
  h2 {
    font-family: var(--f-display);
    font-stretch: 72%;
    font-weight: 800;
    font-size: clamp(2.2rem, 5vw, 3.2rem);
    line-height: 1;
    margin: 0 0 16px;
    text-wrap: balance;
  }
  .sub {
    font-family: var(--f-display);
    font-stretch: 72%;
    font-weight: 800;
    font-size: 2rem;
    line-height: 1;
    margin: 40px 0 14px;
  }

  @media (max-width: 820px) {
    .columns {
      grid-template-columns: minmax(0, 1fr);
    }
    .pin {
      top: 52px;
      z-index: 5;
      --map-h: 24vh;
      margin-inline: calc(-1 * max(16px, env(safe-area-inset-left, 0px)));
    }
    .pin :global(.credit),
    .pin :global(.legend span) {
      display: none;
    }
    .chapters-col section {
      min-height: 60vh;
    }
  }
</style>
