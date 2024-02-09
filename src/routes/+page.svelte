<script>
  import { onMount } from "svelte";
  import { filter_months_data } from "$lib";
  import { get } from "svelte/store";

  /**
   * @type {HTMLDivElement}
   */
  let chartDiv;

  const {
    dates,
    header,
    individual_countries,
    nordics,
    nordics_summed,
    europe,
    europe_summed,
    asia,
    asia_summed,
    africa,
    africa_summed,
    americas,
    americas_summed,
  } = filter_months_data();

  /**
   * @param {string[]} row
   */
  function get_series(row) {
    return {
      name: row[0],
      data: row.slice(1).map((x, i) => [dates[i], x]),
    };
  }

  const options = {
    chart: {
      height: 580,
      width: "100%",
      type: "line",
      animations: {
        initialAnimation: {
          enabled: false,
        },
      },
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    series: [
      ...individual_countries.map((country) => get_series(country)),
      get_series(nordics_summed),
      get_series(europe_summed),
      get_series(asia_summed),
      get_series(africa_summed),
      get_series(americas_summed),
    ],
    xaxis: {
      type: "datetime",
    },
  };

  onMount(async () => {
    const ApexCharts = (await import("apexcharts")).default;
    const chart = new ApexCharts(chartDiv, options);
    chart.render();
  });
</script>

<a href="/by-month-table">Tabel við øllum data</a>

<div bind:this={chartDiv}></div>

<style>
</style>
