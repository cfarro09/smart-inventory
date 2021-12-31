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
    sys_company_name: "Oster",
    sys_company_img: "https://seeklogo.com/images/O/Oster_2006-logo-8F7C33D348-seeklogo.com.png",
    sys_company_color_primary: "#0c4da2",
    sys_company_color_secondary: "#010025",
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
        if (state.user && state.user.menu) {
            const appfound = state.user.menu.find(x => x.path === router.pathname);
            dispatch({
                type: CHANGEAPP,
                payload: appfound
            });
        }
    }, [router])

    useEffect(() => {
        async function loadUserFromCookies() {
            if (token) {
                try {
                    const result = await clientAxios.get(process.env.endpoints.validatetoken);
                    const { first_name: firstname, last_name: lastname, rol_name: role_name, menu } = result.data.data;

                    dispatch({
                        type: AUTH_SUCCESS,
                        payload: { firstname, lastname, role_name, menu }
                    });
                    const routeraux = router.pathname === "/bulkload/[id]" ? "/bulkload/list" : (router.pathname === "/purchase-order/[id]" ? "/purchase-order/list" : router.pathname);
                    const appfound = menu.find(x => x.path === routeraux);

                    if (appfound && appfound.view){
                        dispatch({
                            type: CHANGEAPP,
                            payload: appfound
                        });
                        settologged({ isloading: false, logged: true, appfound });
                    }
                    else
                        router.push("/share_by_brand").then(() => settologged({ isloading: false, logged: true }));

                } catch (error) {
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

    const [state, dispatch] = useReducer(authReducer, initialState)

    const login = async (payload, setisloading, setresultrequest) => {
        setisloading(true);
        try {
            const result = await clientAxios.post(process.env.endpoints.login, { data: { ...payload, origin: "WEB" } });

            localStorage.setItem('typeuser', result.data.data.type);
            dispatch({
                type: LOGIN_SUCCESS,
                payload: result.data.data
            });
            // router.push("/")

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
