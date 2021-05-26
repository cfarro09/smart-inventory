import React, { useState } from 'react';
import Checkbox from '@material-ui/core/Checkbox';

const CheckBox = ({ valueselected = false, namefield, formik, disabled = false, callback, metadata }) => {

    const [checked, setchecked] = useState(valueselected)

    const handleChange = (e) => {
        setchecked(e.target.checked);

        if (callback)
            callback({checked: e.target.checked, metadata});

        const event = { target: { name: namefield, value: e.target.checked } };
        if (formik)
            formik.handleChange(event);
    }

    return (
        <Checkbox
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
            disabled={disabled}
        />
    );
}

export default CheckBox;