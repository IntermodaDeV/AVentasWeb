import React, { useState, useEffect } from 'react';
import Loader from 'components/Global/Loader';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Button } from "@material-ui/core";
import DetalleRecibo from 'components/ListadoRecibos/DetalleRecibo';
import { PrintOutlined } from '@material-ui/icons';
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import Listado from 'components/ListadoRecibos/Listado';
import LoadingModal from './../../components/Global/LoadingModal';
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import {IsAllow} from 'components/Seguridad/Permisos';
import { useSelector } from 'react-redux';
moment.locale('es');

const ListaRecibos = (props) => {
    const urlApi = APIURL;

    const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
    const [recibos, setRecibos] = useState([]);
    const [recibo, setRecibo] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [DialogRecibo, setDialogRecibo] = useState(null);
    const [isLoading,setLoading] = useState(false);
    const [Asesores, setAsesores] = useState([]);
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const AsesoresUsuario = useSelector(e=>e.Permisos[0].AsesoresUsuario);
    useEffect(() => {
        if(!IsAllow("/lista-recibos"))
        {
            props.history.push('/home');
        }
            cargarRecibos();
        let Asesores = [];
            AsesoresUsuario.map((Ase) => {
            let Valores = { key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }
            Asesores.push(Valores);
            return true;
        })
        setAsesores(Asesores)
        setAsesorSelected(AsesoresUsuario[0].Usuario)
        //cargarClientes();
        // eslint-disable-next-line
    }, []);
   
    const cambiarRecibo = (recibo) => {
         setRecibo(recibo);
     }

    const cargarRecibos = async () => {
        setLoading(true);
        fetch(urlApi + "/api/Recibo", {
            headers: {
                'Authorization':
                    'Bearer ' + localStorage.getItem('token')

            }
        }).then(res => {
                if (res.status === 401) {
                    localStorage.setItem('token', '');
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json()
                        .then(
                            (result) => {
                                setRecibos(result);
                                setIsLoaded(true);
                                setLoading(false);
                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                setError(error);
                                setIsLoaded(true);
                            }
                        )
                }
            })
    }



    const handleFechaInicio = (fecha) => {

        var date = moment(fecha).toDate();

        var fech = moment(fecha).toDate();
        fech.setMonth(date.getMonth() + 1);

        setStartDate(date);
        setEndDate(fech);
    }

    const handleFechaFin = (fecha) => {
        var date = moment(fecha).toDate();

        const diffTime = new Date(date) - new Date(startDate);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            setEndDate(date);
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
            fech.setDate(startDate.getDate() + 6);
            setEndDate(fech);
        }
    }

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
     }
    const DataRecibos = () => {
        let DataRecibos = [];

        if (recibos != null) {

        }

        recibos.filter(r => r.Asesor === AsesorSelected).map(recib => {

            let fechaIni = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            let fechaFin = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            fechaFin.setDate(fechaFin.getDate() + 1);

            if (moment(fechaIni) < moment(recib.Fecha) && moment(recib.Fecha) < moment(fechaFin)) {
                let data =
                {
                    NumeroRecibo: recib.NumeroRecibo,
                    CodigoCliente: recib.CodigoCliente,
                    NombreCliente : recib.Cliente.Nombre,
                    Fecha: moment(recib.Fecha).format('DD/MM/YYYY') !== "Invalid date" ? moment(recib.Fecha).format('DD/MM/YYYY') : "",
                    IdTipoPago: recib.TipoPago.Descripcion,
                    Referencia: recib.Referencia,
                    FechaCheque: moment(recib.Fecha).format('DD/MM/YYYY') !== "Invalid date" ? moment(recib.Fecha).format('DD/MM/YYYY') : "",
                    IdBanco: recib.DescripcionBanco,
                    Valor: recib.Valor,
                    IdMoneda: recib.IdMoneda,
                    Sincronizado: recib.Sincronizado?"Si":"No",
                    CodigoAsesor: recib.CodigoAsesor,
                    IdFactura: recib.DetalleRecibo[0].Factura,
                    Descuento: recib.Descuento,
                    Acciones:
                        <div>

                             <span className="mr-1">
                                <Button className='my-1' variant="outlined" onClick={() => cambiarRecibo(recib)} size="small" color={"primary"}>Detalle</Button>
                            </span> 

                            <span className="ml-1">
                                <Button className='my-1' variant="outlined" onClick={() => showPrint(recib)} size="small" color={"primary"}>
                                    <PrintOutlined />
                                </Button>
                            </span >
                        </div>
                }

                DataRecibos.push(data);
            }
            return false;

        });
        
        DataRecibos.sort((a,b) => (a.NumeroRecibo > b.NumeroRecibo) ? -1 : ((b.NumeroRecibo > a.NumeroRecibo) ? 1 : 0));

        return DataRecibos;
       
    }

    const showPrint = (recibo) => {
        setDialogRecibo(recibo);
        setShowDialog(true);
    }

    const hidePrint = () => {
        setShowDialog(false);
        setDialogRecibo(null);
    }


    const RegresarListaRecibos = () => {
        setRecibo(null);
    }

    if (!isLoaded) {
        return <Loader interval={1800} />;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (recibo != null) {
        
        return (
            <DetalleRecibo
                recibo={recibo}
                RegresarListaRecibos={RegresarListaRecibos} />
        )
    } else {
        return (
            <>
            <Listado
                startDate={startDate}
                endDate={endDate}
                handleFechaInicio={handleFechaInicio}
                handleFechaFin={handleFechaFin}
                DataRecibos={DataRecibos}
                HeadersListaRecibos={HeadersListaRecibos}
                DatatableOptions={DatatableOptions}
                showDialog={showDialog}
                hidePrint={hidePrint}
                DialogRecibo={DialogRecibo}
                Asesores = {Asesores}
                AsesorSelected = {AsesorSelected}
                handleOnChangeAsesor = {handleOnChangeAsesor}
            />
            <LoadingModal title={'recibos'} Open={isLoading}/>
            </>
        );
    }

}


const HeadersListaRecibos = [
    {
        name: "NumeroRecibo",
        label: "Numero Recibo",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Fecha",
        label: "Fecha",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "CodigoCliente",
        label: "Codigo Cliente",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "NombreCliente",
        label: "Nombre Cliente",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdTipoPago",
        label: "TipoPago",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Referencia",
        label: "Referencia",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "FechaCheque",
        label: "Fecha Cheque",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdBanco",
        label: "Banco",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Valor",
        label: "Valor",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdMoneda",
        label: "Moneda",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Sincronizado",
        label: "Sincronizado",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "CodigoAsesor",
        label: "Codigo Asesor",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdFactura",
        label: "Factura",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Descuento",
        label: "Descuento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Acciones",
        label: "Acciones",
        options: {
            filter: false,
            sort: false,
        }
    },
];

const DatatableOptions = {
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
    print: false,
    download: false,
    selectableRows: 'none',
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
    textLabels: {
        body: {
            noMatch: "No se han encontrado recibos",
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


export default ListaRecibos;
