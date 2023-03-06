import { useState, useContext } from 'react';
import Head from 'next/head';
import Aside from './aside';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import Header from './header';
import { Global, css } from '@emotion/core';
import { useRouter } from 'next/router';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import popupsContext from '../../../context/pop-ups/pop-upsContext';
import authContext from '../../../context/auth/authContext';
import { Helmet } from "react-helmet";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        background: '#FFF',
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    containermainopen: {
        [theme.breakpoints.down('sm')]: {
            maxWidth: `60vw`,
        },
        [theme.breakpoints.up('sm')]: {
            maxWidth: `calc(100vw - ${drawerWidth}px)`,
        },
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    containermainclose: {
        [theme.breakpoints.down('sm')]: {
            maxWidth: `100vw`,
        },
        [theme.breakpoints.up('sm')]: {
            maxWidth: `calc(100vw)`,
        },
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: '#FFF',
    },
    hide: {
        display: 'none',
    },
    drawerOpen: {
        backgroundColor: theme.palette.secondary.light,
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: theme.palette.secondary.light,
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    // toolbar: {
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'flex-end',
    //     padding: theme.spacing(0, 1),
    //     // necessary for content to be below app bar
    //     ...theme.mixins.toolbar,
    // },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    toolbar2: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
    },
    content: {
        flexGrow: 1,
        display: "flex",
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
        flexDirection: "column"
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
    title: {
        flexGrow: 1,
        marginTop: theme.spacing(1)
    },
    containerLogin: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center'
    },
    activelink: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.secondary.main,
        '&:hover': {
            backgroundColor: theme.palette.primary.light,
        },
        '& svg': {
            color: `white!important`
        },
        '& span': {
            color: 'white',
            fontWeight: 'bold',
        }
    }
}));

const Layout = ({ children }) => {
    const { user, infosys } = useContext(authContext);
    const router = useRouter();

    const classes = useStyles();
    const theme = useTheme();

    const { openDrawer, setOpenDrawer } = useContext(popupsContext);

    return (
        <>
            <Global
                styles={css`
                    @font-face {
                        font-family: 'dm-sans';
                        src: url('./fonts/DMSans-Regular.ttf') format('truetype');
                        font-weight: 400;
                        font-style: normal;
                    }
                    
                    @font-face {
                        font-family: 'dm-sans';
                        src: url('./fonts/DMSans-Italic.ttf') format('truetype');
                        font-weight: 400;
                        font-style: italic;
                    }
                    
                    @font-face {
                        font-family: 'dm-sans';
                        src: url('./fonts/DMSans-Medium.ttf') format('truetype');
                        font-weight: 500;
                        font-style: normal;
                    }
                    
                    @font-face {
                        font-family: 'dm-sans';
                        src: url('./fonts/DMSans-MediumItalic.ttf') format('truetype');
                        font-weight: 500;
                        font-style: italic;
                    }
                    
                    @font-face {
                        font-family: 'dm-sans';
                        src: url('./fonts/DMSans-Bold.ttf') format('truetype');
                        font-weight: 700;
                        font-style: normal;
                    }
                    
                    @font-face {
                        font-family: 'dm-sans';
                        src: url('./fonts/DMSans-BoldItalic.ttf') format('truetype');
                        font-weight: 700;
                        font-style: italic;
                    }
                
                    html, body {
                        margin:0;
                    }
                    body {
                        margin:0;
                        padding:0;
                    }
                    .textwhite {
                        fill: #FFF
                    }
                    footer {
                        width: 100%;
                        height: 50px;
                        border-top: 1px solid #eaeaea;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    footer img {
                        margin-left: 0.5rem;
                    }
                    .container-button-floating .button-floating {
                        margin-right: 10px
                    }
                    .container-button-floating .button-floating:last-child {
                        margin-right: 0
                    }
                    footer a {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .logo {
                        height: 1em;
                    }
                    .containercon {
                        min-height: 90vh;
                        display: flex;
                        flex: 1;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .mb-0 {
                        margin-bottom: 0!important;
                    }
                    .mr-0 {
                        margin-right: 0!important;
                    }
                    .ml-0 {
                        margin-left: 0!important;
                    }
                    .mt-0 {
                        margin-top: 0!important;
                    }
                    .row-zyx {
                        display: flex;
                        flex-wrap: wrap;
                        /* margin-bottom: ${theme.spacing(2)}px!important; */
                    }
                    .row-zyx > * {
                        width: 100%;
                        margin-right: 0;
                    }
                    .text-center {
                        text-align: center
                    }
                    .text-right {
                        text-align: right
                    }
                    .font-weight-bold {
                        font-weight: bold
                    }
                    .rowflex-zyx {
                        display: flex;
                        justify-content: space-between;
                    }
                    .row-zyx > .col-2, .row-zyx > .col-3, .row-zyx > .col-4, .row-zyx > .col-6, .row-zyx > .col-9, .row-zyx > .col-8 {
                        margin-bottom: ${theme.spacing(2)}px
                    }
                    @media (min-width: 768px) {
                        .row-zyx {
                            margin-bottom: ${theme.spacing(1)}px;
                        }
                        .row-zyx > .col-2, .row-zyx > .col-3, .row-zyx > .col-4, .row-zyx > .col-6, .row-zyx > .col-9, .row-zyx > .col-8 {
                            width: 50%;
                            padding-right: ${theme.spacing(2)}px;
                            margin-bottom: ${theme.spacing(1)}px
                        }
                        .row-zyx > .col-4:last-child, .row-zyx > .col-6:last-child, .row-zyx > .col-3:last-child, .row-zyx > .col-2:last-child, .row-zyx > .col-8:last-child {
                            padding-right: 0px;
                        }
                        .row-zyx > .col-4:first-of-type, .row-zyx > .col-6:first-of-type, .row-zyx > .col-3:first-of-type, .row-zyx > .col-2:first-of-type, .row-zyx > .col-8:first-of-type {
                            padding-right: ${theme.spacing(2)}px;
                        }
                    }
                    .scroll-style-go::-webkit-scrollbar-track
                    {
                        border-radius: 5px;
                        background-color: transparent;
                    }
                    .scroll-style-go:hover::-webkit-scrollbar-track
                    {
                        border-radius: 5px;
                        background-color: #dbdfe4;
                    }
                    .scroll-style-go::-webkit-scrollbar
                    {
                        width: 10px;
                        background-color: transparent;
                    }
                    .scroll-style-go:hover:-webkit-scrollbar
                    {
                        width: 5px;
                        background-color: #dbdfe4;
                    }
                    .scroll-style-go::-webkit-scrollbar-thumb
                    {
                        border-radius: 10px;
                        background-color: rgba(0, 0, 0, .2);
                        -webkit-transition: .2s ease-in-out;
                        transition: .2s ease-in-out
                    }
                    
                    .scroll-style-go:hover::-webkit-scrollbar-thumb
                    {
                        border-radius: 10px;
                        background-color: rgba(0, 0, 0, .2);
                        -webkit-transition: .2s ease-in-out;
                        transition: .2s ease-in-out
                    }

                    /* width */
                    ::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }

                    /* Track */
                    ::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    
                    /* Handle */
                    ::-webkit-scrollbar-thumb {
                        border-radius: 7px;
                        background: #7721AD;
                    }

                    /* Handle on hover */
                    ::-webkit-scrollbar-thumb:hover {
                        background: #381052;
                    }
                    .chat-button-chatweb {
                        height: 70px;
                        width: 70px;
                    }
                    @media (min-width: 992px) {
                        .row-zyx {
                            margin-bottom: ${theme.spacing(1)}px;
                        }
                        .row-zyx > .col-9 {
                            width: 75%;
                            padding-right: ${theme.spacing(2)}px;
                            margin-bottom: ${theme.spacing(1)}px
                        }
                        .row-zyx > .col-8 {
                            width: 66.66%;
                            padding-right: ${theme.spacing(2)}px;
                            margin-bottom: ${theme.spacing(1)}px
                        }
                        .row-zyx > .col-3 {
                            width: 25%;
                            padding-right: ${theme.spacing(2)}px;
                            margin-bottom: ${theme.spacing(1)}px
                        }
                        .row-zyx > .col-2 {
                            width: 16.6%;
                            padding-right: ${theme.spacing(2)}px;
                            margin-bottom: ${theme.spacing(1)}px
                        }
                        .row-zyx > .col-4 {
                            width: 33.33%;
                            padding-right: ${theme.spacing(2)}px;
                            margin-bottom: ${theme.spacing(1)}px
                        }
                        .row-zyx > .col-3:last-child, .row-zyx > .col-2:last-child, .row-zyx > .col-8:last-child {
                            padding-right: 0px
                        }
                    }
                `}
            />
            <Head>
                {infosys.sys_company_name && <title key={infosys.sys_company_name}>{infosys.sys_company_name}</title>}
            </Head>
            <Helmet>
                <script src="https://zyxmelinux.zyxmeapp.com/zyxme/chat/src/chatwebclient.min.js" integrationid="63fba177762b546856d9ad29" type="text/javascript" />
            </Helmet>

            <div className={classes.root}>
                {['/sign-in', '/sign-up'].indexOf(router.pathname) !== -1 ?
                    (
                        <Container component="main" maxWidth="xs" className={classes.containerLogin}>
                            <div>
                                {children}
                            </div>
                        </Container>
                    ) : (user !== undefined &&
                        (
                            <>

                                <Header
                                    classes={classes}
                                    open={openDrawer}
                                    setOpen={setOpenDrawer}
                                />

                                <Aside
                                    open={openDrawer}
                                    setOpen={setOpenDrawer}
                                    classes={classes}
                                    theme={theme}
                                />

                                <main className={clsx(classes.content, {
                                    [classes.contentShift]: openDrawer,
                                })}>
                                    <div className={classes.toolbar} />

                                    <div className='containercon'>
                                        <Box
                                            component='div' style={{ flex: 1, maxHeight: 'calc(100vh - 64px)', padding: 8 }}
                                            className={clsx({
                                                [classes.containermainopen]: openDrawer,
                                                [classes.containermainclose]: !openDrawer,
                                            })} >
                                            {children}
                                        </Box>
                                    </div>

                                </main>

                            </>
                        ))
                }
            </div>
        </>
    );
}

export default Layout;