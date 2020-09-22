import React,{useEffect,useState} from 'react';
import { Dropdown } from "semantic-ui-react";
import {APIURL} from 'utils/Enviroment';
import { DatePicker } from "@material-ui/pickers";

import {
    Card as CardR,
    CardBody,
    CardHeader
} from 'reactstrap';
import {
    Card,
    CardContent,
    Button
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import styles from './SincronizacionListaMonitor.module.css';
import 'semantic-ui-css/semantic.min.css';

const SincronizacionListaMonitor = (props)=>{
    const [listado,setListado] = useState([]);
    const [modulos,setModulos] = useState([]);
    const [fechaSelected,setFechaSelected] = useState(new Date());
    const [moduloSelected,setModuloSelected] = useState(0);

    const SincronizarListado = ()=>{
        fetch(`${APIURL}/api/SincronizacionLista/${localStorage.getItem('codigo')}`)
        .then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '');
                window.location.reload();
            }
            if (res.status === 200) {
            res.json()
            .then(data=> 
                    {setListado(data)},
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        this.setState({

                            error
                        });
                    }
                )
            }
        })
    }

    const SincronizarModulos = ()=>{
        fetch(`${APIURL}/api/SincronizacionLista/ModulosGestores`)
        .then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '');
                window.location.reload();
            }
            if (res.status === 200) {
            res.json()
            .then(data=> 
                    {
                        var todo = {"ID": 0, "NOMBRE": "Todo"};
                        data.push(todo);
                        setModulos(data);
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        this.setState({

                            error
                        });
                    }
                )
            }
        })
    }

    useEffect(()=>{
        SincronizarModulos();
        SincronizarListado();
    },[])

    return (
        <div>
            <Card className="my-2" style={{ overflow: 'unset' }}>
            <CardContent>
                <div>
                    <CardR>
                        <CardHeader>
                            Filtros de Búsqueda
                        </CardHeader>

                        <CardBody>
                        <div style={{display:'flex'}}>
                            <div className='col-lg-2 col-sm-4 col-6'>
                                <DatePicker
                                    disableToolbar
                                    className={"w-100"}
                                    autoOk
                                    label={"Fecha"}
                                    variant="inline"
                                    format={"DD/MM/YYYY"}
                                    //disablePast
                                    value={fechaSelected}
                                    maxDate={new Date()}
                                    minDate={new Date().setDate(new Date().getDate()-14)}
                                    onChange={(date) => setFechaSelected(date)}
                                />
                                
                            </div>
                            <div className='col-lg-8 col-sm-6 col-6'>
                                <Dropdown
                                    placeholder="Escoja el módulo de sincronización:"
                                    fluid
                                    search
                                    selection
                                    onChange={(e, { value }) =>{
                                        setModuloSelected(value);
                                    }}
                                    options={
                                        modulos.sort((a, b)=> (a.NOMBRE.localeCompare(b.NOMBRE)))
                                        .map(modulo => ({key:modulo.ID, text:modulo.NOMBRE, value: modulo.ID})
                                        )}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    />
                            </div>
                            <div>
                                <Button color="primary" variant="contained" onClick={()=>{props.history.push('/sincronizacionlista')}}>Asignar nuevo</Button>
                            </div>
                        </div>
                        </CardBody>
                    </CardR>
                </div>
            </CardContent>
        </Card>
        <br/>
        <table  className="table table-striped">
                <thead>
                    <tr>
                        <th className={styles.StickyHeader}>ID Lista</th>
                        <th className={styles.StickyHeader}>Código Gestor</th>
                        <th className={styles.StickyHeader}>Nombre Gestor</th>
                        <th className={styles.StickyHeader}>Módulo</th>
                        <th className={styles.StickyHeader}>Fecha</th>
                        <th className={styles.StickyHeader}>En Espera</th>
                        <th className={styles.StickyHeader}>En Ejecución</th>
                        <th className={styles.StickyHeader}>Finalizado</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        listado.filter(x=> (x.ID_MODULO === moduloSelected || moduloSelected === 0) && new Date(x.FECHA).setHours(0,0,0,0)===new Date(fechaSelected).setHours(0,0,0,0))
                        .map((item, ind)=>(

                                    <tr key={ind} style={{ textAlign: "center"}}>
                                        <td className="font-weight-bold">{item.ID}</td>
                                        <td className="font-weight-bold">{item.ID_GESTOR}</td>
                                        <td className="font-weight-bold">{item.NOMBRE}</td>
                                        <td className="font-weight-bold">{item.MODULO}</td>
                                        <td className="font-weight-bold">{item.FECHASTR}</td>
                                        <td className="font-weight-bold">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.EN_ESPERA}
                                                                style={{ height: 25, width: 25}}
                                                                readOnly
                                                                />
                                        </td>
                                        <td className="font-weight-bold">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.EN_EJECUCION}
                                                                style={{ height: 25, width: 25, margin: "auto", textAlign: "center"}}
                                                                readOnly
                                                                />
                                        </td>
                                        <td className="font-weight-bold">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.FINALIZADO}
                                                                style={{ height: 25, width: 25}}
                                                                readOnly
                                                                />
                                        </td>
                                    </tr>
                                ))}
                </tbody>
            </table>
    </div>
    )
}

export default SincronizacionListaMonitor;