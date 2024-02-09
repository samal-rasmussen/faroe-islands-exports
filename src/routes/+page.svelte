<script>
  import csv from "../../by-month.csv?raw";
  console.log();
  const data = csv.split("\n").map((row) => row.split(";"));
  // parse cells to numbers
  data.slice(1).forEach((row, i) => {
    row.forEach((cell, j) => {
      if (i > 0 && j > 0) {
        row[j] = /** @type {any} */ (+cell);
      }
    });
  });
</script>

<a href="/by-month-table">Tabel við øllum data</a>

<style>
</style>
