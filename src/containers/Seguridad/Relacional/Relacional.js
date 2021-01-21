import React from 'react';
import {Route,Switch} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import DvrIcon from '@material-ui/icons/Dvr';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import BusinessIcon from '@material-ui/icons/Business';

import { RolesFunciones } from './RolesFunciones';
import { UsuarioRoles } from './UsuarioRoles';
import {PantallasFunciones} from './PantallasFunciones';
import {UsuariosEmpresas} from './UsuariosEmpresas';
import {UsuarioAsesor} from './UsuarioAsesor';

export const Relacional = props => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const redirectRolesFunciones = () =>{
        props.history.push('/seguridad-permisos/roles-funciones');
    }

    const redirectUsuarioRoles = () =>{
        props.history.push('/seguridad-permisos');
    }

    const redirectUsuarioEmpresa  = () =>{
        props.history.push('/seguridad-permisos/Usuario-Empresa');
    }
    const redirectFuncionPantalla = () =>{
        props.history.push('/seguridad-permisos/Funciones-Pantallas');
    }
    const redirectUsuarioAsesor  = () =>{
        props.history.push('/seguridad-permisos/Usuario-Asesor');
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
                     <Tab onClick={redirectUsuarioEmpresa} icon={<BusinessIcon/>} label="Usuario-Empresa" />
                    <Tab onClick={redirectUsuarioAsesor} icon={<SupervisorAccountIcon/>} label="Usuario-Asesor" />
                    <Tab onClick={redirectUsuarioRoles} icon={<SupervisorAccountIcon/>} label="Usuario-Roles" />
                    <Tab onClick={redirectRolesFunciones} icon={<RecentActorsIcon/>} label="Roles-Funciones" />
                    <Tab onClick={redirectFuncionPantalla} icon={<DvrIcon/>} label="Pantallas-Funciones" />
                </Tabs>
            </Paper>
            <div className="card" style={{height:'85%'}}>
                <Switch>
                    <Route exact path={`${props.match.url}/Usuario-Empresa`} render={(props)=><UsuariosEmpresas/>}/>
                    <Route exact path={`${props.match.url}/Usuario-Asesor`} render={(props)=><UsuarioAsesor/>}/>
                    <Route exact path={`${props.match.url}`} render={(props)=><UsuarioRoles/>}/>
                    <Route exact path={`${props.match.url}/roles-funciones`} render={(props)=><RolesFunciones/>}/>
                    <Route exact path={`${props.match.url}/Funciones-Pantallas`} render={(props)=><PantallasFunciones/>}/>
                </Switch>
            </div>
        </div>
    )
}