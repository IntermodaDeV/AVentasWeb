import React,{useEffect,useState} from 'react';
import { Dropdown } from "semantic-ui-react";
import {APIURL} from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {Table} from 'reactstrap';
import { SyncLoader } from 'react-spinners';
import {
    Button,
    Card,
    CardContent,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';

const Sincronizacionlista = (props)=>{
    const [modulos,setModulos] = useState([]);
    const [gestores,setGestores] = useState([]);
    const [moduloSelected,setModuloSelected] = useState(0);

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
                    {setModulos(data)},
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

    const SincronizarGestores = ()=>{
        fetch(`${APIURL}/api/SincronizacionLista/Gestores`)
        .then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '');
                window.location.reload();
            }
            if (res.status === 200) {
            res.json()
            .then(data=> 
                    {setGestores(data)},
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
        //.then(res=>res.json())
        //.then(data=>setGestores(data))
    }

    const PostearEnLista = (id)=>{

        Swal.fire({
            title: 'Confirmar',
            text: "¿Está seguro de realizar está acción?",
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#06bf53',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                fetch(`${APIURL}/api/SincronizacionLista/${id}/${localStorage.getItem('codigo')}/upload`,{
                    headers:{
                        "Content-type":"application/json"
                    },
                    method:"POST"
                })
                .then(res=>res.json())
                .then(data=>
                    Swal.fire({
                        title: 'Mensaje del servidor',
                        text: data,
                        type: 'info',
                        confirmButtonText: 'Ok'
                    })
                
                );  
            }
        })
    }

    useEffect(()=>{
        SincronizarModulos();
        SincronizarGestores();
    },[])

    return (
        <div>
            <Card className="my-2" style={{ overflow: 'unset' }}>
            <CardContent>
                <div>
                    <div className="row mt-2">
                        <div className="col">
                            <h5 className="font-weight-light">
                                Selecione módulo de sincronización
                    </h5>
                            <hr />
                        </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center'}}>
                        <div className={'col-xl-10 col-lg-10 col-sm-10 col-10 mt-2'} >
                        <Dropdown
                        placeholder="Escoja el módulo de sincronización:"
                        fluid
                        search
                        selection
                        onChange={(e, { value }) =>{
                            setModuloSelected(value);
                        }}
                        options={
                            modulos.sort(function (a, b) {
                                return a.NOMBRE.localeCompare(b.NOMBRE);
                            }).map(modulo => {
                            return {key:modulo.ID, text:modulo.NOMBRE, value: modulo.ID}
                        })}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        />
                        </div>
                        <div>
                            <Button variant="contained" color="primary" onClick={()=>{props.history.push('/sincronizacionListaMonitor')}}>Monitor de sincronización</Button>
                        </div>
                    </div>

                    {
                        props.loading &&
                        <div style={{ textAlign: "center", marginTop: '25px' }}>
                            <SyncLoader
                                size={20}
                                color={'#31547C'}
                                loading={props.loading} />
                        </div>
                    }
                </div>
            </CardContent>
        </Card>
        <br/>
            {(moduloSelected===0)?
            <div></div>
            :
            <Card className="my-2 " style={{ overflow: 'unset'}}>
            <CardContent>
            <Table responsive>
                <thead>
                    <tr style={{ textAlign: "center"}}>
                        <th>Nombre</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {gestores.filter(x=>x.ID_MODULO === moduloSelected).sort(function (a, b) {
                                return a.NOMBRE.localeCompare(b.NOMBRE);
                            }).map(gestor=>(
                        <tr key={gestor.ID} style={{ textAlign: "center"}}>
                            <td>{gestor.NOMBRE}</td>
                            <td>
                            <div>
                            <Button
                                onClick={()=>{PostearEnLista(gestor.ID)}}
                                variant="contained"
                                color="primary">
                                Seleccionar
                            </Button>
                            </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            </CardContent>
            </Card>
            }           
        </div>
    )
}

export default Sincronizacionlista;