<script lang="ts">
  import { PSI_ATTRIBUTION } from '../lib/psi.ts'
  import { BASEMAP_ATTRIBUTION } from '../lib/map-style.ts'
  import { ALLEGATION_STATUSES } from '../data/schema.ts'
  import { STATUS_PHRASE } from '../data/wording.ts'
</script>

<article>
  <a class="back" href="#/">Back to the start</a>
  <h1>How we know</h1>

  <section>
    <h2>This is an advocacy project</h2>
    <p>
      This site exists to show how serious the haze is and to push companies and governments to act.
      It argues by showing evidence, not by using stronger words than the evidence allows.
    </p>
  </section>

  <section>
    <h2>Every number has a source</h2>
    <p>
      Each figure on the site carries a "source" tag. Open it to see where the number comes from,
      the date it was current and how it was measured or worked out. A check in our build rejects
      any number that lacks these.
    </p>
    <p>
      When sources disagree, we pick one and say so. For Singapore's air quality we use the National
      Environment Agency (NEA). Other outlets sometimes report different peaks for the same day (192
      and 181 were both reported for 9 October 2026), and we show the NEA figure.
    </p>
  </section>

  <section>
    <h2>How we write about companies</h2>
    <p>
      A fire inside a company's concession does not prove the company lit it. Companies often say
      fires began outside their boundaries. We show how strong the evidence is, on this scale from
      weakest to strongest, and we show the company's own response beside it.
    </p>
    <ol class="ladder">
      {#each ALLEGATION_STATUSES as s (s)}<li>{STATUS_PHRASE[s]}</li>{/each}
    </ol>
    <p>
      We only say a company "caused" a fire when a ministry or a court has said so. Revenue and
      profit come from the annual reports of listed parent companies. Where a company publishes no
      accounts we write "undisclosed" and do not estimate.
    </p>
  </section>

  <section>
    <h2>Data and credits</h2>
    <ul>
      <li>{PSI_ATTRIBUTION}</li>
      <li>{BASEMAP_ATTRIBUTION}</li>
      <li>
        Fire hotspots, once published, come from NASA FIRMS (NASA LANCE / ESDIS) and are refreshed
        on a schedule. Each map shows the date of its snapshot.
      </li>
      <li>
        Burned-area figures come from Nusantara Atlas as reported by the news outlets we cite. We do
        not copy its maps.
      </li>
    </ul>
  </section>

  <section>
    <h2>Corrections</h2>
    <p>
      If something here is wrong or out of date, open an issue at
      <a href="https://github.com/leejianrong/haze-info/issues" rel="noopener">
        github.com/leejianrong/haze-info/issues</a
      >
      with a link to a better source.
    </p>
  </section>
</article>

<style>
  article {
    display: grid;
    gap: 28px;
    max-width: 62ch;
  }
  .back {
    font-family: var(--f-data);
    font-size: 0.78rem;
  }
  h1 {
    font-family: var(--f-display);
    font-stretch: 70%;
    font-weight: 800;
    font-size: clamp(2.4rem, 7vw, 4rem);
    line-height: 1;
    margin: 0;
  }
  h2 {
    font-family: var(--f-display);
    font-stretch: 78%;
    font-weight: 800;
    font-size: 1.7rem;
    line-height: 1.05;
    margin: 0 0 8px;
  }
  p,
  ul,
  ol {
    margin: 0 0 0.9em;
  }
  .ladder {
    padding-left: 1.3em;
  }
</style>
