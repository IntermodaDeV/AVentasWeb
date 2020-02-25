import React, { useState, useEffect } from 'react';
import styles from 'components/Pedidos/ProductoLista/Producto.module.css';
import Img from 'react-image';
import { ScaleLoader } from 'react-spinners';
import notFound from 'assets/nodisponible.png';
import { Card, } from 'reactstrap';
import { FiEye, FiSearch } from 'react-icons/fi';
import { MdCheck } from "react-icons/md";
import { useSnackbar } from 'notistack';



const Producto = (props) => {
  const { enqueueSnackbar } = useSnackbar();

  const toggleSelect = () => {
    if (primerRender ? (precioProductoTemporal !== undefined) : (precioProducto !== undefined)) {
      if (!(selected || isSelectedTemporal) && totalProducto + props.TotalPedido > props.LimiteVenta) {
        props.alertaLimiteCredito();
      } else {
        if ((props.producto.fisicaDisponible.reduce((acc, curr) => { return acc + curr.Cantidad }, 0) > 0) || props.isFuture) {
          setselected(!selected);
          props.toggleSelectProducto(props.producto);
        } else {
          enqueueSnackbar('Producto sin stock', {
            variant: 'error',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
          });
        }

      }
    } else {
      props.alertaPrecio();
    }
  }
  const [selected, setselected] = useState(false);
  const [primerRender, setPrimerRender] = useState(true);
  const [totalProducto, setTotalProducto] = useState(0);
  const [precioProducto, setPrecio] = useState(undefined);
  let isSelectedTemporal = false;
  let precioProductoTemporal = undefined;

  try {
    isSelectedTemporal = props.TableValue[props.producto.Linea.IdLinea][props.producto.CodigoColeccion][props.producto.GrupoTalla].Productos[props.producto.ProductoId].Selected;
  } catch{ }

  precioProductoTemporal = props.producto.Precio.find(precioxProd => {
    return precioxProd.GrupoPrecio === props.GrupoPrecioCliente;
  });


  useEffect(() => {

    let precio = props.producto.Precio.find(precioxProd => {
      return precioxProd.GrupoPrecio === props.GrupoPrecioCliente;
    });
    if (precio) {
      try {
        let tempTotal = 0.00;
        Object.keys(props.TableValue[props.producto.Linea.IdLinea][props.producto.CodigoColeccion][props.producto.GrupoTalla].Productos[props.producto.ProductoId].Colores).forEach((codigoColor) => {
          let color = props.TableValue[props.producto.Linea.IdLinea][props.producto.CodigoColeccion][props.producto.GrupoTalla].Productos[props.producto.ProductoId].Colores[codigoColor];

          Object.keys(color.Tallas).forEach((codigoTalla) => {

            let valorTalla = color.Tallas[codigoTalla];
            tempTotal = tempTotal + (precio.Precio * (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10)));
          });
        });
        setTotalProducto(tempTotal);
      } catch{ }
      setPrecio(precio);
      setPrimerRender(false);
    }
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    let selected = false;
    try {
      selected = props.TableValue[props.producto.Linea.IdLinea][props.producto.CodigoColeccion][props.producto.GrupoTalla].Productos[props.producto.ProductoId].Selected;
    } catch{ }
    setselected(selected);
    // eslint-disable-next-line
  }, [props.producto]);
  let selectableClassName = styles.selectable;


  if (primerRender ? isSelectedTemporal : selected) {
    selectableClassName = selectableClassName + ' ' + styles.selected;
  }

  return (
    //className="col-xl-3 col-md-6 col-lg-4 col-sm-6 col-12"
    <div className="col" style={{ maxWidth: '360px' }} id={props.producto.Primero ? props.producto.Edad.Codigo : ""}>
      <Card
        onClick={() => { toggleSelect() }}
        className={styles.card}
      >
        {
          !props.isFuture &&
          <>
            {
              props.SoldOut && <div className={styles.soldOut} >Sin Stock</div>
            }
          </>
        }
        <div className={selectableClassName}>
          <Img
            className="card-img-right"
            src={[props.producto.ListaImagenes && props.producto.ListaImagenes[0] ? props.producto.ListaImagenes[0].FotografiaProducto : null, notFound]}
            style={{ width: 'auto', height: 250 }}
            loader={
              <ScaleLoader
                css={{ height: '30px', bottom: '5px', position: 'relative', transform: 'scale(0.8)' }}
                size={'20px'}
                color={'#000'}
                loading={true} />
            }
          />
          {/* <CardImg
            className="card-img-right"
            src={props.producto.ListaImagenes[0] ? props.producto.ListaImagenes[0] : NotFoundImage}
            style={{ width: 'auto', height: 220 }}
          /> */}

          <div style={{ padding: 10, height: 80 }}>

            <div style={{ fontWeight: "400", fontSize: 13, textAlign: 'left', }} >
              {props.producto.NombreProducto}
            </div>

            <div style={{ fontWeight: "300", fontSize: 13, textAlign: 'left', color: '#a7a4a4', marginTop: 5 }} >
              {/* Pseudo  */}Código - {props.producto.ProductoId}
            </div>

            <div style={{ fontWeight: "300", fontSize: 13, textAlign: 'left', color: '#a7a4a4', marginTop: 5 }} >
              *Disponible en {props.producto.ListaColores.length} {(props.producto.ListaColores.length === 1) ? 'color' : 'colores'}
            </div>

            <div style={{ textAlign: 'center' }}>
              {/* El boton se mostrara en responsive */}
              {/* <Button onClick={props.Click} className={styles.btn}>Ver Detalle</Button> */}

              <div className={styles.cdtrigger}>
                {/* <Row>
                  <Col> */}
                <table className={styles.tableed}>
                  <tbody>
                    <tr>
                      <td onClick={props.ClickVistaRapida}>
                        <FiEye style={{ fontSize: '16px', color: 'black' }} />
                        <span className={styles.cda}> Vista Rapida</span>
                      </td>
                      <td onClick={props.Click}>
                        <FiSearch style={{ fontSize: '16px', color: 'black' }} />
                        <span className={styles.cda}> Ver Detalle</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>
          <div className={styles.check}><span className={styles.checkmark}><MdCheck style={{ strokeWidth: '2' }} /></span></div>
        </div>
      </Card>
    </div>
  );
}
const areEqual = (prevProps, nextProps) => {
  return false;
}
export default React.memo(Producto, areEqual);