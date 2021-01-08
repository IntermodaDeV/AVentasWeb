import React from 'react';
import {Route,Switch} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import {TiposIngreso} from 'components/Encuestas/TiposIngreso/TiposIngreso';
import {GrupoOpciones} from 'components/Encuestas/GrupoOpciones/GrupoOpciones'
import {GrupoOpcionesDetalle} from 'components/Encuestas/GrupoOpcionesDetalle/GrupoOpcionesDetalle'
export const MantenimientoEncuesta = props => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const redirectGrupoOpciones = () =>{
        props.history.push('/Mantenimiento/Encuesta/GrupoOpciones');
    }

    const redirectGrupoOpcionesDetalle = () =>{
        props.history.push('/Mantenimiento/Encuesta/GrupoOpcionesDetalle');
    }

    const redirectTiposIngreso = () =>{
        props.history.push('/Mantenimiento/Encuesta');
    }

    return (
        <div style={{height:'100%'}} className="container-fluid">
            <Paper square>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                    aria-label="disabled tabs example"
                >
                    <Tab onClick={redirectTiposIngreso} icon={<RecentActorsIcon/>} label="Tipos Ingreso" />
                    <Tab onClick={redirectGrupoOpciones} icon = {<SupervisorAccountIcon/>} label ="Grupo Opciones"/>
                    <Tab onClick={redirectGrupoOpcionesDetalle} icon = {<SupervisorAccountIcon/>} label ="Grupo Opciones Detalle"/>
                </Tabs>
            </Paper>
            <div className="card" style={{height:'85%'}}>
                <Switch>
                    <Route exact path={`${props.match.url}`} render={(props)=><TiposIngreso/>}/>
                    <Route exact path={`${props.match.url}/GrupoOpciones`} render={(props)=><GrupoOpciones/>}/>
                    <Route exact path={`${props.match.url}/GrupoOpcionesDetalle`} render={(props)=><GrupoOpcionesDetalle/>}/>
                </Switch>
            </div>
        </div>
    )
}