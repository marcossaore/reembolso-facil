<script lang="ts">
	// import { BLANK_PDF, type Template } from '../../node_modules/@pdfme/common';
	// import { generate } from '../../node_modules/@pdfme/generator';
	// import { text, image } from '../../node_modules/@pdfme/schemas';

	import MoneyInput from '$lib/components/MoneyInput.svelte';
	let refund = {
		goingImage: '',
		backImage: '',
		ticketValue: '',
		days: ['']
	};
	const addNewDay = () => {
		refund.days = [...refund.days, ''];
	};
	const removeDay = (index: number) => {
		refund.days = refund.days.filter((_, i) => i !== index);
	};
	const createRefund = () => {
		// const template: Template = {
		// 	basePdf: BLANK_PDF,
		// 	schemas: [
		// 		[
		// 			{
		// 				name: 'ticketValue',
		// 				type: 'text',
		// 				position: { x: 0, y: 0 },
		// 				width: 40,
		// 				height: 10
		// 			},
		// 			// {
		// 			// 	name: 'example_image',
		// 			// 	type: 'image',
		// 			// 	position: { x: 200, y: 200 },
		// 			// 	width: 60,
		// 			// 	height: 40
		// 			// },
		// 			{
		// 				name: 'goingImage',
		// 				type: 'text',
		// 				position: { x: 100, y: 100 },
		// 				width: 50,
		// 				height: 50
		// 			}
		// 		]
		// 	]
		// };

		// const inputs = [
		// 	{
		// 		ticketValue: refund.ticketValue,
		// 		goingImage: refund.goingImage
		// 	}
		// ];

		const plugins = {
			// Text: multiVariableText,
			// Image: image,
			// MyCustomPlugin: myCustomPlugin
		};

		// const result = generate({ template, inputs, plugins });

		// transform image into base 64
	};
</script>

<form class="flex flex-col items-center p-16 w-full">
	<h1 class="h1 mb-4">Reembolso fácil</h1>
	<div class="w-[60%] flex flex-col">
		<label class="label mb-8">
			<span>Imagem ida</span>
			<input class="input" type="file" bind:value={refund.goingImage} accept=".jpg,.jpeg,.png" />
		</label>
		<label class="label mb-8">
			<span>Imagem Volta</span>
			<input class="input" type="file" bind:value={refund.backImage} accept=".jpg,.jpeg,.png" />
		</label>
		<label class="label mb-8">
			<span>Valor unitário da Passagem</span>
			<MoneyInput
				on:changeValue={({ detail }) => {
					refund.ticketValue = detail.valueFormatted;
				}}
			/>
		</label>
		<label class="label mb-8">
			<span>Dias</span>
			<div class="flex flex-row flex-wrap items-center gap-4">
				{#each refund.days as day, index}
					<div class="flex flex-row items-center gap-2">
						<input bind:value={day} class="input w-48" type="date" />
						<button
							class="btn-icon rounded-full w-8 h-8 variant-filled-error cursor-pointer"
							on:click|preventDefault={() => removeDay(index)}
						>
							<i class="fa-solid fa-minus"></i>
						</button>
					</div>
				{/each}
				<button
					class="btn-icon rounded-full w-8 h-8 variant-filled-primary cursor-pointer"
					on:click|preventDefault={addNewDay}
				>
					<i class="fa-solid fa-plus"></i>
				</button>
			</div>
		</label>
		<input
			on:click|preventDefault={createRefund}
			type="submit"
			value="Confirmar"
			class="btn btn-lg block variant-filled-primary md:w-1/3 w-full self-end"
		/>
	</div>
</form>
