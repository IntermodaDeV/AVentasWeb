import React, { useEffect, useState } from 'react';
import { Dropdown } from "semantic-ui-react";
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Table } from 'reactstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Button,
    Card,
    CardContent,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import { Loading } from 'components/Global/Loading';
import { IsAllow } from 'components/Seguridad/Permisos';
import { verificarConexion } from 'utils/http';

export const SincronizacionEspecifica = (props) => {
    const [asesores, setAsesores] = useState([]);
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);
    const [isLoading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [acuerdo, setAcuerdo] = useState("");

    useEffect(() => {
        if (!IsAllow("/sincronizacionlista")) {
            props.history.push('/home');
        }
        let asesoresMap = AsesoresUsuario.map((Ase) => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }));
        setAsesores(asesoresMap);
    }, [])

    const objectSincronizar = ["asesores", "rutasAsesores", "clientes", "cuotas", "acuerdosventa"];
    const objectmsg = ["Asesores", "Rutas Asesores", "Clientes", "Cuotas Acuerdo"];

    const Sincronizar = (id) => {
        try {

            if (id == objectSincronizar[2] && AsesorSelected == null) {
                Swal.fire({
                    title: 'Error',
                    text: "Para sincronizar los clientes debe seleccionar un asesor!",
                    type: 'error',
                    confirmButtonText: 'Ok'
                })
                return;
            }

            if (id == objectSincronizar[3] && acuerdo === "") {
                Swal.fire({
                    title: 'Error',
                    text: "Para sincronizar las cuotas debe ingresar un acuerdo!",
                    type: 'error',
                    confirmButtonText: 'Ok'
                })
                return;
            }

            if (id == objectSincronizar[4] && AsesorSelected == null) {
                Swal.fire({
                    title: 'Error',
                    text: "Para sincronizar los acuerdos debe seleccionar un asesor!",
                    type: 'error',
                    confirmButtonText: 'Ok'
                })
                return;
            }

            let url = `${APIURL}/api/sincronizar/${id}/`;
            let msgType = ""

            switch (id) {
                case objectSincronizar[0]:
                    msgType = objectmsg[0];
                    break;
                case objectSincronizar[1]:
                    msgType = objectmsg[1];
                    break;
                case objectSincronizar[2]:
                    url = url + `${AsesorSelected}`;
                    msgType = objectmsg[2];
                    break;
                case objectSincronizar[3]:
                    url = url + `${acuerdo}`;
                    msgType = objectmsg[3];
                    break;
                case objectSincronizar[4]:
                    url = url + `${AsesorSelected}`;
                    msgType = objectmsg[4];
                    break;
                default:
                    url = "";
            }

            Swal.fire({
                title: 'Confirmar',
                text: "¿Está seguro de realizar está acción?",
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#06bf53',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí',
                cancelButtonText: 'No',
            }).then(async (result) => {
                if (result.value) {

                    const isOnline = await verificarConexion();
                    if (!isOnline || localStorage.getItem("Conexion") === "offline") {
                        Swal.fire({
                            title: "Sin internet",
                            text: "Necesita internet para poder visualizar esta pagina.",
                            type: "warning",
                            confirmButtonText: 'Ok',
                        });

                    } else if (localStorage.getItem("Conexion") === "Online" && isOnline) {
                        setTitle("Sincronizando " + msgType)
                        setLoading(true);
                        await axios.get(url)
                            .then((response) => {
                                Swal.fire({
                                    title: 'Exito',
                                    text: msgType + " sincronizados correctamente",
                                    type: 'success',
                                    confirmButtonText: 'Ok'
                                })
                            })
                            .catch((response) => {
                                Swal.fire({
                                    title: 'Error',
                                    text: "Error al sincronizar!",
                                    type: 'error',
                                    confirmButtonText: 'Ok'
                                })
                            })
                        setLoading(false);
                    }

                }
            })

        } catch (error) {

        }

    }

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
    }

    return (
        <div>
            <Card className="my-2 " style={{ overflow: 'unset' }}>
                <CardContent>
                    <div style={{ textAlign: "center" }}>
                        <h1>Sincronización Especifica</h1>
                    </div>
                </CardContent>
            </Card>
            <Card className="my-2 " style={{ overflow: 'unset' }}>
                <CardContent>
                    <Table>
                        <thead>
                            <tr style={{ textAlign: "center" }}>
                                <th>Nombre</th>
                                <th>Parametros</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr key="1" style={{ textAlign: "center" }}>
                                <td>Asesores</td>
                                <td>-</td>
                                <td>
                                    <div>
                                        <Button
                                            onClick={() => { Sincronizar(objectSincronizar[0]) }}
                                            variant="contained"
                                            color="primary">
                                            Sincronizar
                                        </Button>
                                    </div>
                                </td>
                            </tr>

                            <tr key="2" style={{ textAlign: "center" }}>
                                <td>Rutas</td>
                                <td>-</td>
                                <td>
                                    <div>
                                        <Button
                                            onClick={() => { Sincronizar(objectSincronizar[1]) }}
                                            variant="contained"
                                            color="primary">
                                            Sincronizar
                                        </Button>
                                    </div>
                                </td>
                            </tr>

                            <tr key="3" style={{ textAlign: "center" }}>
                                <td>Clientes</td>
                                <td >
                                    <div>
                                        <Dropdown
                                            placeholder="Asesor"
                                            selection
                                            onChange={(e, { value }) => handleOnChangeAsesor(value)}
                                            options={asesores}
                                            noResultsMessage={"No hay resultados"}
                                            closeOnChange={true}
                                            value={AsesorSelected}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <Button
                                            onClick={() => { Sincronizar(objectSincronizar[2]) }}
                                            variant="contained"
                                            color="primary">
                                            Sincronizar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                            <tr key="3" style={{ textAlign: "center" }}>
                                <td>Acuerdos</td>
                                <td >
                                    <div>
                                        <Dropdown
                                            placeholder="Asesor"
                                            selection
                                            onChange={(e, { value }) => handleOnChangeAsesor(value)}
                                            options={asesores}
                                            noResultsMessage={"No hay resultados"}
                                            closeOnChange={true}
                                            value={AsesorSelected}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <Button
                                            onClick={() => { Sincronizar(objectSincronizar[4]) }}
                                            variant="contained"
                                            color="primary">
                                            Sincronizar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                            <tr key="3" style={{ textAlign: "center" }}>
                                <td>Cuotas Acuerdo</td>
                                <td >
                                    <div>
                                        <input type='text' placeholder='Acuerdo' onChange={(e) => setAcuerdo(e.target.value)} className='form-control' />
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <Button
                                            onClick={() => { Sincronizar(objectSincronizar[3]) }}
                                            variant="contained"
                                            color="primary">
                                            Sincronizar
                                        </Button>
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </Table>
                </CardContent>
            </Card>
            <Loading title={title} open={isLoading} />
        </div>

    )

}