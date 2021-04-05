export const numberWithCommas = (value) => (value.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));

export const reduceNumberWithCommas = (value, key) => (value.reduce((acc, cur) => {
    return acc + ((cur[key] ? cur[key] : 0))
}, 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));

export const ObtenerCoordenadas = (callBackSucces, callBackError) => {
    navigator.geolocation.getCurrentPosition((position) => {
        callBackSucces(position);
    }, (error) => {
        if (callBackError) {
            callBackError();
        }
    })
}

export const reemplazarUrl = (data, original, offline) => {
    if (data) {
        let urlCopia = data;
        return urlCopia.replace(original, offline);
    }
    return data;
}