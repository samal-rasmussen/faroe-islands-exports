<script>
	import { onMount } from "svelte";
	import { filter_data } from "$lib";

	/**
	 * @type {HTMLDivElement}
	 */
	let main_chart_div;

	/**
	 * @type {HTMLDivElement}
	 */
	let brush_chart_div;

	const { months_data } = filter_data();

	const {
		dates,
		header,
		all_summed,
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
	} = months_data;

	/**
	 * @param {string[]} row
	 */
	function get_series(row) {
		return {
			name: row[0],
			data: row.slice(1).map((x, i) => [dates[i], x]),
		};
	}

	const main_chart_options = {
		chart: {
			id: "main_chart",
			height: 580,
			width: "100%",
			type: "line",
			animations: {
				initialAnimation: {
					enabled: false,
				},
			},
			toolbar: {
				autoSelected: "pan",
				show: false,
			},
		},
		stroke: {
			width: 3,
			curve: "monotoneCubic",
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

	const max_date = dates[dates.length - 1];
	const six_years_back = new Date();
	six_years_back.setFullYear(max_date.getFullYear() - 6);

	const brush_chart_options = {
		series: [get_series(all_summed)],
		chart: {
			id: "brush_chart",
			height: 130,
			type: "area",
			brush: {
				target: "main_chart",
				enabled: true,
			},
			selection: {
				enabled: true,
				xaxis: {
					min: six_years_back.getTime(),
					max: max_date.getTime(),
				},
			},
		},
		colors: ["#008FFB"],
		fill: {
			type: "gradient",
			gradient: {
				opacityFrom: 0.91,
				opacityTo: 0.1,
			},
		},
		xaxis: {
			type: "datetime",
			tooltip: {
				enabled: false,
			},
		},
		yaxis: {
			tickAmount: 2,
		},
	};

	onMount(async () => {
		const ApexCharts = (await import("apexcharts")).default;
		/** @type {any} */ (window).ApexCharts = ApexCharts;
		const main_chart = new ApexCharts(main_chart_div, main_chart_options);
		main_chart.render();
		const brush_chart = new ApexCharts(brush_chart_div, brush_chart_options);
		brush_chart.render();
	});
</script>

<div bind:this={main_chart_div}></div>
<div bind:this={brush_chart_div}></div>

<a href="/by-month-table/months">Tabel við øllum data</a>

<style>
</style>
