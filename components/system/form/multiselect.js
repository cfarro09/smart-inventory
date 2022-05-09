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

const SelectMulti = ({ title, datatosend, optionvalue, optiondesc, valueselected = "", namefield, descfield, formik = false, classname = null, callback, callbackItem = null, onlyinitial = false }) => {

    const [options, setOptions] = useState([]);
    const [loading, setloading] = useState(true);
    const [optionsSelected, setOptionsSelected] = useState([]);
    const initial = React.useRef(true)
    
    const setHardValues = (options, stringvalues) => {
        setOptionsSelected([])
        if (stringvalues) {
            const optionsselll = options.filter(o => stringvalues.split(",").indexOf(o[optionvalue].toString()) > -1)
            setOptionsSelected(optionsselll);
            if (callback)
                callback(optionsselll)
        }
    }

    useEffect(() => {
        initial.current = false
        if (onlyinitial) {
            console.log(datatosend)
            const valueselectedtmp = valueselected || "";
            if (datatosend instanceof Array) {
                setOptions(datatosend);
                setHardValues(datatosend, valueselectedtmp);
            }

            setloading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            console.log("valueselected", valueselected)
            if (datatosend instanceof Array) {
                setOptions(datatosend);
                if (!onlyinitial) {
                    setHardValues(datatosend, valueselected || "");
                } 
                else {
                    const optionsselll = options.filter(o => (valueselected || "").split(",").indexOf(o[optionvalue].toString()) > -1)
                    setOptionsSelected(optionsselll);
                }
            }
            setloading(false);
        })();

    }, [datatosend]);

    useEffect(() => {
        console.log("changevalue")
        if (!initial.current) {
            const optionsselll = options.filter(o => valueselected.split(",").indexOf(o[optionvalue].toString()) > -1)
            console.log(optionsselll)
            setOptionsSelected(optionsselll);
        }
    }, [valueselected])

    return (
        <Autocomplete
            multiple
            className={classname}
            size="small"
            onChange={(item, values) => {
                if (formik && values) {
                    if (namefield) {
                        const event = { target: { name: namefield, value: values.map(o => o[optionvalue]).join(",") } };
                        formik.handleChange(event);
                    }

                    if (descfield) {
                        const event = { target: { name: descfield, value: values.map(o => o[optiondesc]).join(",") } };
                        formik.handleChange(event);
                    }
                }
                setOptionsSelected(values);
                if (callback)
                    callback(values)
                // if (callback)
                //     callback({ values })
            }}
            options={options}
            filterSelectedOptions
            disableClearable
            disableCloseOnSelect
            getOptionLabel={option => option ? option[optiondesc] : ''}
            renderOption={(item, { selected }) => (
                <React.Fragment>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        onChange={(e) => {
                            callbackItem && callbackItem({ checked: e.target.checked, item })
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