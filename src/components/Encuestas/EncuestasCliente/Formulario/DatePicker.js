import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
import { DatePicker } from "@material-ui/pickers";
import FormikErrorFocus from 'formik-error-focus'
const datePicker = (props) => {
    const { label, Descripcion, name, ...rest } = props;
    return (
        <div classname='form-control'>
            <label htmlFor={name}>{label}</label>
            <p style={{ fontStyle: 'italic', fontSize:'13px' }} htmlFor={"Id" + name}>{Descripcion}</p>
            <Field name={name} {...rest}>
                {
                    ({ form, field }) => {
                        const { setFieldValue } = form
                        const { value } = field
                        return <DatePicker
                            id={name}
                            {...field}
                            {...rest}
                            selected={value}
                            onChange={val => setFieldValue(name, val)}
                        />
                    }
                }
            </Field>
            <FormikErrorFocus
                offset={0}
                align={'top'}
                focusDelay={200}
                ease={'linear'}
                duration={1000}
            />
            <ErrorMessage name={name} component={TextError} />
        </div>
    )
}
export default datePicker; 