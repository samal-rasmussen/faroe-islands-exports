<script lang="ts">
	import { page } from "$app/stores";
	import { filter_data, type Serie } from "$lib/filter-data";
	import { goto } from "$app/navigation";
	import { ranges, type Range } from "./shared";
	import { onMount } from "svelte";

	let data: Awaited<ReturnType<typeof filter_data>> | undefined = $state();
	let data_promise = filter_data().then((d) => {
		data = d;
		get_header_and_rows();
	});

	let selected_range = $state($page.params.range as Range);
	let header: string[] = $state([]);
	let rows: Serie[] = $state([]);

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
		let calculated_rows = [
			filtered_data.all_series,
			...filtered_data.series,
			...filtered_data.individual_series,
		];
		calculated_rows = calculated_rows.filter((x, index) => {
			// remove duplicates
			return calculated_rows.findIndex((y) => y.name === x.name) === index;
		});
		calculated_rows.sort((a, b) => {
			if (a === undefined || b === undefined) return 0;
			const a_last = a.data.at(-1);
			const b_last = b.data.at(-1);
			if (a_last === undefined || b_last === undefined) return 0;
			return b_last - a_last;
		});
		header = filtered_data.header;
		rows = calculated_rows;
	}
</script>

{#await data_promise}
	<div>Loading...</div>
{:then}
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<div>
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

		<table>
			<thead>
				<tr>
					<th></th>
					{#each header as column}
						<th>{column}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row}
					<tr>
						<td>{row.name}</td>
						{#each row.data as column}
							<td class="number">{Math.floor(column).toLocaleString()}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/await}

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
		font-variant-numeric: tabular-nums;
	}
</style>
