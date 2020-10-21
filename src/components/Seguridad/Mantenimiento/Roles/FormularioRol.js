import React,{useRef} from 'react';
import {Formik,Form,Field} from 'formik';
import * as yup from 'yup';
import TextField from '@material-ui/core/TextField';
import  CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const validationSchema = yup.object().shape(
{
    Nombre: yup.string().required('El nombre es obligatorio'),
    Status: yup.boolean()
});

export const FormularioRol = props => {
    const {rol,crearRol,ocultarModal,modificarRol} = props;

    const context = useRef();

    let initialValues,edit;

    if(rol){
        initialValues={
            Id:rol.Id,
            Nombre:rol.Nombre,
            Status:rol.Status
        }
        edit=true;
    }else{
        initialValues={
            Nombre:'',
            Status:true
        }
        edit=false;
    }

    const handleSubmit = (values)=>{
        crearRol(values);
        ocultarModal();
    }

    const handleEdit = (values) =>{
        modificarRol(values);
        ocultarModal();
    }

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={(values)=>{
                handleSubmit(values)
            }}
        >
            {({errors,resetForm,values,setValues})=>(
                <div ref={context}>
                    <Form>
                        <div>
                            <Field
                                label="Nombre"
                                name="Nombre"
                                error={!!errors.Nombre}
                                helperText={errors.Nombre}
                                style={{marginRight:'80px'}}
                                as={TextField}
                            />
                            <FormControlLabel
                                control={
                                <Field
                                    type="checkbox"
                                    name="Status"
                                    checked={values.Status}
                                    as={CheckBox}
                                />
                                }
                                label={values.Status?"Inactivar":"Activar"}
                            />
                        </div>
                        <div style={{textAlign:'center',marginTop:'20px'}}>
                            {edit && <button  type="button" className="btn btn-outline-warning" onClick={()=>{handleEdit(values)}}>Modificar</button>}
                            {!edit && <button type="submit" className="btn btn-outline-primary">Guardar</button>}
                        </div>
                    </Form>
                </div>
            )}
        </Formik>
    )
}