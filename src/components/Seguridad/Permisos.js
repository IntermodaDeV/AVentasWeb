import store from 'store/store';

export const IsAllow = (Ruta, expanded) => {
    let ModoOffline = localStorage.getItem("Conexion") === "Online" ? false : true;
    const globalState = store.getState();
    const Permisos = globalState["Permisos"];
        for(let usu of Permisos){
            for(let rol of usu.RolesUsuarios){
                for(let fun of rol.RolesFunciones){
                    for(let pan of fun.PantallasFunciones){
                        if(expanded === true){
                            if(pan.Ruta.toUpperCase() === Ruta.toUpperCase())
                            {
                                if(ModoOffline)
                                {
                                    if(pan.ModoOffline === true)
                                    {
                                        return true;
                                    } 
                                }
                                else{
                                    return true;
                                }
                            }
                        }
                        else{
                            if(pan.Ruta.toUpperCase().includes(Ruta.toUpperCase()))
                            {
                                if(ModoOffline)
                                {
                                    if(pan.ModoOffline === true)
                                    {
                                        return true;
                                    } 
                                }
                                else{
                                    return true;
                                }
                            }
                        }
                        
                    }
                }
            }
        }
    return false;
};

export const PermisoExcepcionDescuento = () => {
    const globalState = store.getState();
    const Permisos = globalState["Permisos"];

    for (const Permiso of Permisos) {
        for (const Roles of Permiso.RolesUsuarios) {
            if (Roles.Nombre === "Aprobador excepcion descuento") {
                return true;
            }
        }
    }

    return false;
}