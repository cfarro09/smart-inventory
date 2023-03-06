import React, { useState, useContext, useEffect, Component, PropTypes } from 'react';
import Layout from '../components/system/layout/layout'
import triggeraxios from '../config/axiosv2';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableZyx from '../components/system/form/table-simple';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import { BarChart, Bar, Sector, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRange from '../components/system/form/daterange';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import Avatar from '@material-ui/core/Avatar';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import InputFormk from '../components/system/form/inputformik';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import popupsContext from '../context/pop-ups/pop-upsContext';
import MultiSelectFunction from '../components/system/form/multiselect';

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';



const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
        type: filter
    }
})

const FILTER = (filter) => ({
    method: "SP_SEL_FORM_LOGS",
    data: filter
})



const useStyles = makeStyles(() => ({
    containerFilters: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        width: '100%',
    },
    itemFilter: {
        flex: '0 0 215px'
    },
    itemFilter1: {
        width: '100%',
    },
    table: {
        minWidth: 700,
    },
    labelcell: {
        border: "1px #e0e0e0 solid",
        fontWeight: "bold",
        backgroundColor: "white",
    },
    datacell: {
        border: "1px #e0e0e0 solid",
        backgroundColor: "white",
    }
}));


const Linear_detail = () => {
    const classes = useStyles();
    const [category, setcategory] = useState(0);
    const [categoryData, setCategoryData] = useState([])
    const [dataGraph, setDataGraph] = useState([])
    const { setLightBox, setOpenBackdrop } = useContext(popupsContext);
    const [dateRange, setdateRange] = useState([
        {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            key: 'selection'
        }
    ]);

    const columns = React.useMemo(
        () => [
            {
                Header: 'id_formdata',
                accessor: 'id_formdata',
            },
            {
                Header: 'id_form',
                accessor: 'id_form',
            },
            {
                Header: 'formid',
                accessor: 'formid',
            },
            {
                Header: 'name',
                accessor: 'name',
            },
            {
                Header: 'device',
                accessor: 'device',
            },
            {
                Header: 'poiname',
                accessor: 'poiname',
            },
            {
                Header: 'timestamp',
                accessor: 'timestamp',
            },
            {
                Header: 'form_timestamp',
                accessor: 'form_timestamp',
            },
            {
                Header: 'cord_lat',
                accessor: 'cord_lat',
            },
            {
                Header: 'cord_lng',
                accessor: 'cord_lng',
            },
            {
                Header: 'address',
                accessor: 'address',
            },
            {
                Header: 'pregunta2',
                accessor: 'pregunta2',
            },
            {
                Header: 'status',
                accessor: 'status',
            },
            {
                Header: 'num_records',
                accessor: 'num_records',
            },
        ],
        []
    );

    async function filtrar() {
        setOpenBackdrop(true)
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTER({
            from_date: dateRange[0].startDate.toISOString().substring(0, 10),
            to_date: dateRange[0].endDate.toISOString().substring(0, 10),
            id_form: category
        }))
        setOpenBackdrop(false)
        setDataGraph(listResult.result.data)

    }

    useEffect(() => {
        applyfilter()
    }, [])


    const applyfilter = async () => {
        setOpenBackdrop(true);

        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY("LINEAL"));
        setCategoryData(listResult.result.data)

        setOpenBackdrop(false)
    }

    console.log("categoryxxxxsxsxs", category)

    return (
        <Layout>
            <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
                <div className={classes.containerFilters}>
                    <DateRange
                        classname={classes.itemFilter}
                        label="Filtrar Rango de Fecha"
                        dateRangeinit={dateRange}
                        setDateRangeExt={setdateRange}
                    />
                    <SelectFunction
                        title="Categoria"
                        classname={classes.itemFilter}
                        datatosend={categoryData}
                        optionvalue="id_form"
                        valueselected={category}
                        optiondesc="category"
                        variant="outlined"
                        namefield="id_form"
                        descfield="category"
                        callback={(value) => {
                            console.log("value", value.newValue)
                            setcategory(value?.newValue?.id_form || 0)
                        }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => filtrar()}
                        disabled={category === 0}
                        startIcon={<SearchIcon style={{ color: '#FFF' }} />}
                    >Buscar</Button>
                </div>
                <div id="divToPrint">
                    <TableZyx
                        columns={columns}
                        data={dataGraph}
                        // fetchData={filtrar}
                        register={false}
                    />
                </div>
            </div>
        </Layout>
    );
}

export default Linear_detail;