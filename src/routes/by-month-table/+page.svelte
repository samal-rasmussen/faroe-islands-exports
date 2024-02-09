<script>
  import { by_month_data } from "$lib";
  import groups from "$lib/country-groups.json";

  const data = by_month_data;
  const header = /** @type {string[]} */ (data.shift());

  const europe_map = new Map(Object.entries(groups.europe));
  const asia_map = new Map(Object.entries(groups["asia-middle-east-oceania"]));
  const africa_map = new Map(Object.entries(groups.africa));
  const americas_map = new Map(Object.entries(groups.americas));

  const europe = data.filter((row) => europe_map.has(row[0]));
  const asia = data.filter((row) => asia_map.has(row[0]));
  const africa = data.filter((row) => africa_map.has(row[0]));
  const americas = data.filter((row) => americas_map.has(row[0]));

  console.log(
    europe.length,
    asia.length,
    africa.length,
    americas.length,
    europe.length + asia.length + africa.length + americas.length,
    data.length
  );
</script>

<table>
  <thead>
    <tr>
      {#each header as column}
        <th>{column}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan={header.length}>Evropa</td>
    </tr>
    {#each europe as row}
      <tr>
        {#each row as column}
          <td class="number">{column}</td>
        {/each}
      </tr>
    {/each}
    <tr>
      <td colspan={header.length}>Asia, Miðeystur, Oceania</td>
    </tr>
    {#each asia as row}
      <tr>
        {#each row as column}
          <td class="number">{column}</td>
        {/each}
      </tr>
    {/each}
    <tr>
      <td colspan={header.length}>Afrika</td>
    </tr>
    {#each africa as row}
      <tr>
        {#each row as column}
          <td class="number">{column}</td>
        {/each}
      </tr>
    {/each}
    <tr>
      <td colspan={header.length}>Amerika</td>
    </tr>
    {#each americas as row}
      <tr>
        {#each row as column}
          <td class="number">{column}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
  }
  th,
  td {
    border: 1px solid #000;
    padding: 0.2em;
    white-space: nowrap;
  }
  .number {
    text-align: right;
  }
</style>
