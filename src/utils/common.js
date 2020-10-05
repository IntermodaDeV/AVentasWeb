export const numberWithCommas = (value) => (value.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));

export const reduceNumberWithCommas = (value,key) => (value.reduce((acc, cur) => { 
    return acc + ((cur[key] ? cur[key] : 0)) }, 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
