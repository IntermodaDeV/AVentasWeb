import React from 'react';
import moment from "moment";
import Img from 'react-image'
import { withStyles } from "@material-ui/core/styles";
import { ScaleLoader } from 'react-spinners';
import {
  Card,
  CardActionArea,
  CardHeader as MuiCardHeader,
  CardContent,
  CardMedia,
} from '@material-ui/core';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import styles from "components/Pedidos/Colecciones/Coleccion.module.css";
import {useSelector,useDispatch} from 'react-redux';
import { APIURL } from 'utils/Enviroment';
import { verificarConexion } from 'utils/http';
import { Loading } from 'components/Global/Loading';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'moment/locale/es';
import Button from '@material-ui/core/Button';
moment.locale('es');

const CardHeader = withStyles({
  title: {
    fontWeight: '600',
    textAlign: 'center'
  },
})(MuiCardHeader);

const Coleccion = (props) => {
  const [Raised, setRaised] = React.useState(false);
  const cliente = useSelector(e=>e.cliente);
  const Permisos = useSelector(e=>e.Permisos[0]);
  const dispatch = useDispatch();
  const coleccion = useSelector(e=>e.coleccion);
  const [loading,setLoading] = React.useState(false);
  const cargarProductos = () => {
    fetch(`${APIURL}/api/colecciones/productos/${props.coleccion.CodigoColeccion}/${cliente.GrupoPrecio}/${cliente.EmpresaId}`)
      .then(res => res.json())
      .then(data => {
        props.Click();
        dispatch({ type: 'SET_PRODUCTOSCOLECCION', payload: data });
        localStorage.setItem("ColeccionSeleccionada", props.coleccion.CodigoColeccion)
        localStorage.setItem("HoraIngreso", moment(new Date()).format('YYYY-MM-DDTHH:mm'))
      });
  }
  
  const verficarPaquete = (e) => {
    if(e.target.classList.contains("MuiButton-label"))
    {
      fetch(`${APIURL}/api/colecciones/${props.coleccion.CodigoColeccion}/${localStorage.getItem("empresa")}/imagenesColeccion`)
      .then(res => res.json())
      .then(data => {
        props.reiniciarPedido();
      });
    }
    else
    {
      if (Permisos.UsuarioOficina === false && props.coleccion.Estatus !== 1) {
        Swal.fire({
          title: 'Sin Acceso',
          text: '¡Este paquete no esta disponible para la venta!',
          type: 'error',
          confirmButtonText: 'Ok',
        });
      }
      else {
        selectColeccion();
      }
    }
  }

  const selectColeccion = async () => {
    dispatch({type:"RESET_PRODUCTOAGREGADO"});
    let HoraIngreso = localStorage.getItem('HoraIngreso');
    let HoraActual = moment().subtract(30, 'minutes').format('YYYY-MM-DDTHH:mm');

    if (Permisos.UsuarioOficina) {
      cargarProductos();
    } else {
      if (localStorage.getItem("Conexion") === "Online") {
        setLoading(true);
        let isOnline = await verificarConexion();
        setLoading(false);
        if (localStorage.getItem("Conexion") === "Online" && isOnline) {
          if (props.coleccion.CodigoColeccion !== localStorage.getItem('ColeccionSeleccionada') || coleccion === null || coleccion.Edades === undefined || coleccion.Edades.length === 0 || HoraActual > HoraIngreso) {
            cargarProductos();
          }
          else {
            dispatch({ type: 'SET_PRODUCTOSCOLECCION', payload: coleccion.Edades });
            props.Click();
          }
        }else{
          props.Click();
        }
      } else {
        props.Click()
      }
    }
  }

  return (
    <div className="col-lg-4 col-md-6 col-12 mb-3 mt-1">
      <Loading open={loading} title={"Verificando conexión"}/>
      <Card raised={Raised}
        onMouseEnter={() => setRaised(true)}
        onMouseLeave={() => setRaised(false)}>
        <CardActionArea
          onClickCapture={verficarPaquete}>
          <CardHeader
            titleTypographyProps={{ fontWeight: 'bold' }}
            title={props.coleccion.Nombre}
          //subheader="September 14, 2016"
          >
          </CardHeader>
          <CardMedia
            component="div"
            title={props.coleccion.Nombre}
            children={
              <Img
                className="card-img-right"
                src={props.coleccion.FotoPortada}
                style={{ width: '100%' }}
                loader={
                  <ScaleLoader
                    css={{ margin: 'auto', position: 'relative', textAlign: 'center' }}
                    size={'20px'}
                    color={'#000'}
                    loading={true} />
                }
              />
            }
          />

          <CardContent>
            {
              Permisos.UsuarioOficina && Permisos.AdministradorProductos &&
              <>
              <hr className={"mt-0 " + styles.BorderTop}></hr>
              <div className="text-center">
                <Button  variant="outlined" size="medium" color="primary" style={{ textAlign:'center', marginBottom:'10px'}} startIcon ={<PhotoLibraryIcon/>}>
                  Cargar Imagen
                </Button>
              </div>
              </>
            }
            <hr className={"mt-0 " + styles.BorderTop}></hr>
            <h4 style={{textAlign:'center'}}>{props.coleccion.CodigoColeccion}</h4>
            <h5 className={styles.TitleColeccion} style={{textAlign:'center', color: props.coleccion.Estatus === 1 ? 'green' : 'red'}}>Status AX: { props.coleccion.Estatus === 1 ? "Disponible para la venta" : "En Proceso"}</h5>
            <div className="row">
              <div className="col px-1">
                <div className="row mb-2 text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion} >Venta Inicio:</h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.VentaInicio).format("DD/MM/YYYY")}
                  </div>
                </div>
                <div className="row text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion}>Venta Fin:</h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.VentaFinal).format("DD/MM/YYYY")}
                  </div>
                </div>
              </div>
              <div className="col px-1">
                <div className="row mb-2 text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion}>Entrega Inicio:</h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.EntregaInicio).format("DD/MM/YYYY")}
                  </div>
                </div>
                <div className="row text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion}> Entrega Fin: </h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.EntregaFinal).format("DD/MM/YYYY")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}

export default Coleccion;