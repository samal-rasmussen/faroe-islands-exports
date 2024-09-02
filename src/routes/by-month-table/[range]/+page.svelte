<script lang="ts">
	import { page } from "$app/stores";
	import { filter_data } from "$lib";

	/** @type {"months" | "quarters"}*/
	const range = $page.params.range;

	const {
		header,
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
	} = filter_data()[range === "months" ? "months_data" : "quarters_data"];
</script>

<table>
	<thead>
		<tr>
			{#each header as column}
				<th>{column}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each individual_countries as row}
			<tr>
				{#each row as column}
					<td class="number">{column}</td>
				{/each}
			</tr>
		{/each}
		<tr>
			<td colspan={header.length}>Norðurlond</td>
		</tr>
		<tr>
			{#each nordics_summed as column}
				<td class="number">{column}</td>
			{/each}
		</tr>
		{#each nordics as row}
			<tr>
				{#each row as column}
					<td class="number">{column}</td>
				{/each}
			</tr>
		{/each}
		<tr>
			<td colspan={header.length}>Evropa</td>
		</tr>
		<tr>
			{#each europe_summed as column}
				<td class="number">{column}</td>
			{/each}
		</tr>
		{#each europe as row}
			<tr>
				{#each row as column}
					<td class="number">{column}</td>
				{/each}
			</tr>
		{/each}
		<tr>
			<td colspan={header.length}>Asia, Miðeystur, Oceania</td>
		</tr>
		<tr>
			{#each asia_summed as column}
				<td class="number">{column}</td>
			{/each}
		</tr>
		{#each asia as row}
			<tr>
				{#each row as column}
					<td class="number">{column}</td>
				{/each}
			</tr>
		{/each}
		<tr>
			<td colspan={header.length}>Afrika</td>
		</tr>
		<tr>
			{#each africa_summed as column}
				<td class="number">{column}</td>
			{/each}
		</tr>
		{#each africa as row}
			<tr>
				{#each row as column}
					<td class="number">{column}</td>
				{/each}
			</tr>
		{/each}
		<tr>
			<td colspan={header.length}>Amerika</td>
		</tr>
		<tr>
			{#each americas_summed as column}
				<td class="number">{column}</td>
			{/each}
		</tr>
		{#each americas as row}
			<tr>
				{#each row as column}
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
