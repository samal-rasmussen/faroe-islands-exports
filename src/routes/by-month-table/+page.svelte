<script>
  import { get_by_month_data } from "$lib";
  import groups from "$lib/country-groups.json";

  const data = get_by_month_data();
  const header = /** @type {string[]} */ (data.shift());

  const nordics_map = new Map(Object.entries(groups.nordics));
  const europe_map = new Map(Object.entries(groups.europe));
  const asia_map = new Map(Object.entries(groups["asia-middle-east-oceania"]));
  const africa_map = new Map(Object.entries(groups.africa));
  const americas_map = new Map(Object.entries(groups.americas));

  const nordics = data.filter((row) => nordics_map.has(row[0]));
  const europe = data.filter((row) => europe_map.has(row[0]));
  const asia = data.filter((row) => asia_map.has(row[0]));
  const africa = data.filter((row) => africa_map.has(row[0]));
  const americas = data.filter((row) => americas_map.has(row[0]));

  const nordics_summed = sum_group(nordics);
  const europe_summed = sum_group(europe);
  const asia_summed = sum_group(asia);
  const africa_summed = sum_group(africa);
  const americas_summed = sum_group(americas);

  /**
   * @param {string[][]} group
   */
  function sum_group(group) {
    const reduced = group.reduce((acc, row) => {
      for (let i = 1; i < row.length; i++) {
        acc[i] += row[i];
      }
      return acc;
    }, new Array(header.length).fill(0));

    reduced.forEach((value, i) => {
      reduced[i] = Math.round(value * 100) / 100;
    });
    reduced[0] = "Sum";
    return reduced;
  }
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
      <td colspan={header.length}>Norðurlond</td>
    </tr>
    <tr>
      {#each nordics_summed as column}
        <td class="number">{column}</td>
      {/each}
    </tr>
    {#each nordics as row}
      <tr>
        {#each row as column}
          <td class="number">{column}</td>
        {/each}
      </tr>
    {/each}
    <tr>
      <td colspan={header.length}>Evropa</td>
    </tr>
    <tr>
      {#each europe_summed as column}
        <td class="number">{column}</td>
      {/each}
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
    <tr>
      {#each asia_summed as column}
        <td class="number">{column}</td>
      {/each}
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
    <tr>
      {#each africa_summed as column}
        <td class="number">{column}</td>
      {/each}
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
    <tr>
      {#each americas_summed as column}
        <td class="number">{column}</td>
      {/each}
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
