import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
import { DatePicker } from "@material-ui/pickers";
const datePicker = (props) => {
    const { label, name, ...rest } = props;
    return (
        <div classname='form-control'>
            <label htmlFor={name}>{label}</label>
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
            <ErrorMessage name={name} component={TextError} />
        </div>
    )
}
export default datePicker; 