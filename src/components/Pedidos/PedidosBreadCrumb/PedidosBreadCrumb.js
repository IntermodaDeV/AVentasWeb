import React from 'react';
import styles from 'components/Pedidos/PedidosBreadCrumb/PedidosBreadCrumb.module.css';
import { Route, Switch } from 'react-router-dom';
import NavigationBreadcrumb from 'components/Pedidos/NavigationBreadcrumb/NavigationBreadcrumb';
import {
    FaSignOutAlt,
    FaShoppingCart,
    FaExclamationCircle
} from 'react-icons/fa';
import {
    Button,
    Col,
    Container,
    Row,
} from 'reactstrap';
import {
    Dropdown,
} from 'element-react';
import moment from "moment";
import 'moment/locale/es';
moment.locale('es');

const PedidosBreadCrumb = (props) => {
    return (
        <Switch>
            <Route path={props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion/:CodigoProducto'} component={(routeProps) => (
                <Container fluid={true}>


                    <Row >
                        <Col style={{ textAlign: 'left' }}>
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Linea") }, Titulo: props.LineaSeleccionada.Linea },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/TipoPedido") }, Titulo: props.TipoPedido.TipoPedido },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones") }, Titulo: 'Colecciones' },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones/" + props.coleccion.ColeccionTipo + "/" + props.coleccion.CodigoColeccion) }, Titulo: props.coleccion.Nombre },
                                    { Titulo: props.producto.NombreProducto }
                                ]}
                            />
                        </Col>
                        <Col style={{ textAlign: 'right' }}>
                            <Dropdown
                                onCommand={props.cancelarPedido}
                                menu={(
                                    <Dropdown.Menu>
                                        <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                    </Dropdown.Menu>
                                )}
                            >
                                <span >
                                    <FaSignOutAlt className={styles.FaSignOutAlt} />
                                </span>
                            </Dropdown>
                            {"Cliente: "}
                            {props.cliente.Nombre}
                            <Button outline color="primary" onClick={props.toggle} style={{ marginBottom: '1rem', marginLeft: '1rem' }}><FaShoppingCart /></Button>
                        </Col>
                    </Row>
                </Container>
            )} />
            <Route path={props.match.url + '/MatrizResumen'} component={(routeProps) => (
                <Container fluid={true} className={"mb-2"} >


                    <Row >
                        <Col className="text-left">
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Linea") }, Titulo: props.LineaSeleccionada.Linea },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/TipoPedido") }, Titulo: props.TipoPedido.TipoPedido },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones") }, Titulo: 'Colecciones' },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones/" + props.coleccion.ColeccionTipo + "/" + props.coleccion.CodigoColeccion) }, Titulo: props.coleccion.Nombre },
                                    { Titulo: 'Matriz Resumen' }
                                ]}
                            />
                        </Col>
                        <Col style={{ textAlign: 'right' }}>
                            <Dropdown
                                onCommand={props.cancelarPedido}
                                menu={(
                                    <Dropdown.Menu>
                                        <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                    </Dropdown.Menu>
                                )}
                            >
                                <span >
                                    <FaSignOutAlt className={styles.FaSignOutAlt} />
                                </span>
                            </Dropdown>
                            {"Cliente: "}
                            {props.cliente.Nombre}
                        </Col>
                    </Row>
                </Container>
            )} />
            <Route path={props.match.url + '/ResumenPedido'} component={(routeProps) => (
                <Container fluid={true}>


                    <Row >
                        <Col style={{ textAlign: 'left' }}>
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Linea") }, Titulo: props.LineaSeleccionada.Linea },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/TipoPedido") }, Titulo: props.TipoPedido.TipoPedido },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones") }, Titulo: 'Colecciones' },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones/" + props.coleccion.ColeccionTipo + "/" + props.coleccion.CodigoColeccion) }, Titulo: props.coleccion.Nombre },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/MatrizResumen") }, Titulo: 'Matriz Resumen' },
                                    { Titulo: 'Resumen Pedido' }
                                ]}
                            />
                        </Col>
                        <Col style={{ textAlign: 'right' }}>
                            <Dropdown
                                onCommand={props.cancelarPedido}
                                menu={(
                                    <Dropdown.Menu>
                                        <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                    </Dropdown.Menu>
                                )}
                            >
                                <span >
                                    <FaSignOutAlt className={styles.FaSignOutAlt} />
                                </span>
                            </Dropdown>
                            {"Cliente: "}
                            {props.cliente.Nombre}
                        </Col>
                    </Row>
                </Container>
            )} />
            <Route path={props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion'} exact render={(routeProps) => {
                return (
                    <Container fluid={true}>
                        <div className="row">
                            <div className="col" style={{ textAlign: 'left' }}>
                                <NavigationBreadcrumb
                                    BreadcrumbItems={[
                                        { Click: () => { props.clickBreadCrumb("/Pedidos/Linea") }, Titulo: props.LineaSeleccionada.Linea },
                                        { Click: () => { props.clickBreadCrumb("/Pedidos/TipoPedido") }, Titulo: props.TipoPedido.TipoPedido },
                                        { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones") }, Titulo: 'Colecciones' },
                                        { Titulo: props.coleccion.Nombre }
                                    ]}
                                />

                                <div className={"mb-2"}>
                                    <FaExclamationCircle className={"mr-1 " + styles.FaExclamationCircle} />
                                    <div className={styles.FechaEntrega}>
                                        {'Fecha Maxima de entrega: ' + moment(props.coleccion.EntregaFinal).format('DD/MM/YYYY')}
                                    </div>
                                </div>
                            </div>

                            <div className={'col-lg-6 col-12 ' + styles.ColBreadCrumb}>
                                <Dropdown
                                    onCommand={props.cancelarPedido}
                                    menu={(
                                        <Dropdown.Menu>
                                            <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                        </Dropdown.Menu>
                                    )}
                                >
                                    <span >
                                        <FaSignOutAlt className={styles.FaSignOutAlt} />
                                    </span>
                                </Dropdown>
                                {"Cliente: "}
                                {props.cliente.Nombre}
                            </div>
                        </div>
                    </Container>
                )
            }} />
            <Route path={props.match.url + '/Colecciones/:TipoColeccion'} exact component={(routeProps) => (
                <Container fluid={true}>
                    <Row >
                        <Col sm={6} md={4}>
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Linea") }, Titulo: props.LineaSeleccionada.Linea },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/TipoPedido") }, Titulo: props.TipoPedido.TipoPedido },
                                    { Titulo: 'Colecciones' }
                                ]}
                            />
                        </Col>
                        <Col sm={0} md={4}>
                        </Col>
                        <Col className={styles.ColBreadCrumb}>
                            <Dropdown
                                onCommand={props.cancelarPedido}
                                menu={(
                                    <Dropdown.Menu>
                                        <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                    </Dropdown.Menu>
                                )}
                            >
                                <span >
                                    <FaSignOutAlt className={styles.FaSignOutAlt} />
                                </span>
                            </Dropdown>
                            {"Cliente: "}
                            {props.cliente.Nombre}
                        </Col>
                    </Row>
                </Container>
            )} />
        </Switch>
    );
}


export default PedidosBreadCrumb;