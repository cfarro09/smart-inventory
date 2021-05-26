import { 
    LOGIN_SUCCESS, 
    AUTH_SUCCESS, 
    INFOSYS,
    AUTH_FAILED,
    CHANGEAPP,
    ORGCHANGE } from '../../types';

export default (state, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                token: action.payload.token,
                authenticated: true,
                typeuser: action.payload.type,
                // user: { firstname: action.payload.first_name, lastname: action.payload.last_name, role_name: action.payload.rol_name }
            }
        case AUTH_SUCCESS: 
            return {
                ...state,
                user: action.payload
            }
        case INFOSYS: 
            return {
                ...state,
                infosys: action.payload
            }
        case AUTH_FAILED: 
            localStorage.removeItem('token');
            return {
                ...state,
                user: null,
                authenticated: false
            }
        case CHANGEAPP: 
            return {
                ...state,
                appselected: action.payload
            }
        case ORGCHANGE:
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('id_organization', action.payload.org_name);
            localStorage.setItem('org_name', action.payload.org_name);
            return {
                ...state,
                id_organization: action.payload.id_organization,
                org_name: action.payload.org_name,
                token: action.payload.token
            }
        default:
            return state;
    }
}