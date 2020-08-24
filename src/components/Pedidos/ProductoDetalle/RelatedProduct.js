import React, { useEffect } from 'react';
import styles from "components/Pedidos/ProductoDetalle/RelatedProduct.module.css";
import Img from 'react-image';
import { ScaleLoader } from 'react-spinners';
import notFound from 'assets/nodisponible.png';
import { Card, } from 'reactstrap';
import { MdCheck } from "react-icons/md";


const Producto = (props) => {

    let stockDisponible = 0;
    
    if(!props.producto.CodigoColeccion.includes('F')){
        stockDisponible = props.producto.fisicaDisponible.reduce((a,b)=>(a+b.Cantidad),0);
    }
    
    useEffect(() => {

        // eslint-disable-next-line
    }, []);

    let selectableClassName = styles.selectable;

    if (props.current) {
        selectableClassName += " " + styles.selected
    }

    return (
        //className="col-xl-3 col-md-6 col-lg-4 col-sm-6 col-12"
        <div style={{ maxWidth: '400px' }} id={props.producto.Primero ? props.producto.Edad.Codigo : ""}>
            <Card
                onClick={props.Click}
                className={styles.card}
            >
                <div className={selectableClassName}>
                    <Img
                        className="card-img-right m-auto"
                        src={[props.producto.ListaImagenes[0]?props.producto.ListaImagenes[0].FotografiaProducto:null, notFound]}
                        style={{ width: 'auto', height: 150 }}
                        loader={
                            <ScaleLoader
                                css={{ height: '30px', bottom: '5px', position: 'relative', transform: 'scale(0.8)' }}
                                size={'20px'}
                                color={'#000'}
                                loading={true} />
                        }
                    />

                    <div className="d-flex flex-column" style={{ padding: 10, paddingBottom: 5, height: 80 }}>
                        <div className="row">
                            <div style={{ fontWeight: "400", fontSize: 10, textAlign: 'left', }} >
                                {props.producto.NombreProducto}
                            </div>
                        </div>
                        <div className="row">
                            <div style={{ fontWeight: "300", fontSize: 10, textAlign: 'left', marginTop: 2 }} >
                                {props.producto.ProductoId}
                            </div>
                        </div>
                        {(stockDisponible>0)&& <div className="row">
                            <div style={{ fontWeight: "300", fontSize: 10, textAlign: 'left', marginTop: 2 }} >
                                {"Disponible: "+stockDisponible}
                            </div>
                        </div>}
                        <div className="align-items-end d-flex flex-grow-1">
                            <div className="row w-100">
                                <div className="col-12 p-0">
                                    <div className="text-right" style={{ fontSize: 10, }}>
                                        <span>{props.index + 1}</span>
                                        <span style={{ color: '#a7a4a4', }}> / </span>
                                        <span style={{ color: '#a7a4a4', }}>{props.length}</span>
                                    </div>
                                </div>
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