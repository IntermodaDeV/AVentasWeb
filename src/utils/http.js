import axios from 'axios';
import moment from 'moment';
import store from 'store/store';
import { APIURL } from 'utils/Enviroment';

export const get = async (url, key, subkey) => {
    var data, error;

    try {
        data = getLocalStorage(key, subkey);

        if (data) {
            return { data, error };
        }
        const request = await axios.get(url, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        data = request.data;
        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-${key}`, moment(`${fecha} 23:59:59`));

    } catch (err) {
        return { data, error: err };
    }

    return { data, error }
}

export const post = async (url, info, action) => {
    let isOnline = await verificarConexion();
    var data, error;
    try {
        if (isOnline) {
            const request = await axios.post(url, info, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                timeout: 500 * 1000
            });

            data = request.data;
            return { data, error };
        }

        store.dispatch({ type: action, payload: info });

        if (action === "SET_PEDIDOSINCRONIZAR") {
            data = { EncabezadoPedido: { PedidoId: "No Disponible" } };
        } else if (action === "SET_RECIBOSINCRONIZAR") {
            data = [];
        }

        return { data, error };

    } catch (err) {
        return { data, error: err }
    }
}

export const postPedidoStorage = (info)=>{
    store.dispatch({ type: "SET_PEDIDOSINCRONIZAR", payload: info });
    const data = { EncabezadoPedido: { PedidoId: info.NumeroReferencia === "" ? "No Disponible" : info.NumeroReferencia } };
    return data;
}

export const backgroundPostPedidos = async () => {
    let isOnline = await verificarConexion();
    const url = APIURL + "/api/PedidosXCliente";
    const globalState = store.getState();
    const pedidoSincronizar = globalState["PedidoSincronizar"];
    let newPedidoSincronizar = [];

    if (isOnline && pedidoSincronizar.length > 0) {
        for (let pedido of pedidoSincronizar) {
            const { error } = await backgroundPost(url, pedido);

            if (error) {
                newPedidoSincronizar.push(pedido);
            }
        }

        store.dispatch({ type: "SET_RESETPEDIDOSINCRONIZAR", payload: newPedidoSincronizar });
        return newPedidoSincronizar;
    }

    return newPedidoSincronizar;
}

export const backgroundPostRecibos = async () => {
    let isOnline = await verificarConexion();
    const url = APIURL + "/api/Recibo";
    const globalState = store.getState();
    const reciboSincronizar = globalState["RecibosEnCache"];
    let newReciboSincronizar = [];

    if (isOnline && reciboSincronizar.length > 0) {
        for (let recibo of reciboSincronizar) {
            const { error } = await backgroundPost(url, recibo);

            if (error) {
                newReciboSincronizar.push(recibo);
            }
        }

        store.dispatch({ type: "SET_RESETRECIBOSENCACHE", payload: newReciboSincronizar });
        return newReciboSincronizar;
    }

    return newReciboSincronizar;
}

export const getLocalStorage = (key, subkey) => {
    const globalState = store.getState();
    let local = localStorage.getItem(`expiracion-${key}`);

    if (!local) {
        return null;
    }

    local = moment(local);

    if (local <= moment()) {
        return null;
    }

    if (subkey) {
        return globalState[key][subkey];
    }

    return globalState[key];
}

const backgroundPost = async (url, info) => {
    var data, error;
    try {

        const request = await axios.post(url, info, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            timeout: 900 * 1000
        });

        data = request.data;
        return { data, error };
    } catch (err) {
        return { data, error: err }
    }
}

export const verificarConexion = async() => {
    if (navigator.onLine) {
        try {
            // eslint-disable-next-line
            const request = await axios.get(APIURL + "/api/configuraciones/conexion");
            return true;
        } catch (err) {
            return false;
        }
    } else {
        return false;
    }
}