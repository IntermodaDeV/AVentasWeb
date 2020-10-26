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

export const Relacional = props => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const redirectRolesFunciones = () =>{
        props.history.push('/relacionar');
    }

    const redirectUsuarioRoles = () =>{
        props.history.push('/relacionar/usuario-rol');
    }

    return (
        <div style={{height:'100%'}} className="container-fluid">
            <h2 className="text-center">Relacionar</h2>
            <Paper square>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                    aria-label="disabled tabs example"
                >
                    <Tab onClick={redirectRolesFunciones} icon={<RecentActorsIcon/>} label="Roles-Funciones" />
                    <Tab onClick={redirectUsuarioRoles} icon={<SupervisorAccountIcon/>} label="Usuario-Rol" />
                    <Tab icon={<DvrIcon/>} label="Pantallas-Funciones" />
                    <Tab icon={<BusinessIcon/>} label="Usuario-Empresa" />
                </Tabs>
            </Paper>
            <div className="card" style={{height:'85%'}}>
                <Switch>
                    <Route exact path={props.match.url} render={(props)=><RolesFunciones/>}/>
                    <Route exact path={`${props.match.url}/usuario-rol`} render={(props)=><UsuarioRoles/>}/>
                </Switch>
            </div>
        </div>
    )
}