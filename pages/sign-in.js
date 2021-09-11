import React, { useState, useContext } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from 'next/link';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import Layout from '../components/system/layout/layout';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';

import authContext from '../context/auth/authContext'
import { useRouter } from 'next/router';

import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link href="/">
                <a>Cancha la 10 {new Date().getFullYear()}</a>
            </Link>
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    progress: {
        margin: theme.spacing(0, 'auto', 3),
        display: 'block'
    },
    alert: {
        display: 'inline-flex',
        width: '100%'
    },
    alertheader: {
        display: 'inline-flex',
        width: '100%',
        marginTop: theme.spacing(1),
    },
}));

export default function SignIn() {
    const classes = useStyles();
    const router = useRouter();

    const { login, infosys } = useContext(authContext);

    const [isloading, setisloading] = useState(false);
    const [resultrequest, setresultrequest] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const formik = useFormik({
        initialValues: {
            user: '',
            password: ''
        },
        validationSchema: Yup.object({
            user: Yup.string().required('El usuario es obligatorio'),
            password: Yup.string().required('El password es obligatorio')
        }),
        onSubmit: async values => {
            login(values, setisloading, setresultrequest);
        }
    });

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Layout>
            <div className={classes.paper}>
                <img src={infosys.sys_company_img} alt="titledev" width="250"/>
                
                {
                    resultrequest && (
                        <Alert className={classes.alertheader} variant="filled" severity={resultrequest.success ? "success" : "error"}>
                            {resultrequest.msg}
                        </Alert>
                    )
                }
                <form
                    className={classes.form}
                    onSubmit={formik.handleSubmit}
                >
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label="Usuario"
                        name="user"
                        value={formik.values.user}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={!!formik.errors.user}
                        helperText={formik.errors.user}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label="Contraseña"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.password ? true : false}
                        helperText={formik.errors.password}
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
                    {
                        !isloading ?
                            (
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                >
                                    Ingresar
                                </Button>
                            ) :
                            (
                                <CircularProgress className={classes.progress} />
                            )
                    }

                </form>
            </div>
            <Box mt={8}>
                <Copyright />
            </Box>
        </Layout>
    );
}