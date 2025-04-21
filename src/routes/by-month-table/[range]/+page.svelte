<script lang="ts">
	import { page } from "$app/stores";
	import { filter_data, type Serie } from "$lib/filter-data";
	import { goto } from "$app/navigation";
	import { ranges, type Range } from "./shared";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

	let data: Awaited<ReturnType<typeof filter_data>> | undefined = $state();
	let data_promise = filter_data().then((d) => {
		data = d;
		get_header_and_rows();
		requestAnimationFrame(() => {
			if (browser && table_container) {
				table_container.scrollLeft = table_container.scrollWidth;
			}
		});
	});

	let selected_range = $state($page.params.range as Range);
	let header: string[] = $state([]);
	let rows: Serie[] = $state([]);
	let table_container: HTMLDivElement | undefined = $state();
	function get_header_and_rows() {
		if (data == null) {
			throw new Error("Data is not loaded");
		}

		const filtered_data =
			data[
				selected_range === "months"
					? "months_data"
					: selected_range === "quarters"
						? "quarters_data"
						: selected_range === "half-year"
							? "half_year_data"
							: "years_data"
			];
		let result_rows = [
			filtered_data.all_series,
			...filtered_data.series,
			...filtered_data.individual_series,
		];
		result_rows = result_rows.filter((x, index) => {
			// remove duplicates
			return result_rows.findIndex((y) => y.name === x.name) === index;
		});
		result_rows.sort((a, b) => {
			const a_last = a.data.at(-1)!;
			const b_last = b.data.at(-1)!;
			return b_last - a_last;
		});
		header = filtered_data.header;
		rows = result_rows;
	}
</script>

{#await data_promise}
	<div>Loading...</div>
{:then}
	<div class="wrapper">
		<div class="controls-container">
			<label for="range-select">Select Range:</label>
			<select
				id="range-select"
				bind:value={selected_range}
				onchange={() => {
					goto(`/by-month-table/${selected_range}`);
					get_header_and_rows();
				}}
			>
				{#each ranges as option}
					<option value={option}>
						{option.charAt(0).toUpperCase() + option.slice(1)}
					</option>
				{/each}
			</select>
		</div>

		<div class="table-container" bind:this={table_container}>
			<table>
				<thead>
					<tr>
						<th class="sticky"></th>
						{#each header as column}
							<th>{column}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows as row}
						<tr>
							<td class="sticky">{row.name}</td>
							{#each row.data as column}
								<td class="number">{Math.floor(column).toLocaleString()}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/await}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		height: 100vh;
		width: 100vw;
	}
	.controls-container {
		padding: 0.5rem;
	}
	.table-container {
		overflow: auto;
	}
	table {
		border-collapse: collapse;
	}
	th,
	td {
		border: 1px solid #000;
		padding: 0.2em;
		white-space: nowrap;
		background-color: white;
	}
	th.sticky,
	td.sticky {
		position: sticky;
		left: 0;
		border-right: 2px solid #000;
	}
	.number {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>
