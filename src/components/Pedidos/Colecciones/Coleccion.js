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
  CardActions, 
} from '@material-ui/core';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import InventoryIcon from '@material-ui/icons/ArchiveSharp';
import styles from "components/Pedidos/Colecciones/Coleccion.module.css";
import {useSelector,useDispatch} from 'react-redux';
import { APIURL } from 'utils/Enviroment';
import { verificarConexion } from 'utils/http';
import { Loading } from 'components/Global/Loading';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'moment/locale/es';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
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
  const BodegaSeleccionada = useSelector(e=>e.BodegaSeleccionada);

  const cargarProductos = () => {
    fetch(`${APIURL}/api/colecciones/productos/${props.coleccion.CodigoColeccion}/${cliente.GrupoPrecio}/${cliente.EmpresaId}/${BodegaSeleccionada.CodigoSitio}/${BodegaSeleccionada.Almacen}`)
      .then(res => res.json())
      .then(data => {
        props.Click();
        /*data.forEach(x => {
          x.ProductosXEdad.forEach(producto => {
            producto.ListaTalla.forEach(tallas => {
              if (tallas.Distribucion.length > 0) {
                producto.fisicaDisponible.forEach(disp => {
                  if (disp.PreciosEspecificos.length === 0) {
                    producto.Precio.forEach(precio => {
                      precio.Precio = 0;
                    })
                  }
                })
              }
            })
          })
        })*/

        dispatch({ type: 'SET_PRODUCTOSCOLECCION', payload: data });
        localStorage.setItem("ColeccionSeleccionada", props.coleccion.CodigoColeccion)
        localStorage.setItem("HoraIngreso", moment(new Date()).format('YYYY-MM-DDTHH:mm'))
      });
  }
  
  const verficarPaquete = () => {
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

  const cargarImagen = () => {
    axios.get(`${APIURL}/api/colecciones/${props.coleccion.CodigoColeccion}/${localStorage.getItem("empresa")}/imagenesColeccion`)
      .then(data => {
        Swal.fire({
          title: 'Confirmado',
          text: `Se ha cargado la imagen del paquete con exito.`,
          type: 'success',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Continuar',
        }).then((result) => {
          if (result.value) {
            props.reiniciarPedido();
          }
        })
      }).catch((err) => {
        let mensaje = "Ha ocurrido un error y no se pudo cargar la imagen.";

        if (err.response) {
          mensaje = err.response.data.Message;
        }

        Swal.fire({
          title: 'Error',
          text: mensaje,
          type: 'error',
          confirmButtonText: 'Ok',
        });
      });
  }

  const iniciarBorrador = () => {
    let borrador = {};
    borrador.cliente = cliente.Codigo;
    borrador.coleccion = props.coleccion.CodigoColeccion;
    borrador.empresa = cliente.EmpresaId;
    borrador.TableValue = {};
    borrador.TotalPedido = 0.0;
    localStorage.setItem("borrador", JSON.stringify(borrador));
    dispatch({ type: "RESET_TABLEVALUETOTALPEDIDO" });
  }
  
  const selectColeccion = async () => {
    dispatch({type:"RESET_PRODUCTOAGREGADO"});
    dispatch({ type: "RESET_TABLEVALUETOTALPEDIDO" });
    let HoraIngreso = localStorage.getItem('HoraIngreso');
    let HoraActual = moment().subtract(30, 'minutes').format('YYYY-MM-DDTHH:mm');
    localStorage.setItem('ProdEnCarrito', 0)

    if (Permisos.UsuarioOficina) {
      cargarProductos();
    } else {
      let borrador = JSON.parse(localStorage.getItem("borrador"));

      if (borrador) {
        if (borrador.cliente === cliente.Codigo && borrador.coleccion === props.coleccion.CodigoColeccion && borrador.empresa === cliente.EmpresaId) {
          const result = await Swal.fire({
            title: 'Pedido Borrador',
            text: `Actualmente existe un pedido de borrador para el cliente ${borrador.cliente}, coleccion ${borrador.coleccion}, empresa ${borrador.empresa}, ¿Desea continuar con el borrador o eliminarlo?`,
            type: 'warning',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Eliminar',
            allowOutsideClick: false,
          });


          if (result.value) {
            dispatch({ type: "SET_BORRADOR", payload: { TableValue: borrador.TableValue, TotalPedido: borrador.TotalPedido, listaProductosAgregados: borrador.listaProductosAgregados } })
            if (borrador.ProdEnCarrito != undefined || borrador.ProdEnCarrito != null) {
              localStorage.setItem("ProdEnCarrito", borrador.ProdEnCarrito);
            }
          } else {
            localStorage.removeItem("borrador");
            iniciarBorrador();
          }
        }else{
          const result = await Swal.fire({
            title: 'Pedido Borrador',
            text: `Actualmente existe un pedido de borrador para el cliente ${borrador.cliente}, coleccion ${borrador.coleccion}, empresa ${borrador.empresa},Si continua se eliminara el pedido borrador, si elige mantener tendra que terminar el pedido borrador ¿Desea continuar o mantener el borrador?`,
            type: 'warning',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Mantener',
            allowOutsideClick: false,
          });


          if (result.value) {
            localStorage.removeItem("borrador");
            iniciarBorrador();
          } else {
            return;
          }
        }
      } else {
        localStorage.removeItem("borrador");
        iniciarBorrador();
      }

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
  const convertirData = (data) => {
    return data.map((el) => {
        const { $id, ...inventario } = el;

        return {
            ...inventario
        }
    })
}
  const mostrarAdvertencia = (title,text,type)=>{
    Swal.fire({
        title: title,
        text: text,
        type: type,
        confirmButtonText: 'Ok',
    })
}
  const obtenerInventario = async () => {
    const request = await axios.get(`${APIURL}/api/colecciones/inventario/${props.coleccion.CodigoColeccion}`)

    if (request.data.length === 0) {
      mostrarAdvertencia("Sin Inventario", "No hay inventario disponible", "info")
      return;
    }
    const InfoConFormato = convertirData(request.data);
    console.log("request.data",InfoConFormato)
    guardarExcel(InfoConFormato);

  }
  const guardarExcel = csvData => {
        const fileName = `InventariosDisponibles-${props.coleccion.CodigoColeccion}`;
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
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
        <CardActions>
          {
            Permisos.UsuarioOficina && Permisos.AdministradorProductos &&
            <Button variant="outlined" size="medium" color="primary" onClick = {() => {cargarImagen()}} style={{ textAlign: 'center', marginBottom: '10px' }} startIcon={<PhotoLibraryIcon />}>
              Cargar Imagen
            </Button>
          }
          {
            Permisos.UsuarioOficina && Permisos.AdministradorProductos &&
            <Button variant="outlined" size="medium" color="primary" onClick = {() => {obtenerInventario()}} style={{ textAlign: 'center', marginBottom: '10px' }} startIcon={<InventoryIcon />}>
              Inventario
            </Button>
          }
        </CardActions>
      </Card>
    </div>
  );
}

export default Coleccion;