import React, { useEffect, useState } from 'react';
import { DatePicker } from "@material-ui/pickers";
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
// import { EstadisticaVisitaTable } from './EstadisticaVisitaTable';
import FunnelChart from 'components/EstadisticaVisita/FunnelChart';
import PieChart from 'components/EstadisticaVisita/PieChart';
import Barchart from 'components/EstadisticaVisita/BarChart';
import moment from 'moment';
import { Dropdown } from "semantic-ui-react";
import {APIURL} from 'utils/Enviroment';
import {IsAllow} from 'components/Seguridad/Permisos';
import 'moment/locale/es';
import {
    Button
    // Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,  Select, MenuItem 
} from '@material-ui/core';
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import {
    FaUserCheck,
    FaCheckDouble,
    FaTimesCircle, FaUserFriends,
    FaClipboardCheck,
    FaUserTimes
} from "react-icons/fa";
import CustomFooter from 'components/Layout/CustomFooter';

moment.locale('es')
const urlApi = APIURL
const columns = [

    {
        name: 'CodigoAsesor',
        label: 'Codigo',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'Nombre',
        label: 'Nombre',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'CantidadVisitas',
        label: 'Cantidad Visitas',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'Atendidas',
        label: 'Atendidas',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'Efectivas',
        label: 'Efectivas',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'Productivas',
        label: 'Productivas',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'ClienteCancelo',
        label: 'Canceladas',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'NoAtendidas',
        label: 'No Atendidas',
        options: {
            filter: true,
            sort: true
        }
    },
    
    {
        name: 'Pedidos',
        label: 'Cantidad Pedidos',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'ValorPedidos',
        label: 'Valor Pedidos',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'Recibos',
        label: 'Cantidad Recibos',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'ValorRecibos',
        label: 'Valor Recibos',
        options: {
            filter: true,
            sort: true
        }
    },

]
const EstadisticaVisita = (props) => {
    
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setFechaFin] = useState(new Date((new Date()).valueOf() + (1000 * 60 * 60 * 24) * 6 + 1));
    const [estadisticasVisita, setEstadisticasVisita] = useState([]);
    const [Usuarios, setUsuarios] = useState([]);
    const [Selected, setSelected] = useState(null);
    useEffect(() => {
        if(!IsAllow("/estadistica-visita"))
        {
            props.history.push('/home');
        }
        CargarDatos()

        // eslint-disable-next-line
    }, []);

    const CargarDatos = () => {
        Promise.all([cargarEstadisticaVisita(fechaInicio, fechaFin)]).then(values => {
            setEstadisticasVisita(values[0]);
            setOptions(values[0]);
        });
    }

    const setOptions = (values) => {
        let users = [];
        values.forEach(el => {
            var cliente = { key: el.CodigoAsesor, value: JSON.stringify(el), text: el.Nombre }
            users.push(cliente);
        });

        setUsuarios(users);
    }


    const options = {
        responsive: "scrollMaxHeight",
        selectableRows: 'none',
        print: false,
        download: false,
        selectableRowsOnClick: true,
        customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage) => (
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={count}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={(_, page) => changePage(page)}
                  onChangeRowsPerPage={event => changeRowsPerPage(event.target.value)}
                  rowsPerPageOptions={[10, 15, 100]}
                  ActionsComponent={CustomFooter}
                  labelRowsPerPage="Filas por página:"
                />
              </TableRow>
            </TableFooter>
          ),
        // rowsSelected: selectedRowsIndex,
        textLabels: {
            body: {
                noMatch: "No se han encontrado pedidos",
                toolTip: "Ordenar",
            },
            pagination: {
                next: "Siguiente",
                previous: "Anterior",
                rowsPerPage: "Filas por página:",
                displayRows: "de",
            },
            toolbar: {
                search: "Buscar",
                downloadCsv: "Descargar CSV",
                print: "Imprimir",
                viewColumns: "Ver Columnas",
                filterTable: "Filtrar Tabla",
            },
            filter: {
                all: "Todos",
                title: "Filtros",
                reset: "Quitar",
            },
            viewColumns: {
                title: "Mostrar Columnas",
                titleAria: "Mostrar/Esconder Columnas",
            },
            selectedRows: {
                text: "Fila(s) seleccionadas",
                delete: "Borrar",
                deleteAria: "Borrar Filas Seleccionadas",
            }
        },
        // onRowsSelect: (currentRowsSelected, allRowsSelected) => {
        //   setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
        // }
    }

    const handleOnChange = (value) => {
        // var val = JSON.parse(value);

        setSelected(value);
    }

    const handleFechaInicio = (date) => {
        setFechaInicio(date);
    }

    const handleFechaFin = (date) => {
        setFechaFin(date);
    }


    let data = [];
    let VisitasProductivas = estadisticasVisita.reduce((acc, cur) => { return acc + cur.Productivas }, 0);
    let VisitasEfectivas = estadisticasVisita.reduce((acc, cur) => { return acc + cur.Efectivas }, 0);
    let VisitasAtendidas = estadisticasVisita.reduce((acc, cur) => { return acc + cur.Atendidas }, 0);

    estadisticasVisita.forEach(estVis => {
        data.push({
            CodigoAsesor: estVis.CodigoAsesor,
            Nombre: estVis.Nombre,
            //Usuario: estVis.Usuario,
            CantidadVisitas: estVis.CantidadVisitas,
            Atendidas: estVis.Atendidas,
            // PorcentajeEjecucion: estVis.PorcentajeEjecucion,
            ClienteCancelo: estVis.ClienteCancelo,
            Efectivas: estVis.Efectivas,
            Productivas:estVis.Productivas,
            NoAtendidas:estVis.NoAtendidas,
            Pedidos : estVis.Pedidos,
            Recibos: estVis.Recibos,
            ValorPedidos : numberWithCommas(Number(estVis.TotalPedidos)),
            ValorRecibos : numberWithCommas(Number(estVis.TotalRecibos))
        });
    });
    return (
        <div className="col-12">
            <div className="row">
                <div className="col-12 mb-3">
                    <h3 className="font-weight-light">
                        Estadística de Visita
                    </h3>
                </div>
                <div className='col-lg-2 col-sm-4 col-12'>
                    <DatePicker
                        disableToolbar
                        className={"w-100"}
                        autoOk
                        label={"Fecha Inicio"}
                        variant="inline"
                        format={"DD/MM/YYYY"}
                        //disablePast
                        value={fechaInicio}
                        onChange={(date) => handleFechaInicio(date)}
                    />

                </div>
                <div className='col-lg-2 col-sm-4 col-12'>
                    <DatePicker
                        disableToolbar
                        className={"w-100"}
                        autoOk
                        minDate={fechaInicio}
                        minDateMessage={"Fecha Inválida"}
                        label={"Fecha Fin"}
                        variant="inline"
                        // minDate={this.state.startDate}
                        format={"DD/MM/YYYY"}
                        value={fechaFin}
                        onChange={(date) => handleFechaFin(date)}
                    />
                </div>
                <div className="col-lg-2 col-sm-4 col-12" style={{ paddingTop: 15 }}>

                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => CargarDatos()}>Obtener
                        {/* {this.state.GuardarAsignacion ?
                                                <ScaleLoader
                                                    css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                                                    size={'20px'}
                                                    color={'#3f51b5'}
                                                    loading={this.state.GuardarAsignacion} /> : 'Asignar'
                                            } */}
                    </Button>
                </div>

            </div>

            <hr></hr>
            <div className="row">
                <div className="col-xl-2 col-md-6 mb-4" >
                    <div className="card shadow h-100 py-1" style={{ borderColor: 'darkblue' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-1">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Visitas Programadas</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{estadisticasVisita.reduce((acc, cur) => { return acc + cur.CantidadVisitas }, 0)}</div>
                                </div>
                                <div className="col-auto">
                                    {/* <i class="fas fa-calendar fa-2x text-gray-300"></i> */}
                                    <FaUserFriends size={"25px"} style={{ color: 'darkblue' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-md-6 mb-4">
                    <div className="card  shadow h-100 py-2" style={{ borderColor: 'green' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Visitas Atendidas</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{estadisticasVisita.reduce((acc, cur) => { return acc + cur.Atendidas }, 0)}</div>
                                </div>
                                <div className="col-auto">
                                    {/* <i class="fas fa-calendar fa-2x text-gray-300"></i> */}
                                    <FaUserCheck size={"25px"} style={{ color: 'green' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-md-6 mb-4">
                    <div className="card shadow h-100 py-2" style={{ borderColor: 'darkorange' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Visitas Efectivas</div>
                                   <div className="h5 mb-0 font-weight-bold text-gray-800">{VisitasEfectivas}</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{VisitasAtendidas > 0 ? ((VisitasEfectivas/VisitasAtendidas) * 100).toFixed(0) + "%": 0 + "%"}</div>
                                </div>
                                <div className="col-auto">
                                    <FaCheckDouble size={"25px"} style={{ color: 'darkorange' }} />
                                    {/* <i class="fas fa-calendar fa-2x text-gray-300"></i> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-md-6 mb-4">
                    <div className="card shadow h-100 py-2" style={{ borderColor: '#73628a' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Visitas Productivas</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{VisitasProductivas}</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{VisitasAtendidas > 0 ? ((VisitasProductivas/VisitasAtendidas) * 100).toFixed(0) + "%": 0 + "%"}</div>
                                </div>
                                <div className="col-auto">
                                    <FaClipboardCheck size={"25px"} style={{ color: '#73628a' }} />
                                    {/* <iFaTimesCircle class="fas fa-calendar fa-2x text-gray-300"></i> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-md-6 mb-4">
                    <div className="card  shadow h-100 py-2" style={{ borderColor: 'red' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Visitas Canceladas</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{estadisticasVisita.reduce((acc, cur) => { return acc + cur.ClienteCancelo }, 0)}</div>
                                </div>
                                <div className="col-auto">
                                    {/* <i class="fas fa-calendar fa-2x text-gray-300"></i> */}
                                    <FaTimesCircle size={"25px"} style={{ color: 'red' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-2 col-md-6 mb-4">
                    <div className="card  shadow h-100 py-2" style={{ borderColor: '#1EA4B7' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Visitas No Atendidas</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{estadisticasVisita.reduce((acc, cur) => { return acc + cur.NoAtendidas }, 0)}</div>
                                </div>
                                <div className="col-auto">
                                    {/* <i class="fas fa-calendar fa-2x text-gray-300"></i> */}
                                    <FaUserTimes size={"25px"} style={{ color: '#1EA4B7' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">                         
                <div className="col-lg-6 my-2 col-12 order-lg-first order-last">
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <Barchart/>
                        <MUIDataTable
                            title={'Estadistica Visita'}
                            data={data}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>

                <div className="col-lg-6 my-2 col-12  order-lg-last order-first">
                    <div className="card shadow h-100 py-2">
                        <div className="row my-2">
                            <div className="col-12">
                                <h5 className="card-title">
                                    Clientes Visitados
                                </h5>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 my-2">
                                <Dropdown
                                    placeholder="Asesor"
                                    fluid
                                    search
                                    selection
                                    onChange={(e, { value }) => handleOnChange(value)}
                                    options={Usuarios}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    value={Selected}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <FunnelChart Selected={Selected} Users={estadisticasVisita}/>
                            <PieChart Selected={Selected} Users={estadisticasVisita}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
const cargarEstadisticaVisita = (fechaInicio, fechaFin) => {
    var inicio = moment(fechaInicio).format();
    var fin = moment(fechaFin).format();
    
    return new Promise((resolve, reject) => {
        fetch(urlApi + `/api/EstadisticaVisita?FechaInicio=${inicio}&FechaFin=${fin}`, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '')
                window.location.reload()
            }
            if (res.status === 200) {
                res.json().then(
                    result => {
                        resolve(result)
                    },

                    error => {
                        reject({
                            error
                        })
                    }
                )
            }
        })
    })
};

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScrollMaxHeight: {
                maxHeight: 'unset !important',
            }
        },
    }
});
const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
export default EstadisticaVisita;