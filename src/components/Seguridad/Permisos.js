import store from 'store/store';

export const IsAllow = (Ruta) => {
    let ModoOffline = localStorage.getItem("Conexion") === "Online" ? false : true;
    const globalState = store.getState();
    const Permisos = globalState["Permisos"];
        for(let usu of Permisos){
            for(let rol of usu.RolesUsuarios){
                for(let fun of rol.RolesFunciones){
                    for(let pan of fun.PantallasFunciones){
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
    return false;
};
