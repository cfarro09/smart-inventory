import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';


const InputFormk = React.memo(({ name, variant = "standard", label, formik, type = "text", classname = null, disabled = false, valuedefault = null, callback = null, style = {} }) => {
    const [valuex, setValuex] = useState("");
    if (type === "password") {
        const [showPassword, setShowPassword] = React.useState(false);

        const handleMouseDownPassword = (event) => {
            event.preventDefault();
        };

        const handleClickShowPassword = () => {
            setShowPassword(!showPassword);
        };
        return (
            <div className={classname}>
                {variant === "standard" &&
                    <Box fontWeight={500} lineHeight="18px" fontSize={14} mb={1} color="textPrimary">{label}</Box>
                }
                <TextField
                    variant={variant}
                    label={variant !== "standard" && label}
                    disabled={disabled}
                    name={name}
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={!valuedefault ? (formik?.values?.[name] || "") : valuedefault}
                    onChange={e => {
                        if (callback)
                            callback(e.target.value)
                        formik?.handleChange(e);
                    }}
                    onBlur={formik?.handleBlur}
                    error={formik?.errors[name] ? true : false}
                    helperText={formik?.errors[name]}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
        )
    } else {
        return (
            <div className={classname}>
                {variant === "standard" &&
                    <Box fontWeight={500} lineHeight="18px" fontSize={14} mb={1} color="textPrimary">{label}</Box>
                }
                <TextField
                    variant={variant}
                    label={variant !== "standard" && label}
                    name={name}
                    disabled={disabled}
                    autoComplete="off"
                    style={style}
                    className={classname}
                    fullWidth
                    type={type}
                    fullWidth
                    size="small"
                    value={!valuedefault ? (formik ? formik?.values?.[name] || "" : valuex) : valuedefault}
                    onChange={e => {
                        if (formik)
                            formik.handleChange(e);
                        else
                            setValuex(e.target.value)
                        if (callback)
                            callback(e.target.value);

                    }}
                    // onBlur={formik?.handleBlur}
                    error={formik?.errors[name] ? true : false}
                    helperText={formik?.errors[name]}
                />
            </div>

        );
    }
})

export default InputFormk;