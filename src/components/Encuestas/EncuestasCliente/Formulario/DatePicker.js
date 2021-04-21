import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
import { DatePicker } from "@material-ui/pickers";
import FormikErrorFocus from 'formik-error-focus'
const datePicker = (props) => {
    const { label, Descripcion, name, ...rest } = props;
    return (
        <div classname='form-control' hidden={props.hidden}>
            <label htmlFor={name}>{label}</label>
            <p style={{ fontStyle: 'italic', fontSize:'13px' }} htmlFor={"Id" + name}>{Descripcion}</p>
            <Field name={name} {...rest} className="form-control">
                {
                    ({ form, field }) => {
                        const { setFieldValue } = form
                        const { value } = field
                        return <DatePicker
                            autoOk
                            id={name}
                            format={"DD/MM/YYYY"}
                            value={value}
                            inputVariant = {"outlined"}
                            style={{  width: '700px'}}
                            onChange={val => setFieldValue(name, val)}
                        />
                    }
                }
            </Field>
            <br></br>
            <FormikErrorFocus
                offset={0}
                align={'top'}
                focusDelay={200}
                ease={'linear'}
                duration={1000}
            />
            <ErrorMessage name={name} component={TextError} />
            <br></br>
        </div>
    )
}
export default datePicker; 