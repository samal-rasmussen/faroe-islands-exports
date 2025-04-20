<script lang="ts">
	import { onMount } from "svelte";
	import { filter_data } from "$lib/filter-data";
	import type ApexCharts from "apexcharts";

	let main_chart_div: HTMLDivElement | undefined = $state();
	let brush_chart_div: HTMLDivElement | undefined = $state();

	let selected_range = $state("years");
	let dates: Date[] = $state([]);
	let series: { data: number[]; name: string }[] = $state([]);
	let all_series: { data: number[]; name: string } = $state({ data: [], name: "" });
	let main_chart: ApexCharts;
	let brush_chart: ApexCharts;
	let main_chart_options: ApexCharts.ApexOptions | undefined = $state();
	let brush_chart_options: ApexCharts.ApexOptions | undefined = $state();

	let data: Awaited<ReturnType<typeof filter_data>> | undefined = $state();

	function get_series(series: { data: number[]; name: string }): ApexAxisChartSeries[number] {
		return {
			name: series.name,
			// @ts-ignore
			data: series.data.map((x, i) => [dates[i], x]),
		};
	}

	onMount(async () => {
		data = await filter_data([
			"Danmark",
			"Sambandsríki Amerika (USA)",
			"Kina",
			"Russland",
			"Bretland",
			"Týskland",
			"Frakland",
			"Spania",
			"Niðurlond",
			"Ísland",
			"Pólland",
		]);
		update_selected_range();
		const max_date = dates[dates.length - 1];
		const six_years_back = new Date();
		six_years_back.setFullYear(max_date.getFullYear() - 6);

		main_chart_options = {
			chart: {
				id: "main_chart",
				height: "100%",
				type: "line",
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
			yaxis: {
				labels: {
					offsetX: -15,
				},
			},
			grid: {
				padding: {
					left: -5,
					right: 5,
				},
			},
		};

		brush_chart_options = {
			series: [get_series(all_series)],
			chart: {
				id: "brush_chart",
				height: "100%",
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
				labels: {
					offsetX: -15,
				},
			},
			grid: {
				padding: {
					left: -5,
				},
			},
		};

		const ApexCharts = (await import("apexcharts")).default;
		(window as any).ApexCharts = ApexCharts;
		main_chart = new ApexCharts(main_chart_div, main_chart_options);
		brush_chart = new ApexCharts(brush_chart_div, brush_chart_options);
		main_chart.render();
		brush_chart.render();
	});

	function update_selected_range() {
		if (data == null) {
			throw new Error("Data not loaded");
		}

		if (selected_range === "months") {
			({ dates, series, all_series } = data.months_data);
		} else if (selected_range === "quarters") {
			({ dates, series, all_series } = data.quarters_data);
		} else if (selected_range === "half-year") {
			({ dates, series, all_series } = data.half_year_data);
		} else if (selected_range === "years") {
			({ dates, series, all_series } = data.years_data);
		} else if (selected_range === "rolling-3-months") {
			({ dates, series, all_series } = data.rolling_3_months_data);
		} else if (selected_range === "rolling-6-months") {
			({ dates, series, all_series } = data.rolling_6_months_data);
		} else if (selected_range === "rolling-12-months") {
			({ dates, series, all_series } = data.rolling_12_months_data);
		} else if (selected_range === "last-3-months") {
			({ dates, series, all_series } = data.last_3_months_data);
		} else if (selected_range === "last-6-months") {
			({ dates, series, all_series } = data.last_6_months_data);
		} else if (selected_range === "last-12-months") {
			({ dates, series, all_series } = data.last_12_months_data);
		}
	}

	function update_chart() {
		if (main_chart_options == null || brush_chart_options == null) {
			throw new Error("Chart options not loaded");
		}

		main_chart_options.series = [...series.map((s) => get_series(s))];
		brush_chart_options.series = [get_series(all_series)];
		main_chart.updateOptions(main_chart_options);
		brush_chart.updateOptions(brush_chart_options);
	}
</script>

<div class="full-height-container">
	<div class="controls">
		<select
			bind:value={selected_range}
			onchange={() => {
				update_selected_range();
				update_chart();
			}}
		>
			<optgroup label="Føst kalendara tíðarskeið">
				<option value="months">Mánaða</option>
				<option value="quarters">ársfjóring</option>
				<option value="half-year">Hálvár</option>
				<option value="years">Ár</option>
			</optgroup>
			<optgroup label="Føst tíðarskeið frá nýggjastu data av">
				<option value="last-3-months">Seinastu 3 mánaðir</option>
				<option value="last-6-months">Seinastu 6 mánaðir</option>
				<option value="last-12-months">Seinastu 12 mánaðir</option>
			</optgroup>
			<optgroup label="Mánaði við rullandi tíðarskeið">
				<option value="rolling-3-months">Rullandi 3 mánaðir</option>
				<option value="rolling-6-months">Rullandi 6 mánaðir</option>
				<option value="rolling-12-months">Rullandi 12 mánaðir</option>
			</optgroup>
		</select>

		<span>
			<a href="/by-month-table/months">Tabell við øllum data</a>
		</span>
	</div>

	<div class="content">
		<div class="main-chart-wrapper">
			<div bind:this={main_chart_div}></div>
		</div>
		<div class="brush-chart-wrapper">
			<div bind:this={brush_chart_div}></div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	.full-height-container {
		height: 100vh;
		max-height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.controls {
		padding: 1rem;
		flex-shrink: 0;
		display: flex;
		gap: 1rem;
	}

	.content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		overflow-y: auto;
		padding: 0 1.5rem 2rem 1.5rem;
	}

	.main-chart-wrapper {
		flex-grow: 1;
		min-height: 200px;
		max-height: 1000px;
		width: 100%;
	}

	.brush-chart-wrapper {
		height: 120px;
		width: 100%;
	}
</style>
