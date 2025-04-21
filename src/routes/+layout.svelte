<script>
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		margin: 0;
	}
</style>
