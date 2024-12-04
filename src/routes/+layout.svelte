<script lang="ts">
	export const prerender = true;
	export const ssr = false;
	import '../app.postcss';
	import { initializeStores, Toast } from '@skeletonlabs/skeleton';
	initializeStores();
</script>

<Toast />
<slot />
