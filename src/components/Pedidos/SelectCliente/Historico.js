import React, { useState } from 'react'
import styles from 'components/Pedidos/SelectCliente/Historico.module.css';
import { DatePicker } from "@material-ui/pickers";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import MUIDataTable from "mui-datatables";
import { ClipLoader } from 'react-spinners';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from "moment";
moment.locale('es');

const Historico = (props) => {
    let fin = new moment().toDate();
    let ini = new moment(fin).add(-6, 'days').toDate();
    const [fechaInicio, setFechaInicio] = useState(ini);
    const [fechaFin, setFechaFin] = useState(fin);
    const [showTable, setShowTable] = useState(false);

    const handleFechaInicio = (fecha) => {
        unloadTable();
        var date = moment(fecha).toDate();

        var fech = moment(fecha).toDate();
        fech.setDate(date.getDate() + 6);

        setFechaInicio(date);
        setFechaFin(fech);
        loadTable();
    }

    const handleFechaFin = (fecha) => {
        unloadTable();
        var date = moment(fecha).toDate();

        const diffTime = new Date(date) - new Date(fechaInicio);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays > 0) {
            setFechaFin(date);
        }
        else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });

            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
            })
            var fech = new Date();
            fech.setDate(fechaInicio.getDate() + 6);

            setFechaFin(fech);
        }
        loadTable();

    }

    const loadTable = () => {
        setTimeout(() => {
            setShowTable(true);
        }, 3000)
    }
    const unloadTable = () => {
        setShowTable(false);
    }

    return (
        <div className={"m-3 row"}>
            <div className={"col-12 " + styles.Text}>
                <h4 className={styles.Title}>
                    Histórico {props.nombre.toLowerCase()}
                </h4>
            </div>
            <div className={"col-12 my-2"}>
                <div className={"row"}>
                    <div className={"col"}>
                        <h6>Fecha Inicio</h6>
                        <DatePicker
                            disableToolbar
                            autoOk
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            disableFuture
                            value={fechaInicio}
                            onChange={(date) => handleFechaInicio(date)}
                        />
                    </div>
                    <div className={"col"}>

                        <h6>Fecha Fin</h6>
                        <DatePicker
                            disableToolbar
                            autoOk
                            variant="inline"
                            minDate={fechaInicio}

                            format={"DD/MM/YYYY"}
                            value={fechaFin}
                            onChange={(date) => handleFechaFin(date)}
                        />
                    </div>
                </div>
            </div>
            <div className={"col-12 mt-3"}>
                {
                    showTable ?
                        <div className={styles.TableDialog}>
                            <MuiThemeProvider theme={getMuiTheme()}>
                                <MUIDataTable
                                    title={"Detalle del Pedido"}
                                    data={data}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>

                        :
                        <div style={{ marginTop: 15, textAlign: 'center' }}>
                            <ClipLoader
                                size={40}
                                color={'#31547C'}
                                loading={!showTable} />
                        </div>
                }
            </div>

        </div>
    )
}

const columns = [
    {
        name: "Name",
        options: {
            filter: true,
        }
    },
    {
        name: "Title",
        options: {
            filter: true,
        }
    },
    {
        name: "Location",
        options: {
            filter: false,
        }
    },
    {
        name: "Age",
        options: {
            filter: true,
        }
    },
    {
        name: "Salary",
        options: {
            filter: true,
            sort: false
        }
    }
];


const data = [
    ["Gabby George", "Business Analyst", "Minneapolis", 30, "$100,000"],
    ["Aiden Lloyd", "Business Consultant", "Dallas", 55, "$200,000"],
    ["Jaden Collins", "Attorney", "Santa Ana", 27, "$500,000"],
    ["Franky Rees", "Business Analyst", "St. Petersburg", 22, "$50,000"],
    ["Aaren Rose", "Business Consultant", "Toledo", 28, "$75,000"],
    ["Blake Duncan", "Business Management Analyst", "San Diego", 65, "$94,000"],
    ["Frankie Parry", "Agency Legal Counsel", "Jacksonville", 71, "$210,000"],
    ["Lane Wilson", "Commercial Specialist", "Omaha", 19, "$65,000"],
    ["Robin Duncan", "Business Analyst", "Los Angeles", 20, "$77,000"],
    ["Mel Brooks", "Business Consultant", "Oklahoma City", 37, "$135,000"],
    ["Harper White", "Attorney", "Pittsburgh", 52, "$420,000"],
    ["Kris Humphrey", "Agency Legal Counsel", "Laredo", 30, "$150,000"],
    ["Frankie Long", "Industrial Analyst", "Austin", 31, "$170,000"],
    ["Brynn Robbins", "Business Analyst", "Norfolk", 22, "$90,000"],
    ["Justice Mann", "Business Consultant", "Chicago", 24, "$133,000"],
    ["Addison Navarro", "Business Management Analyst", "New York", 50, "$295,000"],
    ["Jesse Welch", "Agency Legal Counsel", "Seattle", 28, "$200,000"],
    ["Eli Mejia", "Commercial Specialist", "Long Beach", 65, "$400,000"],
    ["Gene Leblanc", "Industrial Analyst", "Hartford", 34, "$110,000"],
    ["Danny Leon", "Computer Scientist", "Newark", 60, "$220,000"],
    ["Lane Lee", "Corporate Counselor", "Cincinnati", 52, "$180,000"],
    ["Jesse Hall", "Business Analyst", "Baltimore", 44, "$99,000"],
    ["Danni Hudson", "Agency Legal Counsel", "Tampa", 37, "$90,000"],
    ["Terry Macdonald", "Commercial Specialist", "Miami", 39, "$140,000"],
    ["Justice Mccarthy", "Attorney", "Tucson", 26, "$330,000"],
    ["Silver Carey", "Computer Scientist", "Memphis", 47, "$250,000"],
    ["Franky Miles", "Industrial Analyst", "Buffalo", 49, "$190,000"],
    ["Glen Nixon", "Corporate Counselor", "Arlington", 44, "$80,000"],
    ["Gabby Strickland", "Business Process Consultant", "Scottsdale", 26, "$45,000"],
    ["Mason Ray", "Computer Scientist", "San Francisco", 39, "$142,000"]
];

const options = {
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
    print: false,
    download: false,
    expandableRows: true,
    expandableRowsOnClick: true,
    selectableRows: 'none',
    renderExpandableRow: (rowData, rowMeta) => {
        const colSpan = rowData.length + 1;
        return (
            <tr>
                <td colSpan={colSpan} style={{ textAlign: 'center' }}>
                    Custom expandable row option. Data: {JSON.stringify(rowData)}
                </td>
            </tr>
        );
    },
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
        },
    }
};

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScroll: {
                maxHeight: "67vh"
            }
        },
        MUIDataTableBodyRow: {
            root: {
                '&:nth-child(odd)': {
                    backgroundColor: '#f8f8f8'
                }
            }
        },
    }
});

export default Historico;