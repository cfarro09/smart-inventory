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

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';


const FILTERv2 = (filter, filters) => ({
    method: ["brand", "model", "sub_category"].includes(filter) ? "SP_ALL_FILTER_MASTER" : "SP_ALL_FILTER_DATA",
    data: {
        filter,
        format: filters?.format || "",
        channel: filters?.channel || "",
        department: filters?.department || "",
        store_name: filters?.store_name || "",
        category: filters?.categoria || 1,
        sku_code: filters?.SKU || "",
        brand: filters?.marca || "",
        sub_category: filters?.subcategoria || "",
        retail: filters?.retail || "",
        price: filters?.tipo_pvp || "",
    }
})

const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
        type: filter
    }
})
const GET_SUBCATEGORY = (id_form) => ({
    method: "SP_SUBCATEGORY_BYID",
    data: {
        id_form
    }
})


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
const GET_FILTERRETAIL = (filter, id_form) => ({
    method: "SP_FILTER_BYID",
    data: {
        filter,
        id_form
    }
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
    const { setLightBox, setOpenBackdrop } = useContext(popupsContext);
    const [disablebutton, setdisablebutton] = useState(true)
    const [subcategories, setsubcategories] = useState([]);

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
                accessor: 'regular_price',
                Cell: props => {
                    const price = props.cell.row.original.regular_price.toFixed(2);
                    return (
                        <div style={{ textAlign: 'right' }}>
                            {price}
                        </div>
                    )
                }
            },
            {
                Header: 'Precio promocional',
                accessor: 'prom_price',
                Cell: props => {
                    const price = props.cell.row.original.prom_price.toFixed(2);
                    return (
                        <div style={{ textAlign: 'right' }}>
                            {price}
                        </div>
                    )
                }
            },
            {
                Header: 'Variación precio',
                accessor: 'variation_price',
                Cell: props => {
                    const price = props.cell.row.original.variation_price.toFixed(2);
                    return (
                        <div style={{ textAlign: 'right' }}>
                            {price}
                        </div>
                    )
                }
            },
            {
                Header: 'Variación % precio',
                accessor: 'variation_percent_price',
                Cell: props => {
                    const price = props.cell.row.original.variation_percent_price.toFixed(2);
                    return (
                        <div style={{ textAlign: 'right' }}>
                            {price}%
                        </div>
                    )
                }
            },
            {
                Header: 'Mecanica de la promocion',
                accessor: 'trading_option'
            },
            {
                Header: 'Foto promoción',
                accessor: 'photo_url',
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Avatar
                                style={{ cursor: 'pointer' }}
                                src={props.cell.row.original.photo_url}
                                onClick={() => setLightBox({ open: true, index: 0, images: [props.cell.row.original.photo_url] })}
                            />
                        </div>
                    )
                }
            },
            {
                Header: 'Foto precargada',
                accessor: 'graphic',
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Avatar
                                style={{ cursor: 'pointer' }}
                                src={props.cell.row.original.graphic}
                                onClick={() => setLightBox({ open: true, index: 0, images: [props.cell.row.original.graphic] })}
                            />
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
        retail: '',
        subcategoria: '',
    })
    const [initial, setinitial] = useState(0);

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
        retail: [],
        subcategoria: [],
    })


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
            sub_category: filters.subcategoria,
            retail: filters.retail,
            price: filters.tipo_pvp,
            from_date: dateRange[0].startDate.toISOString().substring(0, 10),
            to_date: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        setOpenBackdrop(true)
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
        setOpenBackdrop(false)
        setDataGraph(listResult.result.data.map(x => {
            const regular_price = parseFloat(x.regular_price || "0");
            const prom_price = parseFloat(x.prom_price || "0");
            return {
                ...x,
                regular_price,
                prom_price,
                variation_price: prom_price == 0 ? 0 : prom_price - regular_price,
                variation_percent_price: prom_price == 0 ? 0 : ((prom_price / regular_price) * 100) - 100,
            }
        }))

    }

    
    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await applyfilter({}, true)
            setinitial(1)
        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        if (initial)
            applyfilter(filters)
    }, [filters])

    const applyfilter = async (fill, initial = false) => {
        console.log(fill?.category)
        fill.categoria = fill?.categoria || 1;
        const listResult = await Promise.all([
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("format", fill)),
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("channel", fill)),
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("retail", fill)),
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("brand", fill)),
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("model", fill)),
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("sub_category", fill)),
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("store_name", fill)),
            triggeraxios('post', process.env.endpoints.selsimple, FILTERv2("department", fill)),
            ...(initial ? [triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY("LINEAL"))] : []),
        ]);

        setdatafilters(x => ({
            ...x,
            format: validateResArray(listResult[0], true),
            channel: validateResArray(listResult[1], true),
            retail: validateResArray(listResult[2], true),
            marca: validateResArray(listResult[3], true),
            SKU: validateResArray(listResult[4], true),
            subcategoria: validateResArray(listResult[5], true),
            store_name: validateResArray(listResult[6], true),
            department: validateResArray(listResult[7], true),
            categoria: initial ? validateResArray(listResult[8], true) : x.categoria,
        }))
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
                        onlyinitial={true}
                        title="Categoria"
                        classname={classes.itemFilter}
                        datatosend={datafilters.categoria}
                        optionvalue="category"
                        optiondesc="category"
                        variant="outlined"
                        namefield="category"
                        descfield="category"
                        callback={({ newValue: value }) => {
                            // getSubctegories(value?.id_form)
                            setfilters({ ...filters, categoria: value?.id_form || 1 });
                            setcategory(value)
                            setdisablebutton(!value)
                            // updatelistretail(value?.id_form || 1)
                        }}
                    />
                    <SelectFunction
                        onlyinitial={true}
                        title="Marca"
                        datatosend={datafilters.marca}
                        optionvalue="brand"
                        optiondesc="brand"
                        valueselected={filters.marca}
                        variant="outlined"
                        namefield="brand"
                        descfield="brand"
                        style={{ width: "150px" }}
                        callback={({ newValue: value }) => setfilters({
                            ...filters, department: '',
                            store_name: '',
                            SKU: '',
                            retail: '', marca: value?.brand || ''
                        })}
                    />

                    <SelectFunction
                        onlyinitial={true}
                        title="SKU"
                        datatosend={datafilters.SKU}
                        optionvalue="model"
                        optiondesc="model"
                        valueselected={filters.SKU}
                        variant="outlined"
                        namefield="model"
                        descfield="model"
                        style={{ width: "200px" }}
                        callback={({ newValue: value }) => setfilters({ ...filters, SKU: value?.model || '' })}
                    />
                    <SelectFunction
                        onlyinitial={true}
                        title="Retail"
                        variant="outlined"
                        datatosend={datafilters.retail}
                        optionvalue="retail"
                        optiondesc="retail"
                        valueselected={filters.retail}
                        namefield="retail"
                        descfield="retail"
                        style={{ width: "200px" }}
                        callback={({ newValue: value }) => setfilters({ ...filters, retail: value?.retail || '' })}
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

                    <Button
                        style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                        onClick={() => setDrawerOpen(true)}
                    >Filtros Extras</Button>
                    <Button
                        style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                        onClick={() => applyfilter({})}
                    >Limpiar filtros</Button>
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

                    <div id="divToPrint">
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
                        onlyinitial={true}
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
                        onlyinitial={true}
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
                        onlyinitial={true}
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
                        onlyinitial={true}
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
                        onlyinitial={true}
                        title="Subcategoría"
                        datatosend={datafilters.subcategoria}
                        optionvalue="subcategory"
                        optiondesc="subcategory"
                        variant="outlined"
                        namefield="subcategory"
                        descfield="subcategory"
                        callback={({ newValue: value }) => {
                            setfilters({ ...filters, subcategoria: value?.subcategory || "" });
                        }}
                    />
                    {/* <SelectFunction
                        onlyinitial={true}
                        title="Banda"
                        datatosend={[]}
                        optionvalue="id_role"
                        optiondesc="description"
                        variant="outlined"
                        namefield="id_role"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value?.id || '' })}
                    /> */}
                </div>
            </SwipeableDrawer>
        </Layout>
    );
}

export default Linear_detail;