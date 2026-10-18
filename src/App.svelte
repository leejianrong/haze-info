<script lang="ts">
  import { companies, findCompany } from './data/companies.ts'
  import { router } from './lib/router.svelte.ts'
  import MapView from './components/MapView.svelte'
  import PsiBadge from './components/PsiBadge.svelte'
  import CompanyPage from './pages/CompanyPage.svelte'

  const route = $derived(router.current)
  const company = $derived(route.name === 'company' ? findCompany(route.slug) : undefined)
</script>

<main>
  {#if route.name === 'company' && company}
    <CompanyPage {company} />
  {:else if route.name === 'home'}
    <h1>Haze Info</h1>
    <p>
      Where the October 2026 haze comes from, who holds the burning land, and what it does to
      people.
    </p>
    <PsiBadge />
    <MapView />
    <h2>Company profiles</h2>
    {#if companies.length === 0}
      <p>No profiles yet.</p>
    {:else}
      <ul>
        {#each companies as c (c.slug)}
          <li><a href={`#/company/${c.slug}`}>{c.name}</a></li>
        {/each}
      </ul>
    {/if}
  {:else}
    <h1>Page not found</h1>
    <p><a href="#/">Back to the start</a></p>
  {/if}
</main>
