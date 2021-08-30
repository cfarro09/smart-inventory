import React, { useReducer, useState, useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';
import authContext from './authContext';
import authReducer from './authReducer';
import { useRouter } from 'next/router';
import clientAxios from '../../config/axios';
import triggeraxios from '../../config/axiosv2';
import tokenAuth from '../../config/tokenAuth';

import {
    LOGIN_SUCCESS,
    AUTH_SUCCESS,
    AUTH_FAILED,
    CHANGEAPP,
    ORGCHANGE,
    INFOSYS

} from '../../types';

const DEFAULTPROPERTIES = {
    sys_company_name: "LA CANCHA 10",
    sys_company_img: "https://staticfileszyxme.s3.us-east.cloud-object-storage.appdomain.cloud/auxlogotipozyxmedark.png",
    sys_company_color_primary: "#8EC3E0",
    sys_company_color_secondary: "rgb(75, 83, 93)",
}


const AuthState = ({ children }) => {

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''; //next run in server and client, validate to get item from localstorage
    const typeuser = typeof window !== 'undefined' ? localStorage.getItem('typeuser') : '';
    const [appselected, setappselected] = useState({
        insert: false,
        update: false,
        delete: false
    });
    const [tologged, settologged] = useState({ isloading: true, logged: false });
    tokenAuth(token);

    const router = useRouter();
    const initialState = {
        token,
        authenticated: token ? true : false,
        user: null,
        message: null,
        typeuser,
        infosys: DEFAULTPROPERTIES,
        appselected: {
            insert: false,
            update: false,
            delete: false
        }
    }

    useEffect(() => {
        async function loadUserFromCookies() {
            if (token) {
                console.log("validatetoken", router.pathname);
                try {
                    const result = await clientAxios.get(process.env.endpoints.validatetoken);

                    const { first_name: firstname, last_name: lastname, rol_name: role_name, menu } = result.data.data;
                    dispatch({
                        type: AUTH_SUCCESS,
                        payload: { firstname, lastname, role_name, menu }
                    });
                    const routeraux = router.pathname === "/bookings/[id]" ? "/bookings" : router.pathname;
                    const appfound = menu.find(x => x.path === routeraux);

                    if (appfound && appfound.view){
                        dispatch({
                            type: CHANGEAPP,
                            payload: appfound
                        });
                        settologged({ isloading: false, logged: true, appfound });
                    }
                    else
                        router.push("/").then(() => settologged({ isloading: false, logged: true }));

                } catch (error) {
                    console.error(error);
                    dispatch({
                        type: AUTH_FAILED,
                    });
                    router.push('/sign-in').then(() => settologged({ isloading: false, logged: false }))
                }
            } else 
                router.push('/sign-in').then(() => settologged({ isloading: false, logged: false }))
        }
        loadUserFromCookies()
    }, [token])

    useEffect(() => {
        console.log("router.pathname", router.pathname, state.user);
        if (router.pathname !== "/" && state.user) {
            const routeraux = router.pathname === "/bookings/[id]" ? "/bookings" : router.pathname;
            const menu = state.user.menu;
            const appfound = menu.find(x => x.path === routeraux);

            if (appfound && appfound.view){
                dispatch({
                    type: CHANGEAPP,
                    payload: appfound
                });
                settologged({ isloading: false, logged: true, appfound });
            }
        }
    }, [router])

    const [state, dispatch] = useReducer(authReducer, initialState)

    const login = async (payload, setisloading, setresultrequest) => {
        setisloading(true);
        try {
            const result = await clientAxios.post(process.env.endpoints.login, payload);
            dispatch({
                type: LOGIN_SUCCESS,
                payload: result.data.data
            });

        } catch (e) {
            setresultrequest({
                success: false,
                msg: e.response ? e.response.data.error.mensaje : 'Hubo un problema, vuelva a intentarlo mas tarde'
            });
            setTimeout(() => {
                setresultrequest(null);
            }, 3000);
        }
        setisloading(false);
    }

    const changeOrg = async (neworg, setOpenBackdrop) => {
        try {
            setOpenBackdrop(true)
            const res = await triggeraxios('post', '/api/web/change', { id_organization: neworg.id_organization });

            if (res.success) {
                dispatch({
                    type: ORGCHANGE,
                    payload: { id_organization: neworg.id_organization, org_name: neworg.org_name, token: res.result.data.token }
                });
                tokenAuth(res.result.data.token);
                router.reload()
            }
            setOpenBackdrop(false)

        } catch (e) {
            console.log(e);
        }
    }

    const register = async (payload, setisloading, setresultrequest) => {
        setisloading(true);
        try {
            const result = await clientAxios.post('/api/usuarios', payload);
            setresultrequest({
                success: true,
                msg: result.data.msg
            });
            tokenAuth(token);
            setTimeout(() => {
                router.push('/sign-in')
            }, 2000);
        } catch (error) {
            setresultrequest({
                success: false,
                msg: error.response.data.msg
            });
            setTimeout(() => {
                setresultrequest(null);
            }, 2000);
        }
        setisloading(false);
    }

    const signout = () => {
        dispatch({
            type: AUTH_FAILED,
        });
        router.push('/sign-in')
    };


    return (
        <authContext.Provider
            value={{
                token: state.token,
                authenticated: state.authenticated,
                user: state.user,
                loading: state.loading,
                typeuser: state.typeuser,
                tologged,
                infosys: state.infosys,
                appselected: state.appselected,
                login,
                register,
                changeOrg,
                signout
            }}
        > {children}
        </authContext.Provider>
    )
}

export default AuthState;
