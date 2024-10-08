import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss';

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

export const mostrarModal = (title, text, type, step, textConfirmation, textCancelation) => {
    if (step) {
        return Swal.fire({
            title,
            text,
            type,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: textConfirmation,
            cancelButtonText: textCancelation,
        });
    }


    Swal.fire({
        title,
        text,
        type,
        confirmButtonText: 'Ok',
    });
}

export const mostrarAlerta = (title, text, type) => {
    Swal.fire({
        title: title,
        text: text,
        type: type,
        confirmButtonText: 'Ok',
    })
}

export const numberWithCommasNoDec = (x) => {
    if (x > 1000) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
    return x;
}