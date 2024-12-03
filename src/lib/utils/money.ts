export const formatToBRL = (value: number, precision: number = 2) => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: precision, 
        maximumFractionDigits: precision
    });
}

export const toFixed = (value: number, precision: number = 2): number => {
    return parseFloat(value.toFixed(precision));
}

export const toPrecision = (value: number, precision: number = 3): string => {
    return value.toPrecision(precision);
}