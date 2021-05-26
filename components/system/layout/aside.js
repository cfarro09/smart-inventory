import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import List from '@material-ui/core/List';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import authContext from '../../../context/auth/authContext';
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
    LocalShipping
} from '@material-ui/icons/';

const listbuy = ['/purchase-order/load', '/purchase-order/list', '/purchase-order/[id]'];
const listsend = ['/bill/load', '/bill/list', '/bill/[id]'];

const Aside = React.memo(({ open, setOpen, classes, theme }) => {
    console.log('aside render');
    const router = useRouter();
    const { user, appselected } = useContext(authContext);

    const handleDrawerClose = () => setOpen(false);

    const ListItemCollapse = React.useCallback(({ itemName, listRoutes, children, IconLink }) => {

        const [isCollapse, setIsCollapse] = useState(false);

        useEffect(() => {
            if (router && !isCollapse) {
                if (listRoutes.includes(router.pathname))
                    setIsCollapse(true)
            }
        }, [router]);

        const ff = user.menu.find(x => ["bill-list", "purchase-order-list", "purchase-order-load", "bill-list"].includes(x.application) && !!x.view);
        
        if (ff) 
            return (
                <>
                    <ListItem style={{paddingBottom: '5px', paddingTop: '5px'}} button onClick={() => setIsCollapse(!isCollapse)}>
                        <ListItemIcon style={{minWidth: '45px'}}><IconLink /></ListItemIcon>
                        <ListItemText style={{ color: 'white' }} primary={itemName} />
                        {isCollapse ? <ExpandLess style={{ color: 'white' }} /> : <ExpandMore style={{ color: 'white' }} />}
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
        // if (!appselected)
        //     return null;
        if (user) {
            let routertmp = router.pathname;
            if (application === "bill-list" && routertmp === "/bill/[id]")
            routertmp = "/bill/list";
            if (application === "purchase-order-list" && routertmp === "/purchase-order/[id]")
            routertmp = "/purchase-order/list";
            
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
                            {IconLink && <ListItemIcon style={{minWidth: '45px'}}><IconLink /></ListItemIcon>}
                            <ListItemText style={{ color: 'white' }} primary={appfound.description} />
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
                <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'rtl' ? <ChevronRight color="primary" /> : <ChevronLeft color="primary" />}
                </IconButton>
            </div>
            <Divider />

            <List>
                <ListItemCollapse
                    itemName="Nota ingreso"
                    listRoutes={listsend}
                    IconLink={() => (
                        <MonetizationOn style={{ color: theme.palette.primary.light }} />
                    )}
                >
                    <LinkList
                        application="bill-load"
                        routeLink="/bill/load"
                    />
                    <LinkList
                        application="bill-list"
                        routeLink="/bill/list"
                    />
                </ListItemCollapse>
                <ListItemCollapse
                    itemName="Orden compra"
                    listRoutes={listbuy}
                    IconLink={() => (
                        <ShoppingCart style={{ color: theme.palette.primary.light }} />
                    )}
                >
                    <LinkList
                        application="purchase-order-load"
                        routeLink="/purchase-order/load"
                    />
                    <LinkList
                        application="purchase-order-list"
                        routeLink="/purchase-order/list"
                    />
                </ListItemCollapse>
                <LinkList
                    application="inventory"
                    IconLink={() => (
                        <ViewComfy style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <Divider />
                <LinkList
                    application="template"
                    IconLink={() => (
                        <TuneIcon style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="product"
                    IconLink={() => (
                        <LabelIcon style={{ color: theme.palette.primary.light }} />
                    )}
                /> 
                <LinkList
                    application="client"
                    IconLink={() => (
                        <StoreIcon style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="buyer"
                    IconLink={() => (
                        <BusinessCenter style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="provider"
                    IconLink={() => (
                        <EmojiTransportation style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="vehicle"
                    IconLink={() => (
                        <LocalShipping style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="corporation"
                    IconLink={() => (
                        <Business style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <Divider />
                <LinkList
                    application="user"
                    IconLink={() => (
                        <AccountCircle style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="property"
                    IconLink={() => (
                        <VpnKey style={{ color: theme.palette.primary.light }} />
                    )}
                />
                <LinkList
                    application="domain"
                    IconLink={() => (
                        <ListIcon style={{ color: theme.palette.primary.light }} />
                    )}
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
        </Drawer >
    );
})

export default Aside;