<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import MoneyInput from '$lib/components/MoneyInput.svelte';
	import { formatToBRL } from '$lib/utils/money';
	import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

	type Refund = {
		goingImage: string;
		backImage: string;
		days: string[];
		regime?: 'hibrid' | 'full';
		transports: {
			name?: string;
			type: string;
			ticketValue: number;
		}[];
	};

	let refund: Refund = {
		goingImage: '',
		backImage: '',
		days: [''],
		transports: []
	};

	let minDay: string;
	let maxDay: string;
	let monthIsSelected: boolean = false;
	let monthName: string;
	let monthSelected: Date;

	const toastStore = getToastStore();

	const handleGoingFileChange = (event: any) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.src = URL.createObjectURL(event.target.files[0]);
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx?.drawImage(img, 0, 0);
			const data = canvas.toDataURL('image/jpeg');
			refund.goingImage = data;
		};
	};

	const handleBackFileChange = (event: any) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.src = URL.createObjectURL(event.target.files[0]);
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx?.drawImage(img, 0, 0);
			const data = canvas.toDataURL('image/jpeg');
			refund.backImage = data;
		};
	};

	const handleMonthChange = (event: any) => {
		monthIsSelected = true;
		resetDays();
		const splitDate = event.target.value.split('-');
		monthSelected = new Date(splitDate[0], splitDate[1], 0);
		const minDayMonth = monthSelected;
		minDay = minDayMonth.toISOString().split('T')[0];
		const year = event.target.value.split('-')[0];
		const month = event.target.value.split('-')[1];
		const maxDayMonth = new Date(year, month, 0);
		maxDay = maxDayMonth.toISOString().split('T')[0];
		monthName = translateMonthNameToBr(
			monthSelected.toLocaleDateString('en-US', { month: 'short' })
		);
	};

	const handleRegimeChange = (event: any) => {
		refund.regime = event.target.value;
		if (refund.regime === 'full') {
			const currentMonth = monthSelected.getMonth();
			const currentYear = new Date().getFullYear();
			const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
			refund.days = [];
			for (let day = 1; day <= daysInMonth; day++) {
				const date = new Date(currentYear, currentMonth, day);
				if (date.getDay() === 6 || date.getDay() === 0) {
					continue;
				}
				if (date.getMonth() !== currentMonth) {
					break;
				}
				refund.days.push(date.toISOString().split('T')[0]);
			}
		} else {
			refund.days = [''];
		}
	};

	const addNewDay = () => {
		refund.days = [...refund.days, ''];
	};

	const removeDay = (index: number) => {
		refund.days = refund.days.filter((_, i) => i !== index);
	};

	const addNewTransport = (type: string) => {
		refund.transports = [
			...refund.transports,
			{
				name: '',
				type,
				ticketValue: 0
			}
		];
	};

	const removeTransport = (index: number) => {
		refund.transports = refund.transports.filter((_, i) => i !== index);
	};

	const pdfBuider = async () => {
		const pdfDoc = await PDFDocument.create();
		const defaultFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const pdfOptions = {
			titleSize: 14,
			textSize: 12,
			defaultXPosition: 40,
			defaultFont,
			lastYPosition: 0
		};
		let page = buildPage(pdfDoc, pdfOptions);
		buildTitle(page, pdfOptions);
		await buildImage(pdfDoc, refund.goingImage, page, pdfOptions);
		await buildImage(pdfDoc, refund.backImage, page, pdfOptions);
		page = buildPage(pdfDoc, pdfOptions);
		buildTitle(page, pdfOptions);
		buildDays(page, pdfOptions);
		buildTransports(page, pdfOptions);
		buildTotal(page, pdfOptions);
		return pdfDoc.save();
	};

	const buildPage = (pdfDoc: any, pdfOptions: any) => {
		pdfOptions.lastYPosition = 0;
		return pdfDoc.addPage();
	};

	const buildTitle = (page: any, pdfOptions: any) => {
		pdfOptions.lastYPosition = page.getHeight() - 50;
		page.drawText(`Reembolso do mês de ${monthName} - Ida e Volta`, {
			x: pdfOptions.defaultXPosition,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.titleSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});
	};

	const buildImage = async (pdfDoc: any, image: any, page: any, pdfOptions: any) => {
		const jpgImage = await pdfDoc.embedJpg(image);
		const jpgDims = jpgImage.scaleToFit(page.getWidth() - 40, page.getHeight());
		pdfOptions.lastYPosition = pdfOptions.lastYPosition - jpgDims.height - 50;
		page.drawImage(jpgImage, {
			x: page.getWidth() / 2 - jpgDims.width / 2,
			y: pdfOptions.lastYPosition,
			width: jpgDims.width,
			height: jpgDims.height
		});
	};

	const buildDays = (page: any, pdfOptions: any) => {
		pdfOptions.lastYPosition = pdfOptions.lastYPosition - 40;
		page.drawText('Dias:', {
			x: 40,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.titleSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});

		pdfOptions.lastYPosition = pdfOptions.lastYPosition - 30;

		let days = '';
		for (let index = 0; index < refund.days.length; index++) {
			const count7Days = (index + 1) % 7 === 0;
			const isThere7DaysInLineOrIsLastDay = count7Days || refund.days?.[index + 1] === undefined;
			const writeDashOrSpace = isThere7DaysInLineOrIsLastDay ? ' ' : ' - ';
			const shouldSkipLine = isThere7DaysInLineOrIsLastDay ? '\n' : '';
			days += `${refund.days[index]} ${writeDashOrSpace} ${shouldSkipLine}`;
		}

		page.drawText(days, {
			x: 40,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.textSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});

		pdfOptions.lastYPosition = pdfOptions.lastYPosition - (refund.days.length / 7) * 30;

		const totalDays = refund.days.length;

		page.drawText(`Total de dias: ${totalDays}`, {
			x: 460,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.titleSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});

		pdfOptions.lastYPosition = pdfOptions.lastYPosition - 15;

		page.drawSvgPath('M 0 0 L 525 0', {
			x: 40,
			y: pdfOptions.lastYPosition,
			borderColor: rgb(0, 0, 0),
			borderWidth: 1
		});
	};

	const buildTransports = (page: any, pdfOptions: any) => {
		pdfOptions.lastYPosition = pdfOptions.lastYPosition - 40;

		const transports = refund.transports
			.map((transport) => {
				return `${transport.type} ${transport.name ? `- ${transport.name}` : ''}  - ${formatToBRL(transport.ticketValue)} - (x2)`;
			})
			.join('\n');

		page.drawText('Transportes:', {
			x: 40,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.titleSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});

		pdfOptions.lastYPosition = pdfOptions.lastYPosition - 30;

		page.drawText(transports, {
			x: 40,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.textSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});

		pdfOptions.lastYPosition = pdfOptions.lastYPosition - refund.transports.length * 30;

		page.drawSvgPath('M 0 0 L 525 0', {
			x: 40,
			y: pdfOptions.lastYPosition,
			borderColor: rgb(0, 0, 0),
			borderWidth: 1
		});

		pdfOptions.lastYPosition = pdfOptions.lastYPosition - 40;

		const totalTransports = refund.transports.length * 2;

		page.drawText(`Passagens por dia: ${totalTransports}`, {
			x: 430,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.titleSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});
	};

	const buildTotal = (page: any, pdfOptions: any) => {
		const totalTransports = refund.transports.reduce((prev: any, next: any) => {
			return prev + next.ticketValue;
		}, 0);
		const total = totalTransports * 2 * refund.days.length;
		pdfOptions.lastYPosition = pdfOptions.lastYPosition - 30;
		page.drawText(`Total: ${formatToBRL(total)}`, {
			x: 430,
			y: pdfOptions.lastYPosition,
			size: pdfOptions.titleSize,
			font: pdfOptions.defaultFont,
			color: rgb(0, 0, 0)
		});
	};

	const createRefund = async () => {
		let toast: ToastSettings = {
			message: ''
		};
		if (!refund.goingImage || !refund.backImage) {
			toast.message = 'Imagens de Ida e Volta não selecionadas!';
			toastStore.trigger(toast);
			return;
		}

		if (refund.days.length === 0) {
			toast.message = 'Nenhum dia selecionado!';
			toastStore.trigger(toast);
			return;
		}

		if (refund.days.includes('')) {
			toast.message = 'Se algum dia estiver vazio, deve ser removido!';
			toastStore.trigger(toast);
			return;
		}

		if (refund.transports.length === 0) {
			toast.message = 'Nenhum transporte selecionado!';
			toastStore.trigger(toast);
			return;
		}

		if (!refund.transports.every((transport) => transport.ticketValue > 0)) {
			toast.message = 'Todos os transportes devem ter um valor maior que zero!';
			toastStore.trigger(toast);
			return;
		}

		const allBusTransports = refund.transports.filter((transport) => transport.type === 'Onibus');
		if (allBusTransports.length > 0) {
			if (allBusTransports.every((transport) => !transport.name || transport.name === '')) {
				toast.message = 'Todos os ônibus devem ter uma linha!';
				toastStore.trigger(toast);
				return;
			}
		}

		if (refund.regime === 'hibrid') {
			refund.days = [...new Set(refund.days)];
		}

		refund.days = refund.days.sort((a, b) => {
			const dateA = new Date(a);
			const dateB = new Date(b);
			return dateA.getTime() - dateB.getTime();
		});

		refund.days = refund.days.map((day) => {
			const daySplit = day.split('-');
			return `${daySplit[2]}/${daySplit[1]}/${daySplit[0]}`;
		});

		const pdfBytes = await pdfBuider();

		const link = document.createElement('a');
		link.href = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
		link.download = `reembolso-${monthName}.pdf`;
		link.click();

		resetDays();
	};

	const translateMonthNameToBr = (monthName: string) => {
		monthName = (/\./.test(monthName) ? monthName.replace('.', '') : monthName)
			.trim()
			.toLowerCase();
		switch (monthName) {
			case 'jan':
				return 'Janeiro';
			case 'feb':
				return 'Fevereiro';
			case 'mar':
				return 'Março';
			case 'apr':
				return 'Abril';
			case 'may':
				return 'Maio';
			case 'jun':
				return 'Junho';
			case 'jul':
				return 'Julho';
			case 'aug':
				return 'Agosto';
			case 'sep':
				return 'Setembro';
			case 'oct':
				return 'Outubro';
			case 'nov':
				return 'Novembro';
			case 'dec':
				return 'Dezembro';
			default:
				return monthName;
		}
	};

	const resetDays = () => {
		refund.regime = undefined;
		refund.days = [''];
	};
</script>

<form class="flex flex-col items-center md:p-16 p-8 w-full">
	<h1 class="h1 mb-8">Reembolso fácil</h1>
	<div class="w-full">
		<div class="flex md:flex-row flex-col gap-8">
			<div class="flex flex-col md:w-1/2 w-full">
				<label class="label mb-8">
					<span>Imagem ida</span>
					<input
						class="input"
						type="file"
						on:change={handleGoingFileChange}
						accept=".jpg,.jpeg,.png"
					/>
				</label>
				<label class="label mb-8">
					<span>Imagem Volta</span>
					<input
						class="input"
						type="file"
						on:change={handleBackFileChange}
						accept=".jpg,.jpeg,.png"
					/>
				</label>
				<label class="label mb-8">
					<span>Selecione o mês</span>
					<input class="input" type="month" on:change={handleMonthChange} />
				</label>
				{#if monthIsSelected}
					<div class="flex flex-row items-center gap-4 md:w-auto w-full">
						<label class="label label flex flex-row items-center gap-2">
							<span>Híbrido</span>
							<input
								value="hibrid"
								on:change={handleRegimeChange}
								class="radio"
								name="regime-type"
								type="radio"
								checked={refund.regime === 'hibrid'}
							/>
						</label>
						<label class="label flex flex-row items-center gap-2">
							<span>100% Presencial</span>
							<input
								value="full"
								on:change={handleRegimeChange}
								class="radio"
								name="regime-type"
								type="radio"
								checked={refund.regime === 'full'}
							/>
						</label>
					</div>
				{/if}
				{#if maxDay && minDay && refund.regime}
					<label class="label mt-8">
						<span class="block mb-4"
							>Dias:
							{#if refund.regime === 'full'}
								<strong class=" !text-warning-500 text-lg font-bold ml-4"
									>(Remova manualmente os feriados)
								</strong>
							{/if}
						</span>
						<div class="flex md:flex-row flex-col flex-wrap items-center gap-4">
							{#each refund.days as day, index}
								<div class="flex flex-row items-center gap-2 md:w-auto w-full">
									<input
										min={minDay}
										max={maxDay}
										bind:value={day}
										class="input md:w-auto w-full"
										type="date"
									/>
									<button
										class="btn-icon rounded-full w-8 h-8 variant-filled-error cursor-pointer"
										on:click|preventDefault={() => removeDay(index)}
									>
										<i class="fa-solid fa-minus"></i>
									</button>
								</div>
							{/each}
							<button
								class="btn-icon rounded-full w-8 h-8 variant-filled-primary cursor-pointer md:self-center self-end"
								on:click|preventDefault={addNewDay}
							>
								<i class="fa-solid fa-plus"></i>
							</button>
						</div>
					</label>
				{/if}
			</div>
			<div class="hidden md:block h-[60vh] w-1 bg-gray-400"></div>
			<div class="flex flex-col md:w-1/2 w-full">
				<h4 class="h4 mb-4">Tipo de transporte:</h4>
				<label class="label mb-8">
					<div class="mb-4">
						<div class="flex flex-row items-center gap-4">
							<button
								class="btn variant-filled-primary rounded-full md:w-auto w-[50%]"
								on:click={() => addNewTransport('Ônibus')}
							>
								<span>Ônibus</span>
								<i class="fa-solid fa-bus"></i>
							</button>
							<button
								class="btn variant-filled-primary rounded-full md:w-auto w-[50%]"
								on:click={() => addNewTransport('Metrô')}
							>
								<span>Metrô</span>
								<i class="fa-solid fa-train"></i>
							</button>
						</div>
					</div>
					<hr class="" />
					<div class="flex flex-col flex-wrap gap-4 !mt-8">
						{#each refund.transports as transport, index}
							<div class="flex md:flex-row flex-col items-center gap-4">
								{#if transport.type === 'Ônibus'}
									<div class="flex flex-col gap-2 w-full">
										<span>
											<i class="fa-solid fa-bus"></i>
											Linha - Ônibus
										</span>
										<input
											placeholder="Ex: 5324"
											bind:value={transport.name}
											class="input w-auto"
											type="text"
										/>
									</div>
								{/if}
								<div class="flex flex-col gap-2 w-full">
									<div class="flex flex-col gap-2 w-full">
										<span>
											<i class="fa-solid fa-{transport.type === 'Ônibus' ? 'bus' : 'train'}"></i>
											{transport.type === 'Ônibus' ? 'Ônibus' : 'Metrô'} - Valor Passagem (unitário)
										</span>
										<MoneyInput
											on:changeValue={({ detail }) => {
												transport.ticketValue = detail.value;
											}}
										/>
									</div>
								</div>
								<button
									class="btn-icon rounded-full w-10 h-10 variant-filled-error cursor-pointer self-end"
									on:click|preventDefault={() => removeTransport(index)}
								>
									<i class="fa-solid fa-minus"></i>
								</button>
							</div>
						{/each}
					</div>
				</label>
				<input
					on:click|preventDefault={createRefund}
					type="submit"
					value="Confirmar"
					class="btn btn-lg block variant-filled-primary md:w-1/2 w-full mx-auto"
				/>
			</div>
		</div>
	</div>
</form>
