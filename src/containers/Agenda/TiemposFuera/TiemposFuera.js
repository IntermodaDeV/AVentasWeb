import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Card,
    CardBody,
    CardHeader
} from 'reactstrap';
import { Dropdown } from "semantic-ui-react";
import moment from "moment";
import { ObtenerCoordenadas } from 'utils/common';
import { APIURL } from 'utils/Enviroment';


export const TiemposFuera = () => {
    const [descripcion, setDescripcion] = useState("");
    const [motivo, setMotivo] = useState(null);
    const [motivos, setMotivos] = useState([]);
    const [tiemposFuera, setTiemposFuera] = useState([]);

    const obtenerMotivosTiemposFuera = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/tiemposfuera/motivotiempofuera/asesor`);
            setMotivos(request.data);
        } catch (err) {

        }
    }

    const obtenerTiemposFueraAsesorDia = async () => {
        try {
            const asesor = localStorage.getItem("codigo");
            const request = await axios.get(`${APIURL}/api/tiemposfuera/diario/${asesor}`);
            setTiemposFuera(request.data);
        } catch (err) {

        }
    }

    const registrarTiempoFuera = async (latitudEntrada, longitudEntrada) => {
        try {
            const existeTiempoAbierto = tiemposFuera.find(x=>x.horaSalida === null);
            if(existeTiempoAbierto){
                alert("Cerrar tiempos fuera de agenda abiertos.");
                return;
            }

            if (motivo === null) {
                alert("Por favor, seleccione un motivo.");
            } else {
                await axios.post(`${APIURL}/api/tiemposfuera/asesor`, { motivoTiempoFueraId: motivo, latitudEntrada, longitudEntrada, codigoAsesor: localStorage.getItem("codigo"), descripcion });
                await obtenerTiemposFueraAsesorDia();
                setMotivo(null);
                setDescripcion("");
            }
        } catch (err) {

        }
    }

    const completarTiempoFuera = async (tiempoFueraId, latitudSalida, longitudSalida) => {
        try {
            await axios.put(`${APIURL}/api/tiemposfuera/asesor`, { tiempoFueraId, latitudSalida, longitudSalida });
            await obtenerTiemposFueraAsesorDia();
        } catch (err) {

        }
    }

    useEffect(() => {
        obtenerMotivosTiemposFuera();
        obtenerTiemposFueraAsesorDia();
    }, []);

    return (
        <div className="px-2">
            <Card>
                <CardHeader>
                    Asignar Trabajo
                </CardHeader>
                <CardBody>
                    <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: '80px', paddingRight: "80px" }}>
                        <div >
                            <Dropdown
                                placeholder="Motivo tiempo fuera"
                                selection
                                onChange={(e, { value }) => setMotivo(value)}
                                options={motivos.map(x => ({ text: x.descripcion, value: x.id }))}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                value={motivo}
                            />
                        </div>
                        <div>
                            <input type="text" className="mr-5 form-control" placeholder="Descripcion" value={descripcion} onChange={(e) => { setDescripcion(e.target.value) }} />
                        </div>
                        <div>
                            <button className='btn-lg btn-success' onClick={() => { ObtenerCoordenadas((p) => registrarTiempoFuera(p.coords.latitude, p.coords.longitude), () => registrarTiempoFuera()) }}>Check In</button>
                        </div>
                    </div>

                    <hr />

                    <table className='table'>
                        <thead>
                            <th>Id</th>
                            <th>Motivo</th>
                            <th>Descripción</th>
                            <th>Hora Entrada</th>
                            <th>Hora Salida</th>
                            <th>Acciones</th>
                        </thead>
                        <tbody>
                            {tiemposFuera.map(x => (<tr key={x.id}>
                                <td>{x.id}</td>
                                <td>{x.motivo}</td>
                                <td>{x.descripcion}</td>
                                <td>{moment(x.horaEntrada).format("DD/MM/YYYY hh:mm a")}</td>
                                <td>{(x.horaSalida === null) ? "" : moment(x.horaSalida).format("DD/MM/YYYY hh:mm a")}</td>
                                <td>{(x.horaSalida === null) ? <button className='btn-lg btn-success' onClick={() => { ObtenerCoordenadas((p) => completarTiempoFuera(x.id, p.coords.latitude, p.coords.longitude), () => completarTiempoFuera(x.id, null, null)) }}>Check out</button> : "Completada"}</td>
                            </tr>))}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </div>
    );

}