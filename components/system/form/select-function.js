import React, { useEffect, useState } from 'react';
import triggeraxios from '../../../config/axiosv2';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import axios from "axios";

const defaultFilterOptions = createFilterOptions();

const SelectFunction = React.memo(({ title, datatosend, optionvalue, optiondesc, valueselected = "", namefield = "", descfield = "", formik = false, callback, disabled = false, classname = null, style = null, noOptions = "", onNoOptions }) => {

    const [options, setOptions] = useState([]);
    const [loading, setloading] = useState(true);
    const [value, setValue] = useState(null);
    const [inputValue, setInputValue] = useState('');


    const setHardValue = (dataoptions, valuetoset) => {
        setInputValue('');
        setValue(null);
        if (valuetoset) {
            const optionfound = dataoptions.find(o => o[optionvalue] === valuetoset);
            if (optionfound) {
                setInputValue(optionfound[optiondesc]);
                setValue(optionfound);

                if (callback)
                    callback({ newValue: optionfound })
            }
        }
    }

    useEffect(() => {
        const source = axios.CancelToken.source();

        (async () => {
            if (datatosend instanceof Array) {
                setOptions(datatosend);
                setHardValue(datatosend, valueselected);
            } else if (datatosend instanceof Object) {
                const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend, null, source);
                if (res.success && res.result.data instanceof Array) {
                    setOptions(res.result.data);

                    setHardValue(res.result.data, valueselected);
                }
            }
            setloading(false);
        })();

        return () => {
            source.cancel();
        }
    }, [datatosend]);

    return (
        <Autocomplete
            filterSelectedOptions
            className={classname}
            style={style}
            disabled={disabled}
            size="small"
            value={value}
            inputValue={inputValue}
            onChange={(_, newValue) => {
                if (formik && newValue) {
                    if (namefield) {
                        const event = { target: { name: namefield, value: newValue[optionvalue] } };
                        formik.handleChange(event);
                    }
                    if (descfield) {
                        const event = { target: { name: descfield, value: newValue[optiondesc] } };
                        formik.handleChange(event);
                    }
                } else if (formik && !newValue) {
                    const event = { target: { name: namefield, value: '' } };
                    formik.handleChange(event);
                }
                setValue(newValue);
                if (callback)
                    callback({ newValue });
            }}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            getOptionLabel={option => option ? option[optiondesc] : ''}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={title}
                    variant="outlined"
                    error={formik ? (formik?.errors[namefield] ? true : false) : false}
                    helperText={formik ? (formik?.errors[namefield]) : false}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
            noOptionsText={
                <Button
                    fullWidth
                    onMouseDown={() => {
                        onNoOptions();
                    }}
                >
                    {noOptions}
                </Button>
            }
        />
    )
})

export default SelectFunction;