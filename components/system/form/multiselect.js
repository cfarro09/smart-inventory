import React, { useEffect, useState } from 'react';
import triggeraxios from '../../../config/axiosv2';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const SelectMulti = ({ title, datatosend, optionvalue, optiondesc, valueselected = "", namefield, descfield, formik = false, classname = null, callback, callbackItem = null }) => {

    const [options, setOptions] = useState([]);
    const [loading, setloading] = useState(true);
    const [optionsSelected, setOptionsSelected] = useState([]);

    const setHardValues = (options, stringvalues) => {
        if (stringvalues) {
            const optionsselll = options.filter(o => stringvalues.split(",").indexOf(o[optionvalue].toString()) > -1)
            setOptionsSelected(optionsselll);
        }
    }

    useEffect(() => {
        const source = axios.CancelToken.source();

        (async () => {
            const valueselectedtmp = valueselected || "";
            if (datatosend instanceof Array) {
                setOptions(datatosend);
                setHardValues(datatosend, valueselectedtmp);
            } else if (datatosend instanceof Object) {
                const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend, null, source);
                if (res.success && res.result.data instanceof Array) {
                    setOptions(res.result.data);
                    setHardValues(res.result, valueselectedtmp);
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
            multiple
            className={classname}
            size="small"
            onChange={(item, values) => {
                if (formik && values) {
                    if (namefield) {
                        const event = { target: { name: namefield, value: values.map(o => o[optionvalue]).join(",") } };
                        console.log(event, formik);
                        formik.handleChange(event);
                    }

                    if (descfield) {
                        const event = { target: { name: descfield, value: values.map(o => o[optiondesc]).join(",") } };
                        formik.handleChange(event);
                    }
                }
                setOptionsSelected(values);
                // if (callback)
                //     callback({ values })
            }}
            options={options}
            disableClearable
            getOptionLabel={option => option ? option[optiondesc] : ''}
            renderOption={(item, { selected }) => (
                <React.Fragment>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        onChange={(e) => {
                            (callbackItem)
                                callbackItem({ checked: e.target.checked, item })
                        }}
                        checked={selected}
                    />
                    {item[optiondesc]}
                </React.Fragment>
            )}

            value={optionsSelected}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={title}
                    error={formik ? (formik?.errors[namefield] ? true : false) : false}
                    helperText={formik ? (formik?.errors[namefield]) : false}
                    variant="outlined"
                    // placeholder="Distritos"
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
    )
}

export default SelectMulti;