<script lang="ts">
	import '@fontsource-variable/inter';
	import '@fontsource-variable/bricolage-grotesque';
	import '../app.css';

	let { children } = $props();
</script>

<div class="noise">
	{@render children()}
</div>
