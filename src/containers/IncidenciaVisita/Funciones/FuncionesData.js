import { APIURL } from 'utils/Enviroment';
import axios from 'axios';

export const  EliminarImagenes = async () => {    
    try {

        await axios.delete(`${APIURL}/api/incidencia/eliminarImagenes`);
        return true;
    } catch (err) {       
        Swal.fire({
            title: 'Error',
            text: "Error al eliminar las imagenes: ", err,
            type: 'error',
            confirmButtonText: 'Ok',
            target: context.current
        });
        return false;
    }
}

