<script lang="ts">
	import { formatToBRL, toFixed } from '$lib/utils/money';
	import { createEventDispatcher } from 'svelte';
	export let initialValue: number = 0;
	export let containerClass = 'w-full';
	export let required: boolean = false;
	export let disabled: boolean = false;
	let isFocused: boolean = false;
	let applyStyle: string;
	let valueNumber: number;
	let input: HTMLInputElement;

	const dispatch = createEventDispatcher();

	const formatMoneyOnInput = (event: any) => {
		let value = event.target.value.replace(/\D/g, '');
		value = toFixed(value / 100);
		valueNumber = value;
		event.target.value = formatToBRL(value);
		dispatch('changeValue', { value, valueFormatted: event.target.value });
	};

	$: if (input && initialValue) {
		input.value = formatToBRL(initialValue);
		valueNumber = initialValue;
	}

	export function clear() {
		input.value = formatToBRL(0);
	}
</script>

<div class={containerClass}>
	<div class="relative input-group input-group-divider grid-cols-[auto_1fr_auto]">
		<div class="input-group-shim {applyStyle}">
			<i class="fa-solid fa-brazilian-real-sign"></i>
		</div>

		<input
			bind:this={input}
			on:focus={() => (isFocused = true)}
			on:blur={() => (isFocused = false)}
			on:input={formatMoneyOnInput}
			type="text"
			value={formatToBRL(0)}
			{disabled}
			{required}
		/>
	</div>
</div>
