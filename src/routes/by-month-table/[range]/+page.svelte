<script lang="ts">
	import { page } from "$app/stores";
	import { filter_data } from "$lib";

	/** @type {"months" | "quarters" | "half-year" | "years"}*/
	const range = $page.params.range;

	const filtered_data =
		filter_data()[
			range === "months"
				? "months_data"
				: range === "quarters"
					? "quarters_data"
					: range === "half-year"
						? "half_year_data"
						: "years_data"
		];
	const { header, series, individual_series, all_series } = filtered_data;
	let rows = [all_series, ...series, ...individual_series];
	rows = rows.filter((x, index) => {
		// remove duplicates
		return rows.findIndex((y) => y.name === x.name) === index;
	});
	rows.sort((a, b) => {
		if (a === undefined || b === undefined) return 0;
		const a_last = a.data.at(-1);
		const b_last = b.data.at(-1);
		if (a_last === undefined || b_last === undefined) return 0;
		return b_last - a_last;
	});
</script>

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
