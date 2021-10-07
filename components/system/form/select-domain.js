import React, { useEffect, useState } from 'react';
import triggeraxios from '../../../config/axiosv2';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import Box from '@material-ui/core/Box';

const UseSelectDomain = ({ title, domainname, valueselected = "", namefield = "", formik = false, classname = null, disabled = false, callback }) => {

    const [options, setOptions] = useState([]);
    const [loading, setloading] = useState(true);
    const [value, setValue] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const setHardValue = (dataoptions, valuetoset) => {
        setInputValue('');
        setValue(null);
        if (valuetoset) {
            const optionfind = dataoptions.find(o => o.domain_value === valuetoset);
            if (optionfind) {
                setInputValue(optionfind.domain_description);
                setValue(optionfind);

                if (callback)
                    callback({ newValue: optionfind })
            }
        }
    }

    useEffect(() => {
        const source = axios.CancelToken.source();

        (async () => {
            if (typeof domainname === "string") {
                const datatosend = {
                    method: "SP_SEL_DOMAIN",
                    data: {
                        domain_name: domainname,
                        status: 'ACTIVO'
                    }
                }
                const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend, null, source);
                if (res.success && res.result.data instanceof Array) {
                    setOptions(res.result.data);
                    setHardValue(res.result.data, valueselected)
                }
                setloading(false);
            } else if (domainname instanceof Array) {
                setloading(false);
                setOptions(domainname);
                setHardValue(domainname, valueselected)
            }
        })();

        return () => {
            source.cancel();
        }
    }, []);

    return (
        <div className={classname}>
            <Box fontWeight={500} lineHeight="18px" fontSize={14} mb={1} color="textPrimary">{title}</Box>

            <Autocomplete
                fullWidth
                className={classname}
                size="small"
                value={value}
                inputValue={inputValue}
                disabled={disabled}
                onChange={(_, newValue) => {
                    if (formik) {
                        const event = { target: { name: namefield, value: (newValue ? newValue.domain_value : '') } };
                        formik.handleChange(event);

                    }
                    setValue(newValue);
                    if (callback)
                        callback({ newValue });
                }}
                onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                getOptionLabel={option => option ? option.domain_description : ''}
                options={options}
                loading={loading}
                renderInput={(params) => (
                    <TextField
                        {...params}
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

}

export default UseSelectDomain;