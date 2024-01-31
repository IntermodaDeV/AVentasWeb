import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from "semantic-ui-react";
import axios from 'axios';
import {
    Card,
    CardBody,
    CardHeader,
} from 'reactstrap';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { APIURL } from 'utils/Enviroment';
import { BaseColorImpuestoTable } from './components/BaseColorImpuestoTable';

export const BaseColorImpuesto = (props) => {
    const [comibinacionId, setCombinacionId] = useState();
    const [openModal, setOpenModal] = useState(false);
    const [empresa, setEmpresa] = useState('');
    const [codigobase, setCodigobase] = useState('');
    const [color, setColor] = useState('');
    const [impuesto, setImpuesto] = useState(0);
    const [combinaciones, setCombinaciones] = useState([]);
    const [colores, setColores] = useState([]);
    const [bases, setBases] = useState([]);
    const empresas = useSelector(e => e.Empresas);

    const limpiarCampos = () => {
        setCodigobase('');
        setColor('');
        setImpuesto(0);
        setEmpresa('');
        setCombinacionId();
    }

    const crearCombinacion = async () => {
        try {
            if (codigobase === "" || color === "" || empresa === "") {
                alert("Favor llenar los campos de base y color.");
                return;
            }

            await axios.post(`${APIURL}/api/basecolorimpuesto`, { codigobase, color, impuesto, empresa, usuario: localStorage.getItem('codigo') });
            alert("Combinación creada con exito");
            await obtenerCombinaciones();
            limpiarCampos();
        } catch (e) {

        }
    }

    const modificarCombinacion = async () => {
        try {
            await axios.put(`${APIURL}/api/basecolorimpuesto/${comibinacionId}`, { codigobase, color, impuesto, empresa, usuario: localStorage.getItem('codigo') });
            alert("Combinación modificada con exito");
            await obtenerCombinaciones();
            limpiarCampos();
            setOpenModal(false);
        } catch (e) {

        }
    }

    const cambiarEstadoCombinacion = async (id) => {
        try {
            await axios.patch(`${APIURL}/api/basecolorimpuesto/estado/${id}`);
            await obtenerCombinaciones();
        } catch (err) {

        }
    }

    const obtenerCombinaciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/basecolorimpuesto/admin`);
            setCombinaciones(request.data);
        } catch (e) {

        }
    }

    const obtenerColores = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/basecolorimpuesto/colores`);
            setColores(request.data);
        } catch (e) {

        }
    }

    const obtenerBases = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/basecolorimpuesto/bases`);
            setBases(request.data);
        } catch (e) {

        }
    }

    const handleModalEdit = (combinacion) => {
        setOpenModal(true);
        setEmpresa(combinacion.empresa);
        setCodigobase(combinacion.codigobase);
        setColor(combinacion.color);
        setImpuesto(combinacion.impuesto);
        setCombinacionId(combinacion.id);
    }

    const closeModal = () => {
        setOpenModal(false);
        limpiarCampos();
    }

    useEffect(() => {
        obtenerCombinaciones();
        obtenerColores();
        obtenerBases();
    }, [])

    return (
        <div className="container-fluid">
            <Dialog
                open={openModal}
                onClose={() => closeModal()}
            >
                <DialogTitle id="scroll-dialog-title">
                    <h2>Modificar Combinación</h2>
                </DialogTitle>
                <DialogContent>
                    <Dropdown
                        style={{ display: "block", zIndex: 5, margin: 10 }}
                        placeholder="Seleccione empresa"
                        search
                        selection
                        value={empresa}
                        onChange={(e, { value }) => { setEmpresa(value) }}
                        options={empresas.map(empresa => {
                            return { key: empresa.COMPANY_CODE, value: empresa.COMPANY_CODE, text: empresa.COMPANY_CODE }
                        })}
                        noResultsMessage={"No hay resultados"}
                    />
                    <Dropdown
                        style={{ display: "block", zIndex: 4, margin: 10 }}
                        placeholder="Seleccione base"
                        search
                        selection
                        value={codigobase}
                        onChange={(e, { value }) => { setCodigobase(value) }}
                        options={bases.map(base => {
                            return { key: base.Base, value: base.Base, text: `${base.Base}-${base.Descripcion}` }
                        })}
                        noResultsMessage={"No hay resultados"}
                    />
                    <Dropdown
                        style={{ display: "block", zIndex: 3, margin: 10 }}
                        placeholder="Seleccione color"
                        search
                        selection
                        value={color}
                        onChange={(e, { value }) => { setColor(value) }}
                        options={colores.map(color => {
                            return { key: color.codigo, value: color.codigo, text: `${color.codigo}-${color.nombre}` }
                        })}
                        noResultsMessage={"No hay resultados"}
                    />
                    <div>
                        <input type='number' className='form-control' onChange={(e) => setImpuesto(e.target.value)} placeholder='Impuesto' value={impuesto} />
                    </div>

                    <button onClick={modificarCombinacion} className="btn btn-primary">Modificar</button>
                </DialogContent>
            </Dialog>
            <Card>
                <CardHeader>
                    Combinación base-color-impuesto
                </CardHeader>
                <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <Dropdown
                            style={{ width: "5%", zIndex: 999 }}
                            placeholder="Seleccione empresa"
                            search
                            selection
                            value={empresa}
                            onChange={(e, { value }) => { setEmpresa(value) }}
                            options={empresas.map(empresa => {
                                return { key: empresa.COMPANY_CODE, value: empresa.COMPANY_CODE, text: empresa.COMPANY_CODE }
                            })}
                            noResultsMessage={"No hay resultados"}
                        />
                        <Dropdown
                            style={{ width: "5%", zIndex: 999 }}
                            placeholder="Seleccione base"
                            search
                            selection
                            value={codigobase}
                            onChange={(e, { value }) => { setCodigobase(value) }}
                            options={bases.map(base => {
                                return { key: base.Base, value: base.Base, text: `${base.Base}-${base.Descripcion}` }
                            })}
                            noResultsMessage={"No hay resultados"}
                        />
                        <Dropdown
                            style={{ width: "5%", zIndex: 999 }}
                            placeholder="Seleccione color"
                            search
                            selection
                            value={color}
                            onChange={(e, { value }) => { setColor(value) }}
                            options={colores.map(color => {
                                return { key: color.codigo, value: color.codigo, text: `${color.codigo}-${color.nombre}` }
                            })}
                            noResultsMessage={"No hay resultados"}
                        />
                        <div style={{ width: "10%" }}>
                            <input type='number' className='form-control' onChange={(e) => setImpuesto(e.target.value)} placeholder='Impuesto' value={impuesto} />
                        </div>

                        <button onClick={crearCombinacion} className="btn btn-primary">Agregar</button>
                    </div>
                </CardBody>
            </Card>
            <br />
            <BaseColorImpuestoTable combinaciones={combinaciones} cambiarEstado={cambiarEstadoCombinacion} handleModalEdit={handleModalEdit} />
        </div>
    );
}