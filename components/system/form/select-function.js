import React, { useEffect, useState } from 'react';
import triggeraxios from '../../../config/axiosv2';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import Box from '@material-ui/core/Box';

const SelectFunction = React.memo(({ title, datatosend, variant = "standard", optionvalue, optiondesc, valueselected = "", namefield = "", descfield = "", formik = false, callback, disabled = false, classname = null, style = null, onlyinitial = false }) => {

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
        if (onlyinitial) {
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
        }
    }, []);

    useEffect(() => {
            const source = axios.CancelToken.source();
    
            (async () => {
                if (datatosend instanceof Array) {
                    setOptions(datatosend);
                    if (!onlyinitial) {
                        setHardValue(datatosend, valueselected);
                    }
                } else if (datatosend instanceof Object) {
                    const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend, null, source);
                    if (res.success && res.result.data instanceof Array) {
                        setOptions(res.result.data);
                        if (!onlyinitial) {
                            setHardValue(res.result.data, valueselected);
                        }
                    }
                }
                setloading(false);
            })();
    
            return () => {
                source.cancel();
            }
    }, [datatosend]);

    return (
        <div className={classname}>
            {variant === "standard" &&
                <Box fontWeight={500} lineHeight="18px" fontSize={14} mb={1} color="textPrimary">{title}</Box>
            }
            <Autocomplete
                filterSelectedOptions
                className={classname}
                style={style}
                disabled={disabled}
                size="small"
                fullWidth
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
                        variant={variant}
                        label={variant !== "standard" && title}
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
            />
        </div>

    )
})

export default SelectFunction;