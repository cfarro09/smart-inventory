import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import List from '@material-ui/core/List';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import authContext from '../../../context/auth/authContext';
import popupsContext from '../../../context/pop-ups/pop-upsContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Collapse from '@material-ui/core/Collapse';
import {
    ChevronLeft,
    ChevronRight,
    VpnKey,
    List as ListIcon,
    AccountCircle,
    ExpandLess,
    ExpandMore,
    LockOpen,
    ShoppingCart,
    Business,
    MonetizationOn,
    Store as StoreIcon,
    ViewComfy,
    BusinessCenter,
    Tune as TuneIcon,
    Label as LabelIcon,
    EmojiTransportation,
    Timeline,
    LocalShipping
} from '@material-ui/icons/';

const listbuy = ['/purchase-order/load', '/purchase-order/list', '/purchase-order/[id]'];
const listsend = ['/bill/load', '/bill/list', '/bill/[id]'];

const whiteIconTheme = createMuiTheme({
    overrides: {
        MuiSvgIcon: {
            root: {
                color: "#FFF",
                width: 24,
                height: 24,
                minWidth: 0
            },
        },
    },
});


const Aside = React.memo(({ open, setOpen, classes, theme }) => {
    const router = useRouter();
    const { user, appselected } = useContext(authContext);
    const { openDrawer, setOpenDrawer } = useContext(popupsContext);


    const handleDrawerClose = () => setOpen(false);

    const ChevronIcon = () => {
        if (!openDrawer) {
            return (
                <ThemeProvider theme={whiteIconTheme}>
                    {theme.direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
                </ThemeProvider>
            );
        } else {
            return theme.direction === 'rtl' ? <ChevronRight color="primary" /> : <ChevronLeft color="primary" />;
        }
    };

    const ListItemCollapse = React.useCallback(({ itemName, listRoutes, children, IconLink }) => {

        const [isCollapse, setIsCollapse] = useState(false);

        useEffect(() => {
            if (router && !isCollapse) {
                if (listRoutes.includes(router.pathname))
                    setIsCollapse(true)
            }
        }, [router]);

        const ff = user?.menu.find(x => ["bill-list", "purchase-order-list", "purchase-order-load", "bill-list"].includes(x.application) && !!x.view);

        if (ff)
            return (
                <>
                    <ListItem style={{ paddingBottom: '5px', paddingTop: '5px' }} button onClick={() => setIsCollapse(!isCollapse)}>
                        <ListItemIcon style={{ minWidth: '45px' }}><IconLink /></ListItemIcon>
                        <ListItemText primary={itemName} />
                        {isCollapse ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={isCollapse} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {children}
                        </List>
                    </Collapse>
                </>
            )
        else
            return null;
    }, [])

    const LinkList = React.useCallback(({ IconLink = null, application }) => {
        if (user) {
            let routertmp = router.pathname;

            const appfound = user.menu.find(x => x.application === application);

            if (appfound && appfound.view)
                return (
                    <Link href={appfound.path}>
                        <ListItem
                            button
                            key={appfound.path}
                            style={{ paddingBottom: '5px', paddingTop: '5px', paddingLeft: theme.spacing(IconLink ? 2 : 9) }}
                            className={classes.listItem, (routertmp === appfound.path ? classes.activelink : undefined)}
                        >
                            {IconLink && <ListItemIcon style={{ minWidth: '45px' }}><IconLink /></ListItemIcon>}
                            <ListItemText primary={appfound.description} />
                        </ListItem>
                    </Link>
                )
        }
        return null;
    }, [appselected])

    return (
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={open}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.toolbar}>
                <img src={openDrawer ? "/capitalconnective.png" : "https://ostermxqa.vteximg.com.br/arquivos/O_App_logo.png?v=637233845265900000"} style={{ height: 37 }} alt="logo" />
            </div>

            <List disablePadding>

                <LinkList
                    application="stepchart"
                    IconLink={() => <ListIcon style={{ color: theme.palette.primary.light }} />}
                />
                <LinkList
                    application="warboard"
                    IconLink={() => <ListIcon style={{ color: theme.palette.primary.light }} />}
                />
                <LinkList
                    application="photo_portal"
                    IconLink={() => <ListIcon style={{ color: theme.palette.primary.light }} />}
                />
                <LinkList
                    application="data_base"
                    IconLink={() => <ListIcon style={{ color: theme.palette.primary.light }} />}
                />
                <LinkList
                    application="linear_detail"
                    IconLink={() => <ListIcon style={{ color: theme.palette.primary.light }} />}
                />
                <LinkList
                    application="share_by_brand"
                    IconLink={() => <ListIcon style={{ color: theme.palette.primary.light }} />}
                />

                <Divider />
                <LinkList
                    application="user"
                    IconLink={() => (
                        <AccountCircle style={{ color: theme.palette.primary.light }} />
                    )}
                />

                <LinkList
                    application="domain"
                    IconLink={() => <ListIcon style={{ color: theme.palette.primary.light }} />}
                />
                <Divider />
                <LinkList
                    application="role-application"
                    IconLink={() => (
                        <LockOpen style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="role"
                    IconLink={() => (
                        <LockOpen style={{ color: theme.palette.primary.light }} />
                    )}
                />
            </List>
            <div style={{ flexGrow: 1 }}></div>
            <div className={classes.toolbar2}>
                <IconButton onClick={() => handleDrawerClose()}>
                    <ChevronIcon />
                </IconButton>
            </div>
        </Drawer >
    );
})

export default Aside;