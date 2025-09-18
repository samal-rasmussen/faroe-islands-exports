<script lang="ts">
	import { onMount } from "svelte";
	import { filter_data, by_month_data, type DataWithDates } from "$lib/filter-data";
	import type ApexCharts from "apexcharts";
	import { base } from "$app/paths";

	let selected_preset: "sum" | "only_russia" | "top_list" | "none" = $state("only_russia");
	let selected_top_countries_count = $state(10);

	let main_chart_div: HTMLDivElement | undefined = $state();
	let brush_chart_div: HTMLDivElement | undefined = $state();

	let selected_range:
		| "months"
		| "quarters"
		| "half-year"
		| "years"
		| "rolling-3-months"
		| "rolling-6-months"
		| "rolling-12-months"
		| "last-3-months"
		| "last-6-months"
		| "last-12-months" = $state("last-3-months");
	let dates: Date[] = $state([]);
	let series: { data: number[]; name: string }[] = $state([]);
	let all_series: { data: number[]; name: string } = $state({ data: [], name: "" });
	let main_chart: ApexCharts;
	let brush_chart: ApexCharts;
	let main_chart_options: ApexCharts.ApexOptions | undefined = $state();
	let brush_chart_options: ApexCharts.ApexOptions | undefined = $state();
	let lastBrushSelection: [number, number] | null = null;

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
		} else if (selected_preset === "none") {
			data = await filter_data();
		} else if (selected_preset === "sum") {
			data = await filter_data();
		} else {
			const check: never = selected_preset;
			throw new Error("Invalid preset: " + check);
		}
	}

	onMount(async () => {
		await update_preset();
		update_selected_range();
		const max_date = dates[dates.length - 1];
		const start_min_date = new Date();
		start_min_date.setFullYear(max_date.getFullYear() - 6);

		main_chart_options = {
			chart: {
				id: "main_chart",
				height: "100%",
				type: "line",
				zoom: {
					enabled: false,
				},
			},
			colors: [
				"#e6194B",
				"#ffe119",
				"#3cb44b",
				"#42d4f4",
				"#4363d8",
				"#911eb4",
				"#aaffc3",
				"#f58231",
				"#f032e6",
				"#000075",
				"#800000",
				"#99d8f6",
				"#bfef45",
				"#ffd8b1",
				"#dcbeff",
				"#e5a5d5",
				"#ff8c00",
				"#46f0f0",
				"#fffac8",
				"#fabebe",
				"#008080",
				"#775DD0",
				"#1E90FF",
				"#32CD32",
				"#FF4500",
				"#FF1493",
				"#C71585",
				"#6A5ACD",
				"#20B2AA",
			],
			stroke: {
				width: 3,
				curve: "monotoneCubic",
			},
			series: [...series.map((s) => get_series(s))],
			xaxis: {
				type: "datetime",
				tooltip: {
					enabled: false,
				},
			},
			yaxis: {
				labels: {
					formatter: function (value: number) {
						return Math.round(value).toLocaleString("de-DE", {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						});
					},
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
						min: start_min_date.getTime(),
						max: max_date.getTime(),
					},
				},
				events: {
					brushScrolled: function (...args) {
						const val: { xaxis: { min: number; max: number } } = args[1];
						console.log("brush selection", val.xaxis.min, val.xaxis.max);
						lastBrushSelection = [val.xaxis.min, val.xaxis.max];
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
					formatter: function (value: number) {
						return Math.round(value).toLocaleString("de-DE", {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						});
					},
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

		let new_selected: DataWithDates;
		if (selected_range === "months") {
			new_selected = data.months_data;
		} else if (selected_range === "quarters") {
			new_selected = data.quarters_data;
		} else if (selected_range === "half-year") {
			new_selected = data.half_year_data;
		} else if (selected_range === "years") {
			new_selected = data.years_data;
		} else if (selected_range === "rolling-3-months") {
			new_selected = data.rolling_3_months_data;
		} else if (selected_range === "rolling-6-months") {
			new_selected = data.rolling_6_months_data;
		} else if (selected_range === "rolling-12-months") {
			new_selected = data.rolling_12_months_data;
		} else if (selected_range === "last-3-months") {
			new_selected = data.last_3_months_data;
		} else if (selected_range === "last-6-months") {
			new_selected = data.last_6_months_data;
		} else if (selected_range === "last-12-months") {
			new_selected = data.last_12_months_data;
		} else {
			throw new Error("Invalid range");
		}

		({ dates, series, all_series } = new_selected);
	}

	function update_chart() {
		if (main_chart_options == null || brush_chart_options == null) {
			throw new Error("Chart options not loaded");
		}
		if (selected_preset === "sum") {
			main_chart.updateSeries([get_series(all_series)]);
		} else {
			main_chart.updateSeries([...series.map((s) => get_series(s))]);
		}
		const new_brush_options: ApexCharts.ApexOptions = {
			series: [get_series(all_series)],
		};
		if (lastBrushSelection) {
			new_brush_options.chart = {
				selection: {
					xaxis: {
						min: lastBrushSelection[0],
						max: lastBrushSelection[1],
					},
				},
			};
		}
		brush_chart.updateOptions(new_brush_options);
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
			<optgroup label="Mánaði við rullandi miðal">
				<option value="rolling-3-months">3 mánaðir</option>
				<option value="rolling-6-months">6 mánaðir</option>
				<option value="rolling-12-months">12 mánaðir</option>
			</optgroup>
		</select>

		<div class="preset-filter-wrapper">
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
					<option value="sum">Tilsamans</option>
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
		</div>

		<span style="white-space: nowrap">
			<a href="{base}/by-month-table/months">Tabell við øllum data</a>
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
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.preset-filter-wrapper {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		overflow-y: auto;
		padding: 0 0.8rem 2rem 0.1rem;
	}

	.main-chart-wrapper {
		flex-grow: 1;
		min-height: 350px;
		max-height: 1000px;
		width: 100%;
	}

	.brush-chart-wrapper {
		height: 120px;
		width: 100%;
	}

	@media (max-width: 768px) {
		.controls {
			padding: 0.6rem;
			row-gap: 0.4rem;
		}
		.preset-filter-wrapper {
			row-gap: 0.4rem;
		}
		.content {
			padding: 0 0.4rem 1rem 0;
			margin-left: -0.4rem;
		}
	}

	:global(.apexcharts-series.legend-mouseover-inactive) {
		opacity: 0.7;
	}
	:global(
			.apexcharts-series:not(.legend-mouseover-inactive):has(
					+ .apexcharts-series.legend-mouseover-inactive
				)
		) {
		filter: drop-shadow(1px 1px 1px rgba(128, 128, 128, 0.175)) /* Outline */
			drop-shadow(-1px -1px 1px rgba(128, 128, 128, 0.175)) /* Outline */
			drop-shadow(1px -1px 1px rgba(128, 128, 128, 0.175)) /* Outline */
			drop-shadow(-1px 1px 1px rgba(128, 128, 128, 0.175)) /* Outline */ contrast(120%);
		z-index: 999;
	}
</style>
