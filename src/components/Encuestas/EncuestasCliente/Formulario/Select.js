import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
const Select = (props) => {
    const { label, name, options, ...rest } = props;
    return (
        <div classname='form-control'>
            <label htmlFor={name}>{label}</label>
            <Field
                style={{ width: '450px', marginRight: '20px' }}
                className="form-control"
                id={name}
                name={name} {...rest}
                as='select'>
                {
                    options.map(opcion => {
                        return (
                            <option key={opcion.value} value={opcion.value}>
                                {opcion.key}
                            </option>
                        )
                    })
                }
            </Field>
            <ErrorMessage name={name} component={TextError} />
        </div>
    )
}
export default Select; 