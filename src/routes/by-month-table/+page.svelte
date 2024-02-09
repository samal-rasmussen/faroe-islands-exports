<script>
  import csv from "../../../by-month.csv?raw";

  console.log();
  const data = csv.split("\n").map((row) => row.split(";"));
  // parse cells to numbers
  const header = /** @type {string[]} */ (data.shift());
  data.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (i > 0 && j > 0) {
        row[j] = /** @type {any} */ (+cell);
      }
    });
  });
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
    {#each data.slice(1) as row}
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
