import axios from "axios";
import React, { useEffect, useState } from "react"
import { Dropdown } from "semantic-ui-react";
import { APIURL } from "utils/Enviroment";

export const ClasficacionProductos = props => {
    const numDevolucion = props.location.state;
    const [operaciones, setOperaciones] = useState([]);
    const [defectos, setDefectos] = useState([]);
    const [clasificaciones, setClasificaciones] = useState([]);

    const obtenerOperaciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/operaciones`);
            setOperaciones(request.data);
        } catch (err) {

        }
    }

    const obtenerDefectos = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/defectos`);
            setDefectos(request.data);
        } catch (err) {

        }
    }

    const obtenerClasificaciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/clasificacion/${numDevolucion}`);
            setClasificaciones(request.data);
        } catch (err) {

        }
    }

    useEffect(() => {
        obtenerOperaciones();
        obtenerClasificaciones();
        obtenerDefectos();
    }, [])

    return (
        <div className="container-fluid">
            <h3 style={{ textAlign: "center" }}>Clasificación devolución {numDevolucion}</h3>
            <hr />

            <table className="table">
                <thead>
                    <tr>
                        <th>Codigo</th>
                        <th>Color</th>
                        <th>Talla</th>
                        <th>Operación</th>
                        <th>Defecto</th>
                        <th>Clasificación</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clasificaciones.map((x, index) => (
                        <ClasificacionDetalle
                            operaciones={operaciones}
                            defectos={defectos}
                            key={x.devolucionDetalleId}
                            clasificacion={x}
                            index={index}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const ClasificacionDetalle = ({ clasificacion, operaciones, index, defectos }) => {
    const [operacionId, setOpereacionId] = useState(clasificacion.operacionId === null ? undefined : clasificacion.operacionId);
    const [defectoId, setDefectoId] = useState(clasificacion.defectoId === null ? undefined : clasificacion.defectoId);
    const [cantidadMantenimiento, setCantidadMantenimiento] = useState(clasificacion.cantidadMantenimiento);
    const [descripcionText, setDescripcionText] = useState(clasificacion.clasificacion);

    const actualizarDetalle = async () => {
        try {
            await axios.put(`${APIURL}/api/devolucion/clasificacion/${clasificacion.devolucionDetalleId}`, { operacionId, defectoId, cantidadMantenimiento, clasificacion: descripcionText });
            alert("Detalle actualizado con exito");
        } catch (err) {

        }
    }

    return (
        <tr>
            <td>{clasificacion.CodigoProducto}</td>
            <td>{clasificacion.CodigoColor}</td>
            <td>{clasificacion.CodigoTalla}</td>
            <td><Dropdown
                placeholder="Seleccione operación"
                fluid
                search
                selection
                onChange={(e, { value }) => { setOpereacionId(value) }}
                options={operaciones.map(x => ({ key: x.id, value: x.id, text: x.descripcion }))}
                noResultsMessage={"No hay resultados"}
                closeOnChange={true}
                style={{ zIndex: 999 - index }}
                value={operacionId}
            /></td>
            <td><Dropdown
                placeholder="Seleccione defecto"
                fluid
                search
                selection
                onChange={(e, { value }) => { setDefectoId(value) }}
                options={defectos.map(x => ({ key: x.id, value: x.id, text: x.descripcion }))}
                noResultsMessage={"No hay resultados"}
                closeOnChange={true}
                style={{ zIndex: 999 - index }}
                value={defectoId}
            /></td>
            <td><input className="form-control" value={descripcionText} onChange={(e) => setDescripcionText(e.target.value)} /></td>
            <td><input className="form-control" type="number" value={cantidadMantenimiento} onChange={(e) => setCantidadMantenimiento(Number(e.target.value))} /></td>
            <td><button className="btn btn-success" onClick={actualizarDetalle}>Guardar</button></td>
        </tr>
    )
}