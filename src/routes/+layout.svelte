<script lang="ts">
	import "./global.css";

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();
</script>

{@render children()}
