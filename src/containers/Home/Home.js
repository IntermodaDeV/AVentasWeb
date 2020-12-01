import React,{useEffect} from 'react';
import {APIURL} from 'utils/Enviroment';
import {useDispatch} from 'react-redux';
export const Home = (props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        ObtenerPermisos();
        cargarEmpresas();
        cargarMonedas();
        cargarClientesContado();
        cargarComunidadAutonoma();
         // eslint-disable-next-line
    }, []);
    const ObtenerPermisos = ()=>{
        fetch(`${APIURL}/api/Accesos/${localStorage.getItem('codigo')}`)
        .then(res => {
            if (res.status === 401) {
                window.location.reload();
            }
            if (res.status === 200) {
            res.json()
            .then(data=> 
                    {
                    console.log("data",data)
                    dispatch({type:'SET_PERMISOS',payload:data});
                    },
                    (error) => {
                        console.log(error)
                    }
                )
            }
        })
    }

    const cargarComunidadAutonoma = () =>{
        fetch(`${APIURL}/api/transporte/comunidadautonoma`)
        .then(res=>res.json())
        .then(data=>dispatch({type:'SET_COMUNIDADAUTONOMA',payload:data}))
        .catch(error=>this.setState({error}))
    }

    const cargarEmpresas = ()=>{
        fetch(`${APIURL}/api/empresa/empresas`)
        .then(res=>res.json())
        .then(data=>{ dispatch({type:'SET_EMPRESAS',payload:data})})
        .catch(error=>console.log(error))
    }

    const cargarMonedas = () =>{
        fetch(`${APIURL}/api/moneda`)
        .then(res=>res.json()) 
        .then(data=>{ dispatch({type:'SET_ABREVACIONMONEDAS',payload:data})})
        .catch(error=>console.log(error))
    }

    const cargarClientesContado = ()=>{
        fetch(`${APIURL}/api/clientecontado/${localStorage.getItem('codigo')}`)
        .then(res=>res.json())
        .then(data=>{dispatch({type:'SET_CLIENTESCONTADO',payload:data})})
        .catch(error=>console.log(error))
    }
    return(
        <div style={{height:'100%'}} className="container-fluid">
            <div class="card-body text-center">
              <h1 class="card-title">¡Bienvenido(a) {localStorage.getItem('asesor')}!</h1>
            </div>
        </div>
    )
}