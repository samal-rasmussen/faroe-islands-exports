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
		<tr>
			<td>{all_series.name}</td>
			{#each all_series.data as column}
				<td class="number">{column}</td>
			{/each}
		</tr>
		{#each series as row}
			<tr>
				<td>{row.name}</td>
				{#each row.data as column}
					<td class="number">{column}</td>
				{/each}
			</tr>
		{/each}
		{#each individual_series as row}
			<tr>
				<td>{row.name}</td>
				{#each row.data as column}
					<td class="number">{column}</td>
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
	}
</style>
