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

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';


const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);
const StyledTableCell2 = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);

const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
    }
})
function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

const rows = [
    { id: "667", fecha: "29/09/2021",hora: "19:23",activo: "ORE",grupos: "FFVV",cliente: "generic",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "668", fecha: "29/09/2021",hora: "19:24",activo: "KANA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "669", fecha: "29/09/2021",hora: "19:25",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "670", fecha: "29/09/2021",hora: "19:26",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "671", fecha: "29/09/2021",hora: "19:27",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "672", fecha: "29/09/2021",hora: "19:30",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "673", fecha: "29/09/2021",hora: "19:27",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "674", fecha: "29/09/2021",hora: "19:22",activo: "KANA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "675", fecha: "29/09/2021",hora: "19:21",activo: "KANA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "676", fecha: "29/09/2021",hora: "19:24",activo: "KANA",grupos: "FFVV",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "677", fecha: "29/09/2021",hora: "19:21",activo: "ORE",grupos: "FFVV",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "678", fecha: "29/09/2021",hora: "19:24",activo: "ORE",grupos: "FFVV",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "679", fecha: "29/09/2021",hora: "19:23",activo: "ORE",grupos: "FFVV",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "680", fecha: "29/09/2021",hora: "19:21",activo: "KANA",grupos: "FFVV",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "681", fecha: "29/09/2021",hora: "19:21",activo: "KANA",grupos: "FFVV",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "682", fecha: "29/09/2021",hora: "19:24",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "683", fecha: "29/09/2021",hora: "19:21",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "684", fecha: "29/09/2021",hora: "20:22",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
    { id: "685", fecha: "29/09/2021",hora: "21:20",activo: "PLAZA",grupos: "COORDINADO",cliente: "PLAZA",formulario: "PRECIOS Y PROMOCIONES",posicion: "-12.00,23.00",direccion: "-",lineal: "OSTER",retail: "PLAZA VEA" },
];


const paramTemplate = {
    method: "SP_SEL_TEMPLATE",
    data: { id_corporation: null, id_organization: null, status: 'ACTIVO' }
}

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
})
const FILTER = (filter) => ({
    method: "SP_DATABASE",
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

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}

const Linear_detail = () => {
    const classes = useStyles();
    const [waitFilter, setWaitFilter] = useState(false)
    const [dataGraph, setDataGraph] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchdone, setsearchdone] = useState(false)
    const [category, setcategory] = useState(null);

    const [disablebutton, setdisablebutton] = useState(true)
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
                Header: 'Hora',
                accessor: 'form_timestamp',
            },
            {
                Header: 'Retail',
                accessor: 'retail',
            },
            {
                Header: 'Tienda',
                accessor: 'poiname',
            },
            {
                Header: 'Marca',
                accessor: 'brand'
            },
            {
                Header: 'Categoría',
                accessor: 'category'
            },
            {
                Header: 'Modelo',
                accessor: 'model'
            },
            {
                Header: 'Precio regular',
                accessor: 'regular_price'
            },
            {
                Header: 'Precio promocional',
                accessor: 'prom_price'
            },
            {
                Header: 'Mecanica de la promocion',
                accessor: 'trading_option'
            },
            {
                Header: 'Foto',
                accessor: 'photo_url',
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Avatar src={props.cell.row.original.photo_url} />
                        </div>
                    )
                }
            },
            {
                Header: 'Nombre',
                accessor: 'name',
            },
            {
                Header: 'Dispositivo',
                accessor: 'device',
            },
            {
                Header: 'Posición',
                accessor: 'position',
            },
            {
                Header: 'Dirección',
                accessor: 'address',
            },
            {
                Header: 'ID',
                accessor: 'formid',
            },
        ],
        []
    );

    const [filters, setfilters] = useState({
        format: '',
        channel: '',
        department: '',
        store_name: '',
        categoria: 1,
        SKU: '',
        banda: '',
        marca: '',
        tipo_pvp: 'prom_price',
    })

    const [datafilters, setdatafilters] = useState({
        format: [],
        channel: [],
        department: [],
        store_name: [],
        categoria: [],
        SKU: [],
        banda: [],
        marca: [],
        tipo_pvp: [],
    })

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            // setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))
            const listResult = await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("format")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("channel")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("department")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("store_name")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY()),
                triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
            ]);
            setdatafilters({
                ...datafilters,
                channel: validateResArray(listResult[1], continuezyx),
                format: validateResArray(listResult[0], continuezyx),
                department: validateResArray(listResult[2], continuezyx),
                store_name: validateResArray(listResult[3], continuezyx),
                categoria: validateResArray(listResult[4], continuezyx),
                marca: validateResArray(listResult[5], continuezyx),
            })
        })();
        return () => continuezyx = false;
    }, [])
    useEffect(() => {
        if (waitFilter) {

        }
    }, [])
    async function filtrar() {
        setsearchdone(true)
        const filter_to_send = {
            format: filters.format,
            channel: filters.channel,
            department: filters.department,
            store_name: filters.store_name,
            category: filters.categoria,
            sku_code: filters.SKU,
            brand: filters.marca,
            sub_category: '',
            price: filters.tipo_pvp,
            from_date: dateRange[0].startDate.toISOString().substring(0, 10),
            to_date: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
        setDataGraph(listResult.result.data)
    }
    function descargar() {
        html2canvas(document.getElementById('divToPrint'))
            .then((canvas) => {
                const pdf = new jsPDF('l', 'mm', 'a4');
                var width = pdf.internal.pageSize.getWidth();
                var height = pdf.internal.pageSize.getHeight();
                pdf.addImage(canvas.toDataURL('image/png'), 'JPEG', 0, 0, width, height);
                pdf.save("download.pdf");
            })
    }

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
                        datatosend={datafilters.categoria}
                        optionvalue="category"
                        optiondesc="category"
                        variant="outlined"
                        namefield="category"
                        descfield="category"
                        callback={({ newValue: value }) => {
                            setfilters({ ...filters, categoria: value?.id_form || 1 });
                            setcategory(value)
                            setdisablebutton(!value)
                        }}
                    />
                    <RadioGroup row aria-label="tipo_pvp" name="row-radio-buttons-group"
                        defaultValue="prom_price"
                        onChange={(event) => { setfilters({ ...filters, tipo_pvp: event.target.value }) }}
                    >
                        <FormControlLabel value="todopvp" control={<Radio />} label="Todo PVP" />
                        <FormControlLabel value="prom_price" control={<Radio />} label="Promo PVP" />
                        <FormControlLabel value="regular_price" control={<Radio />} label="Regular PVP" />
                    </RadioGroup>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => filtrar()}
                        disabled={disablebutton}
                        startIcon={<SearchIcon style={{ color: '#FFF' }} />}
                    >Buscar</Button>
                    {searchdone &&
                        <Button
                            style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                            onClick={() => descargar()}
                            startIcon={<GetAppIcon style={{ color: '#FFF' }} />}
                        >Descargar</Button>
                    }
                    <Button
                        style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                        onClick={() => setDrawerOpen(true)}
                    >Filtros Extras</Button>
                    {category &&
                        <InputFormk
                            valuedefault={category?.last_consulted}
                            variant="outlined"
                            disabled={true}
                            label="Última Actualización"
                        />
                    }
                </div>
                {searchdone &&

                <div style={{ display: 'flex', gap: 8, width: "100%", overflow: "scroll", overflowY: "hidden" }} id="divToPrint">
                    <TableZyx
                        columns={columns}
                        data={dataGraph}
                        // fetchData={filtrar}
                        register={false}
                    />
                </div>
                }
            </div>



            <SwipeableDrawer
                anchor='right'
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOpen={() => setDrawerOpen(true)}
            >
                <div style={{ display: 'flex', width: 300, flexDirection: 'column', justifyContent: 'space-between', gap: 16, padding: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                        Filtros personalizados
                    </div>
                    <SelectFunction
                        title="Formato"
                        datatosend={datafilters.format}
                        optionvalue="format"
                        optiondesc="format"
                        variant="outlined"
                        valueselected={filters.format}
                        namefield="format"
                        descfield="format"
                        callback={({ newValue: value }) => setfilters({ ...filters, format: value?.format || '' })}
                    />
                    <SelectFunction
                        title="Canal"
                        datatosend={datafilters.channel}
                        optionvalue="channel"
                        optiondesc="channel"
                        variant="outlined"
                        namefield="channel"
                        valueselected={filters.channel}
                        descfield="channel"
                        callback={({ newValue: value }) => setfilters({ ...filters, channel: value?.channel || '' })}
                    />
                    <SelectFunction
                        title="Departamento"
                        datatosend={datafilters.department}
                        optionvalue="department"
                        optiondesc="department"
                        valueselected={filters.department}
                        variant="outlined"
                        namefield="department"
                        descfield="department"
                        callback={({ newValue: value }) => setfilters({ ...filters, department: value?.department || '' })}
                    />
                    <SelectFunction
                        title="PDV"
                        datatosend={datafilters.store_name}
                        optionvalue="store_name"
                        optiondesc="store_name"
                        variant="outlined"
                        valueselected={filters.store_name}
                        namefield="store_name"
                        descfield="store_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, store_name: value?.store_name || '' })}
                    />

                    <SelectFunction
                        title="SKU"
                        datatosend={[]}
                        optionvalue="id_role"
                        optiondesc="description"
                        variant="outlined"
                        namefield="id_role"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value?.id || '' })}
                    />
                    {/* <SelectFunction
                        title="Banda"
                        datatosend={[]}
                        optionvalue="id_role"
                        optiondesc="description"
                        variant="outlined"
                        namefield="id_role"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value?.id || '' })}
                    /> */}
                    <SelectFunction
                        title="Marca"
                        datatosend={datafilters.marca}
                        optionvalue="brand"
                        optiondesc="brand"
                        valueselected={filters.marca}
                        variant="outlined"
                        namefield="brand"
                        descfield="brand"
                        callback={({ newValue: value }) => setfilters({ ...filters, marca: value?.brand || '' })}
                    />
                </div>
            </SwipeableDrawer>
        </Layout>
    );
}

export default Linear_detail;