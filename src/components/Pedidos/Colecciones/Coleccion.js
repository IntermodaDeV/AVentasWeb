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
import styles from "components/Pedidos/Colecciones/Coleccion.module.css";
import {useSelector,useDispatch} from 'react-redux';
import { APIURL } from 'utils/Enviroment';

import 'moment/locale/es'
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
  const dispatch = useDispatch();
  const coleccion = useSelector(e=>e.coleccion);
  
  const selectColeccion = ()=>{
    let HoraIngreso = localStorage.getItem('HoraIngreso');
    let HoraActual = moment().subtract(30, 'minutes').format('YYYY-MM-DDTHH:mm');

    if(props.coleccion.CodigoColeccion !== localStorage.getItem('ColeccionSeleccionada') || coleccion.Edades.length===0 || HoraActual > HoraIngreso)
    {
      fetch(`${APIURL}/api/colecciones/productos/${props.coleccion.CodigoColeccion}/${cliente.GrupoPrecio}/${localStorage.getItem('empresa')}`)
      .then(res=>res.json())
      .then(data=>{
        props.Click();
        dispatch({type:'SET_PRODUCTOSCOLECCION',payload:data});
        localStorage.setItem("ColeccionSeleccionada", props.coleccion.CodigoColeccion)
        localStorage.setItem("HoraIngreso", moment(new Date()).format('YYYY-MM-DDTHH:mm'))
      });
    }
    else
    {
      props.Click();
    }
   
  }

  return (
    <div className="col-lg-4 col-md-6 col-12 mb-3 mt-1">
      <Card raised={Raised}
        onMouseEnter={() => setRaised(true)}
        onMouseLeave={() => setRaised(false)}>
        <CardActionArea
          onClickCapture={selectColeccion}>
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
            <div className="row">
              <div className="col px-1">
                <div className="row mb-2 text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion} >Venta Inicio:</h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.VentaInicio).calendar()}
                  </div>
                </div>
                <div className="row text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion}>Venta Fin:</h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.VentaFinal).calendar()}
                  </div>
                </div>
              </div>
              <div className="col px-1">
                <div className="row mb-2 text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion}>Entrega Inicio:</h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.EntregaInicio).calendar()}
                  </div>
                </div>
                <div className="row text-center">
                  <div className="col-12 p-0">
                    <h5 className={styles.TitleColeccion}> Entrega Fin: </h5>
                  </div>
                  <div className="col-12 p-0">
                    {moment(props.coleccion.EntregaFinal).calendar()}
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