import React,{useRef} from 'react';
import {Formik,Form,Field} from 'formik';
import * as yup from 'yup';
import TextField from '@material-ui/core/TextField';
import  CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const validationSchema = yup.object().shape(
{
    Codigo: yup.string().required('El código es obligatorio'),
    Descripcion: yup.string().required('La descripción es obligatoria'),
    Activo: yup.boolean()
});

export const FormularioMotivoAnulacion = props => {
    const {Valores,Crear,OcultarModal,Modificar} = props;

    const context = useRef();

    let initialValues,edit;

    if(Valores)
    {
        initialValues={
            Id: Valores.Id,
            Codigo: Valores.Codigo,
            Descripcion: Valores.Descripcion,
            Activo: Valores.Activo,
            Usuario: localStorage.getItem('codigo')
        }
        edit=true;
    }
    else
    {
        initialValues={
            Codigo: '',
            Descripcion: '',
            Activo: true,
            Usuario: localStorage.getItem('codigo')
        }
        edit=false;
    }

    const handleSubmit = (values)=>{
        Crear(values);
        OcultarModal();
    }

    const handleEdit = (values) =>{
        Modificar(values);
        OcultarModal();
    }

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={(values)=>{
                handleSubmit(values)
            }}>
            {({errors,values})=>(
                <div ref={context}>
                    <Form>
                        <div className="form-group">
                            <Field
                                label="Código"
                                name="Codigo"
                                error={!!errors.Codigo}
                                helperText={errors.Codigo}
                                disabled={edit}
                                style={{fontSize:'40px',width: '450px'}}
                                as={TextField}
                                className ="form-control"/>
                        </div>
                        <div className="form-group">
                            <Field
                                label="Descripción"
                                name="Descripcion"
                                error={!!errors.Descripcion}
                                helperText={errors.Descripcion}
                                style={{fontSize:'40px',width: '450px'}}
                                as={TextField}
                                className ="form-control"/>
                        </div>
                        <FormControlLabel
                                control={
                                <Field
                                    type="checkbox"
                                    name="Activo"
                                    checked={values.Activo}
                                    as={CheckBox}
                                />
                                }
                                label={"Activo"}/>
                        <DialogActions>
                        <Button onClick={OcultarModal} color="primary">
                            Cancelar
                        </Button>
                       {edit && <Button type="button" onClick={()=>{handleEdit(values)}} color="sucess"> Editar</Button>}
                       {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                    </DialogActions>
                    </Form>
                </div>
            )}
        </Formik>
    )
}
