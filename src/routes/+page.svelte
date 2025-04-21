<script lang="ts">
	import { onMount } from "svelte";
	import { filter_data, by_month_data } from "$lib/filter-data";
	import type ApexCharts from "apexcharts";

	let selected_preset = $state("only_russia");
	let selected_top_countries_count = $state(10);

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

	let data: Awaited<ReturnType<typeof filter_data>>;

	function get_series(series: { data: number[]; name: string }): ApexAxisChartSeries[number] {
		return {
			name: series.name,
			// @ts-ignore
			data: series.data.map((x, i) => [dates[i], x]),
		};
	}

	async function update_preset() {
		if (selected_preset === "top_list") {
			const top_countries = by_month_data.series
				.slice(0, selected_top_countries_count)
				.map((s) => s.name);
			data = await filter_data(top_countries);
		} else if (selected_preset === "only_russia") {
			data = await filter_data(["Russland"]);
		} else {
			data = await filter_data();
		}
	}

	onMount(async () => {
		await update_preset();
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

		<!-- Preset Filter Select -->
		<label style="white-space: nowrap">
			<span>Individuel lond</span>
			<select
				bind:value={selected_preset}
				onchange={async () => {
					await update_preset();
					update_selected_range();
					update_chart();
				}}
			>
				<option value="none">Eingin lond</option>
				<option value="only_russia">Bert Russland</option>
				<option value="top_list">Topp N lond</option>
			</select>
		</label>

		<!-- Top N Count Select (Conditional) -->
		{#if selected_preset === "top_list"}
			<select
				bind:value={selected_top_countries_count}
				onchange={async () => {
					await update_preset();
					update_selected_range();
					update_chart();
				}}
			>
				<option value={1}>Topp 1</option>
				<option value={2}>Topp 2</option>
				<option value={3}>Topp 3</option>
				<option value={4}>Topp 4</option>
				<option value={5}>Topp 5</option>
				<option value={6}>Topp 6</option>
				<option value={7}>Topp 7</option>
				<option value={8}>Topp 8</option>
				<option value={9}>Topp 9</option>
				<option value={10}>Topp 10</option>
				<option value={11}>Topp 11</option>
				<option value={12}>Topp 12</option>
				<option value={13}>Topp 13</option>
				<option value={14}>Topp 14</option>
				<option value={15}>Topp 15</option>
				<option value={16}>Topp 16</option>
				<option value={17}>Topp 17</option>
				<option value={18}>Topp 18</option>
				<option value={19}>Topp 19</option>
				<option value={20}>Topp 20</option>
			</select>
		{/if}

		<span style="white-space: nowrap">
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
