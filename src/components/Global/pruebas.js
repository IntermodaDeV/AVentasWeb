import React, {
    //  useEffect, 
     useState } from 'react'
import moment from 'moment';
import 'moment/locale/es';
import { DatePicker } from "@material-ui/pickers";

const Pruebas = (props) => {
    const [fechaRecibo, setFechaRecibo] = useState(new Date('1995-12-17T03:24:00'))

    return (
        <DatePicker
            autoOk
            variant="inline"
            format={"DD/MM/YYYY"}
            invalidDateMessage={"Fecha no es válida"}
            value = {fechaRecibo}
            onChange={(date) => {
                setFechaRecibo( moment(date).toDate());
                // props.OnpagosXReciboChange(
                //     indexArray,
                //     {
                //         indexTiposPago: indexTiposPago,
                //         indexTiposdePagoDetalle: indexTiposdePagoDetalle,
                //         fecha: moment(date).toDate(),
                //         valor: valor,
                //         indexMoneda: indexMoneda,
                //         indexBanco: indexBanco,
                //         referencia: referencia
                //     })
            }}
        // onError={(error) => onErrorDate(error)}
        // onAccept={(date) => onAcceptDate(date)}
        // maxDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha final de entrega" : "Fecha no es válida"}
        // minDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha inicial de entrega" : "Fecha no es válida"}
        // value={fechaRecibo}
        // minDate={(props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaInicio).toDate() : moment().toDate()}
        // maxDate={(props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaFinal).toDate() : moment('2100-01-01').toDate()}
        // onChange={(date) => setFechaRecibo(date)}
        />
    );

};
export default Pruebas;