<script>
	import { onMount } from "svelte";
	import { filter_data } from "$lib";

	/**
	 * @type {HTMLDivElement | undefined}
	 */
	let main_chart_div = $state();

	/**
	 * @type {HTMLDivElement | undefined}
	 */
	let brush_chart_div = $state();

	const { months_data, quarters_data, half_year_data, years_data } = filter_data();

	let selected_range = $state("years");
	/** @type {Date[]} */
	let dates = [];
	/** @type {{data: number[], name: string}[]} */
	let series = [];
	/** @type {{data: number[], name: string}} */
	let all_series = { data: [], name: "" };
	update_selected_range();

	const max_date = dates[dates.length - 1];
	const six_years_back = new Date();
	six_years_back.setFullYear(max_date.getFullYear() - 6);

	/**
	 * @param {{data: number[], name: string}} series
	 */
	function get_series(series) {
		return {
			name: series.name,
			data: series.data.map((x, i) => [dates[i], x]),
		};
	}

	const main_chart_options = {
		chart: {
			id: "main_chart",
			height: 640,
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
		series: [...series.map((s) => get_series(s))],
		xaxis: {
			type: "datetime",
		},
	};

	const brush_chart_options = {
		series: [get_series(all_series)],
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

	/** @type {import("apexcharts")} */
	let main_chart;
	/** @type {import("apexcharts")} */
	let brush_chart;

	onMount(async () => {
		const ApexCharts = (await import("apexcharts")).default;
		/** @type {any} */ (window).ApexCharts = ApexCharts;
		main_chart = new ApexCharts(main_chart_div, main_chart_options);
		brush_chart = new ApexCharts(brush_chart_div, brush_chart_options);
		main_chart.render();
		brush_chart.render();
	});

	function update_selected_range() {
		if (selected_range === "months") {
			({ dates, series, all_series } = months_data);
		} else if (selected_range === "quarters") {
			({ dates, series, all_series } = quarters_data);
		} else if (selected_range === "half-year") {
			({ dates, series, all_series } = half_year_data);
		} else if (selected_range === "years") {
			({ dates, series, all_series } = years_data);
		}
	}

	function update_chart() {
		main_chart_options.series = [...series.map((s) => get_series(s))];
		brush_chart_options.series = [get_series(all_series)];
		main_chart.updateOptions(main_chart_options);
		brush_chart.updateOptions(brush_chart_options);
	}
</script>

<select
	bind:value={selected_range}
	onchange={() => {
		update_selected_range();
		update_chart();
	}}
>
	<option value="months">Mánaða</option>
	<option value="quarters">ársfjóring</option>
	<option value="half-year">Hálvár</option>
	<option value="years">Ár</option>
</select>

<span>
	Tabellir við øllum data per:
	<a href="/by-month-table/months">Mánaða</a>,
	<a href="/by-month-table/quarters">ársfjóring</a>,
	<a href="/by-month-table/half-year">Hálvár</a>,
	<a href="/by-month-table/years">Ár</a>
</span>

<div bind:this={main_chart_div}></div>
<div bind:this={brush_chart_div}></div>

<style>
</style>
