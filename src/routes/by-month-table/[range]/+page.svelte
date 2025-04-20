<script lang="ts">
	import { run } from "svelte/legacy";

	import { page } from "$app/stores";
	import { filter_data } from "$lib/filter-data";
	import { goto } from "$app/navigation";
	import { ranges, type Range } from "./shared";

	let selected_range = $state($page.params.range as Range);

	const filtered_data = $derived(
		filter_data()[
			selected_range === "months"
				? "months_data"
				: selected_range === "quarters"
					? "quarters_data"
					: selected_range === "half-year"
						? "half_year_data"
						: "years_data"
		],
	);
	const header = $derived(filtered_data.header);
	const rows = $derived.by(() => {
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
		return calculated_rows;
	});
</script>

<div style="display: flex; flex-direction: column; gap: 1rem;">
	<div>
		<label for="range-select">Select Range:</label>
		<select
			id="range-select"
			bind:value={selected_range}
			onchange={() => {
				goto(`/by-month-table/${selected_range}`);
			}}
		>
			{#each ranges as option}
				<option value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
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
