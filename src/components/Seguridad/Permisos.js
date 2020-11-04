import store from 'store/store';

export const IsAllow = (Ruta) => {
    const globalState = store.getState();
    const Permisos = globalState["Permisos"];

        for(let usu of Permisos){
            for(let rol of usu.RolesUsuarios){
                for(let fun of rol.RolesFunciones){
                    for(let pan of fun.PantallasFunciones){
                        if(pan.Ruta.toUpperCase().includes(Ruta.toUpperCase()))
                        {
                            return true;
                        }
                    }
                }
            }
        }
    return false;
};
