import React, { useContext } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { MuiThemeProvider } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import AuthState from '../context/auth/authState';
import PopUps from '../components/system/layout/popups';
import PopUpsState from '../context/pop-ups/pop-upsState';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import 'react-image-lightbox/style.css'; // theme css file
import authContext from '../context/auth/authContext';

export default function MyApp({ Component, pageProps }) {

    React.useEffect(() => {
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    const ProtectRoute = ({ children }) => {
        const { tologged, infosys } = useContext(authContext);

        const { sys_company_color_primary, sys_company_color_secondary } = infosys;
        
        if (tologged.isloading) {
            return (
                <Backdrop open={true} style={{ zIndex: theme().zIndex.drawer + 999999999, color: '#fff' }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            );
        }
        return (
            <MuiThemeProvider theme={theme(sys_company_color_primary, sys_company_color_secondary)}>
                {children}
            </MuiThemeProvider>
        )
            ;
    };

    return (
        <React.Fragment>
            <AuthState>
                <PopUpsState>
                    <ProtectRoute>
                        <CssBaseline />
                        <Component {...pageProps} />
                    </ProtectRoute>
                    <PopUps />
                </PopUpsState>
            </AuthState>
        </React.Fragment >
    );
}