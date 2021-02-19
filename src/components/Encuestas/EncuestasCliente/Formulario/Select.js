import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
import FormikErrorFocus from 'formik-error-focus'
const Select = (props) => {
    const { label, Descripcion, name, options, ...rest } = props;
    return (
        <div classname='form-control'>
            <label htmlFor={name}>{label}</label>
            <p style={{ fontStyle: 'italic', fontSize:'13px' }} htmlFor={"Id" + name}>{Descripcion}</p>
            <Field
                style={{ width: '700px'}}
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
export default Select; 