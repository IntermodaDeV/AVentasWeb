import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import TablacategoriasGasto from './TablaCategoriaGasto';
import { APIURL } from 'utils/Enviroment';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Dropdown } from "semantic-ui-react";

export const CategoriaGasto = props => {
    const [categoriasGasto, setCategoriasGasto] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [categoriaGasto, setCategoriaGasto] = useState(null);
    const [tipoOpciones, setTipoOpciones] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [empresasData, setEmpresasData] = useState([]);
    const [empresaSelected, setEmpresaSelected] = useState(null)
    const context = useRef();

    const cargarEmpresas = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Gira/Empresas`)
            let empresasList = [];
            request.data.forEach(empresa => {
                let valores = { key: empresa.Empresa, value: empresa.Empresa, text: empresa.Empresa }
                empresasList.push(valores);
            });
            setEmpresas(empresasList);
            setEmpresaSelected(empresasList[0].value)
            setEmpresasData(request.data)
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado las empresas.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const cargarTipoOpcionesDetalle = async () => {
        let empresa = empresaSelected ? empresaSelected : empresas[0].value;
        console.log(empresasData[0].Empresa)
        try {
            const request = await axios.get(`${APIURL}/api/Gira/TipoGasto/${empresa}`);
            let TipoOpciones = [];
            request.data.forEach(tipo => {
                let valores = { key: tipo.Nombre, value: tipo.Id }
                TipoOpciones.push(valores);
            });
            setTipoOpciones(TipoOpciones);
        } catch (err) {
            let mensaje = "Ha ocurrido un error " + err;

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }



    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            CuentaContrapartida: yup.string().required('La cuenta contrapartida es obligatoira')
        });

    const cargarCategoriaGasto = async () => {
        try {
            let empresa = empresaSelected ? empresaSelected : empresas[0].value;
            const request = await axios.get(`${APIURL}/api/Gira/CategoriaGasto/${empresa}`);
            setCategoriasGasto(request.data);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado los tipos de gastos." + err;

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const modificarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/Gira/ActualizarEstadoCategoria/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarCategoriaGasto();
            });
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const registrarCategoriaGasto = async (data) => {
        console.log("enviando...")
        console.log(data)
        try {
            await axios.post(`${APIURL}/api/Gira/RegistrarCategoriaGasto`, data);
            setMostrar(false);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado la Categoria de Gasto exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarCategoriaGasto();
            });
        } catch (err) {
            setMostrar(false);
            let mensaje = "Ha ocurrido un error y no se ha registrado la Categoria de gasto. " + err;

            if (err.response) {
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const modificar = async (data) => {
        setMostrar(false)
        try {
            await axios.post(`${APIURL}/api/Gira/ActualizarCategoria/`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el Tipo de Gastos exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarCategoriaGasto();
            });
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const openEdit = (tip) => {
        setCategoriaGasto(tip);
        setMostrar(true);
    }

    const Mostrar = () => {
        setCategoriaGasto(null);
        setMostrar(true);
    }

    let initialValues, edit;

    if (categoriaGasto) {
        initialValues = {
            idCategoriaTipoGasto: categoriaGasto.idCategoriaTipoGastoViaje,
            idTipoGastoViaje: categoriaGasto.IdTipoGastoViaje,
            Nombre: categoriaGasto.CategoriaNombre,
            ProveedorPredefinido: categoriaGasto.ProveedorPredefinido,
            GrupoImpuesto: categoriaGasto.GrupoImpuesto,
            CuentaContrapartida: categoriaGasto.CuentaContrapartida,
            FacturaObligatoria: categoriaGasto.FacturaObligatoria,
            Descripcion: categoriaGasto.Descripcion,
            ImagenObligatoria: categoriaGasto.imagen
        }
        edit = true
    } else {
        initialValues = {
            idTipoGastoViaje: tipoOpciones.length > 0 ? tipoOpciones[0].value : '',
            Nombre: '',
            ProveedorPredefinido: '',
            CuentaContrapartida: '',
            GrupoImpuesto: '',
            FacturaObligatoria: false,
            Descripcion: false,
            ImagenObligatoria: false
        }
        edit = false
    }

    useEffect(() => {
        cargarEmpresas();
    }, [])
    useEffect(() => {
        if (empresasData.length > 0) {
            cargarTipoOpcionesDetalle();
            cargarCategoriaGasto();
        }
        // eslint-disable-next-line
    }, [empresasData, empresaSelected])
    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title"> {edit ? 'Registrar ' : ''}Categoria Gasto</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            registrarCategoriaGasto(values)
                        }}
                    >
                        {({ errors, resetForm, values, setValues }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <label htmlFor="TipoOpcion">Tipo</label>
                                        <Field id="Opcion" name="idTipoGastoViaje" as="select" className="form-control" style={{ width: '450px', marginRight: '20px' }} disabled={edit ? true : false}>
                                            {
                                                tipoOpciones.map(opcion => {
                                                    return (
                                                        <option key={opcion.value} value={opcion.value}>
                                                            {opcion.key}
                                                        </option>

                                                    )
                                                })
                                            }
                                        </Field>
                                        <Field
                                            label="Nombre"
                                            name="Nombre"
                                            error={!!errors.CategoriaNombre}
                                            helperText={errors.CategoriaNombre}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                        <br />
                                        <Field
                                            label="Proveedor Predefinido"
                                            name="ProveedorPredefinido"
                                            error={!!errors.ProveedorPredefinido}
                                            helperText={errors.ProveedorPredefinido}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                        <br />
                                        <Field
                                            label="Grupo Impuestos"
                                            name="GrupoImpuesto"
                                            error={!!errors.GrupoImpuesto}
                                            helperText={errors.GrupoImpuesto}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                        <br />
                                        
                                        <Field
                                            label="Cuenta ContraPartida"
                                            name="CuentaContrapartida"
                                            error={!!errors.CuentaContrapartida}
                                            helperText={errors.CuentaContrapartida}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />

                                    </div>
                                    <label htmlFor="Obligatorios">Campos obligatorios</label>
                                    <br />
                                    <FormControlLabel
                                        control={
                                            <Field
                                                type="checkbox"
                                                name="FacturaObligatoria"
                                                checked={values.FacturaObligatoria}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Factura"}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Field
                                                type="checkbox"
                                                name="Descripcion"
                                                checked={values.Descripcion}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Descripcion"}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Field
                                                type="checkbox"
                                                name="ImagenObligatoria"
                                                checked={values.ImagenObligatoria}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Imagen"}
                                    />
                                    <DialogActions>
                                        <Button onClick={() => { setMostrar(false) }} color="primary">
                                            Cancelar
                                        </Button>
                                        {edit && <Button type="button" onClick={() => { modificar(values) }} color="sucess"> Guardar</Button>}
                                        {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                                    </DialogActions>
                                </Form>

                            </div>
                        )}

                    </Formik>
                </DialogContent>
            </Dialog>
            <div className="px-3">
                <div className="row mb-3">
                    <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                        <Dropdown
                            placeholder="Empresa"
                            selection
                            style={{ zIndex: 999 }}
                            onChange={(e, { value }) => setEmpresaSelected(value)}
                            options={empresas}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={empresaSelected}
                        />
                    </div>
                </div>
            </div>
            <TablacategoriasGasto CategoriasGastos={categoriasGasto} setMostrar={Mostrar} openEdit={openEdit} ModificarEstado={modificarEstado} empresas={empresas} empresaSelected={empresaSelected}></TablacategoriasGasto>
        </div>

    )
}