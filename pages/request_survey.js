import React, { useState, useContext, useEffect, Component } from 'react';
import Layout from '../components/system/layout/layout'
import { Box, Theme } from "@material-ui/core";
import triggeraxios from '../config/axiosv2';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableZyx from '../components/system/form/table-simple';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRange from '../components/system/form/daterange';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import InputFormk from '../components/system/form/inputformik';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import popupsContext from '../context/pop-ups/pop-upsContext';

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';



const useStyles = makeStyles((theme) => ({
    containerFilters: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        width: '100%',
    },
    itemFilter: {
        flex: '0 0 215px'
    },
    labelcell: {
        border: "1px #e0e0e0 solid",
        fontWeight: "bold",
        backgroundColor: "white",
    },
    datacell: {
        border: "1px #e0e0e0 solid",
        backgroundColor: "white",
    },
    replacerowzyx: {
        display: 'flex',
        flex: 1,
        gap: theme.spacing(2),
        flexWrap: "wrap",
    },
    itemCard: {
        backgroundColor: "#FFF",
        display: 'flex',
        height: '100%',
        flex: 1,
        gap: 8,
        flexWrap: 'wrap',
        padding: theme.spacing(2),
        alignItems: 'center',
        justifyContent: "center",
        minWidth: 200,
    },
    titlecards: {
        fontWeight: "bold",
        fontSize: "1.5em",
        color: "blue",
        padding: 10
    },
    datacelltitle: {
        border: "1px #e0e0e0 solid",
        position: "sticky",
        left: 0,
        background: "white",
        textTransform: "uppercase",
        fontWeight: "bold",
        padding: 5
    },
    datacell: {
        border: "1px #e0e0e0 solid",
        backgroundColor: "white",
        padding: 5
    },
    containermain: {
        margin: "auto",
        width: "50%",
        padding: "10px"
    },
    fieldstyles: {
        width: "100%",
        margin: "10px"
    },
}));

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}
const GET_FILTERRETAIL = (filter,id_form) => ({
    method: "SP_FILTER_BYID",
    data: {
        filter,
        id_form
    }
})

const Request_survey = () => {
    const classes = useStyles();
    return (
        <Layout>
            <div className={classes.containermain}>
                <TextField label="Nombre" variant="outlined" className={classes.fieldstyles}/>
                <TextField className={classes.fieldstyles} label="Apellidos" variant="outlined" />
                <TextField className={classes.fieldstyles} label="Retail" variant="outlined" />
                <TextField className={classes.fieldstyles} label="Correo Electrónico" variant="outlined" />
                <TextField className={classes.fieldstyles} label="Teléfono" variant="outlined" />
                <TextField className={classes.fieldstyles} label="Comentario" variant="outlined" multiline rows={4}/>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.fieldstyles}
                >Enviar</Button>
            </div>
        </Layout>
    );
}

export default Request_survey;