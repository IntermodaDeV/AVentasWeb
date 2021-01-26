import React from 'react';
import ReactExport from 'react-export-excel';
import Button from '@material-ui/core/Button';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2/dist/sweetalert2.js';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export const DescargarCuentaExcel = props => {
    const cuentaCorriente = useSelector(e => e.CuentaImprimir);

    const handleClickDownload = () => {
        Swal.fire({
            title: "¡Documento Descargado!",
            text: "Revise su panel de notificaciones o su carpeta de descargas.",
            type: 'success',
            confirmButtonText: 'Ok',
        });
    }

    return (
        <ExcelFile filename={`Excel-${props.cliente}`} element={<Button onClick={handleClickDownload} variant="contained" color="primary" style={{ marginBottom: '10px', marginLeft: '10px' }}>Generar Excel</Button>}>
            <ExcelSheet data={cuentaCorriente} name="Pruebas">
                <ExcelColumn label="Documento" value="Tipo" />
                <ExcelColumn label="Numero" value="Factura" />
                <ExcelColumn label="Fecha" value="FechaFactura" />
                <ExcelColumn label="Vencimiento" value="FechaVencimiento" />
                <ExcelColumn label="Dias" value="Dias" />
                <ExcelColumn label="Valor" value="Valor" />
                <ExcelColumn label="Saldo" value="Saldo" />
                <ExcelColumn label="Descuento" value="FechaMaxDescuento" />
                <ExcelColumn label="Dias" value="DiasV" />
                <ExcelColumn label="Descuento" value="Descuento" />
                <ExcelColumn label="A Pagar" value="APagar" />
            </ExcelSheet>
        </ExcelFile>
    );
}
