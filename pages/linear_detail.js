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


const FILTERv2 = (filter, filters) => ({
    method: ["brand", "model", "sub_category"].includes(filter) ? "SP_ALL_FILTER_MASTER" : "SP_ALL_FILTER_DATA",
    data: {
        filter,
        format: "", //filters?.format || "",
        channel: "",//filters?.channel || "",
        department: "", //filters?.department || "",
        store_name: "", //filters?.store_name || "",
        category: filters?.categoria || 1,
        sku_code: filters?.SKU || "",
        brand: filters?.marca || "",
        sub_category: "", //filters?.subcategoria || "",
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

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}

const Linear_detail = () => {
    const classes = useStyles();
    const [dataGraph, setDataGraph] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchdone, setsearchdone] = useState(false)
    const [category, setcategory] = useState(null);
    const [categorydate, setcategorydate] = useState(null);
    const { setLightBox, setOpenBackdrop } = useContext(popupsContext);
    const [disablebutton, setdisablebutton] = useState(true)
    const [cleanFilter, setcleanFilter] = useState(false);
    const [stopFilter, setstopFilter] = useState(-1);
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
                Header: 'Subcategoría',
                accessor: 'subcategory'
            },
            {
                Header: 'Modelo',
                accessor: 'model'
            },
            {
                Header: 'Nombre',
                accessor: 'user_name'
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
        categoria: "1",
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
        applyfilter(filters, true)
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
        (async () => {
            await applyfilter({}, true)
            setinitial(1)
        })();
    }, [])

    useEffect(() => {
        // if (initial)
        //     applyfilter(filters)
    }, [filters])

    const applyfilter = async (fill, initial = false) => {
        fill.categoria = fill?.categoria || 1;
        setOpenBackdrop(true);
        const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
            FILTERv2("format", fill.last === "format" ? { ...fill, format: "" } : fill),
            FILTERv2("channel", fill.last === "channel" ? { ...fill, channel: "" } : fill),
            FILTERv2("retail", fill.last === "retail" ? { ...fill, retail: "" } : fill),
            FILTERv2("brand", fill.last === "brand" ? { ...fill, marca: "" } : { ...fill, retail: '', sku_code: '' }),
            FILTERv2("model", fill.last === "model" ? { ...fill, SKU: "" } : fill),
            FILTERv2("sub_category", fill.last === "sub_category" ? { ...fill, sub_category: "" } : fill),
            FILTERv2("store_name", fill.last === "store_name" ? { ...fill, store_name: "" } : fill),
            FILTERv2("department", fill.last === "department" ? { ...fill, department: "" } : fill),
            ...(initial ? [GET_CATEGORY("LINEAL")] : [])
        ])
        if (resultMulti.result instanceof Array) {
            const resarray = resultMulti.result;
            setdatafilters(x => ({
                ...x,
                format: resarray[0]?.success ? resarray[0].data : [],
                channel: resarray[1]?.success ? resarray[1].data : [],
                retail: resarray[2]?.success ? resarray[2].data : [],
                marca: resarray[3]?.success ? resarray[3].data : [],
                SKU: resarray[4]?.success ? resarray[4].data : [],
                subcategoria: resarray[5]?.success ? resarray[5].data : [],
                store_name: resarray[6]?.success ? resarray[6].data : [],
                department: resarray[7]?.success ? resarray[7].data : [],
                categoria: initial ? (resarray[8]?.success ? resarray[8].data : []) : x.categoria,
            }));
        }
        setstopFilter(stopFilter * -1);
        setOpenBackdrop(false)
    }

    useEffect(() => {
        setcleanFilter(false);
    }, [stopFilter])

    useEffect(() => {
        if (cleanFilter) {
            setfilters({
                format: '',
                channel: '',
                department: '',
                store_name: '',
                categoria: "1",
                SKU: '',
                banda: '',
                marca: '',
                tipo_pvp: 'prom_price',
                retail: '',
                subcategoria: '',
            })
        }
    }, [cleanFilter])
    console.log("categorycategory", category)
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
                    <MultiSelectFunction
                        title="Categoria"
                        classname={classes.itemFilter}
                        datatosend={datafilters.categoria}
                        optionvalue="id_form"
                        optiondesc="category"
                        variant="outlined"
                        onlyinitial={!cleanFilter}
                        namefield="id_form"
                        descfield="category"
                        valueselected={filters.categoria + ""}
                        callback={(values) => {
                            console.log(values)
                            if (!cleanFilter) {
                                setfilters({ ...filters, categoria: values.map(x => x.id_form).join(',') });
                                setcategory(values.map(x => x.id_form).join(','))
                                setcategorydate(values.map(x => x.last_consulted).join(','))
                                setdisablebutton(!values)
                            }
                        }}
                    />
                    <MultiSelectFunction
                        title="Marca"
                        datatosend={datafilters.marca}
                        optionvalue="brand"
                        classname={classes.itemFilter}
                        optiondesc="brand"
                        onlyinitial={!cleanFilter}
                        variant="outlined"
                        valueselected={filters.marca ? filters.marca.replace(/'/gi, "") : ""}
                        namefield="brand"
                        descfield="brand"
                        style={{ width: "150px" }}
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({
                                    ...filters,
                                    department: '',
                                    store_name: '',
                                    SKU: '',
                                    retail: '',
                                    last: 'brand',
                                    marca: values.map(x => `'${x.brand}'`).join(',')
                                })
                            }
                        }}
                    />

                    <MultiSelectFunction
                        onlyinitial={!cleanFilter}
                        classname={classes.itemFilter}
                        title="SKU"
                        datatosend={datafilters.SKU}
                        optionvalue="model"
                        optiondesc="model"
                        valueselected={filters.SKU ? filters.SKU.replace(/'/gi, "") : ""}
                        variant="outlined"
                        namefield="model"
                        descfield="model"
                        style={{ width: "200px" }}
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({
                                    ...filters,
                                    last: 'model',
                                    SKU: values.map(x => `'${x.model}'`).join(','),
                                })
                            }
                        }}
                    />
                    <MultiSelectFunction
                        onlyinitial={!cleanFilter}
                        classname={classes.itemFilter}
                        title="Retail"
                        variant="outlined"
                        datatosend={datafilters.retail}
                        optionvalue="retail"
                        optiondesc="retail"
                        valueselected={filters.retail ? filters.retail.replace(/'/gi, "") : ""}
                        namefield="retail"
                        descfield="retail"
                        style={{ width: "200px" }}
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({
                                    ...filters,
                                    retail: values.map(x => `'${x.retail}'`).join(','),
                                    last: 'retail'
                                })
                            }
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

                    <Button
                        style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                        onClick={() => setDrawerOpen(true)}
                    >Filtros Extras</Button>
                    <Button
                        style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                        onClick={() => {
                            setcleanFilter(true)
                        }}
                    >Limpiar filtros</Button>
                    {category &&
                        <InputFormk
                            valuedefault={categorydate}
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
                    <MultiSelectFunction
                        onlyinitial={!cleanFilter}
                        classname={classes.itemFilter1}
                        title="Formato"
                        datatosend={datafilters.format}
                        optionvalue="format"
                        optiondesc="format"
                        variant="outlined"
                        valueselected={filters.format.replace(/'/gi, "")}
                        namefield="format"
                        descfield="format"
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, last: "format", format: values.map(x => `'${x.format}'`).join(",") })
                            }
                        }}
                    />
                    <MultiSelectFunction
                        onlyinitial={!cleanFilter}
                        classname={classes.itemFilter1}
                        title="Canal"
                        datatosend={datafilters.channel}
                        optionvalue="channel"
                        optiondesc="channel"
                        variant="outlined"
                        namefield="channel"
                        valueselected={filters.channel.replace(/'/gi, "")}
                        descfield="channel"
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, last: "channel", channel: values.map(x => `'${x.channel}'`).join(",") })
                            }
                        }}
                    />
                    <MultiSelectFunction
                        onlyinitial={!cleanFilter}
                        classname={classes.itemFilter1}
                        title="Departamento"
                        datatosend={datafilters.department}
                        optionvalue="department"
                        optiondesc="department"
                        valueselected={filters.department.replace(/'/gi, "")}
                        variant="outlined"
                        namefield="department"
                        descfield="department"
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, last: "department", department: values.map(x => `'${x.department}'`).join(",") })
                            }
                        }}
                    />
                    <MultiSelectFunction
                        onlyinitial={!cleanFilter}
                        classname={classes.itemFilter1}
                        title="PDV"
                        datatosend={datafilters.store_name}
                        optionvalue="store_name"
                        optiondesc="store_name"
                        variant="outlined"
                        valueselected={filters.store_name.replace(/'/gi, "")}
                        namefield="store_name"
                        descfield="store_name"
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, last: "store_name", store_name: values.map(x => `'${x.store_name}'`).join(",") })
                            }
                        }}
                    />
                    <MultiSelectFunction
                        onlyinitial={!cleanFilter}
                        classname={classes.itemFilter1}
                        title="Subcategoría"
                        datatosend={datafilters.subcategoria}
                        optionvalue="subcategory"
                        optiondesc="subcategory"
                        valueselected={filters.subcategoria.replace(/'/gi, "")}
                        variant="outlined"
                        namefield="subcategory"
                        descfield="subcategory"
                        callback={(values) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, last: "subcategoria", subcategoria: values.map(x => `'${x.subcategory}'`).join(",") });
                            }
                        }}
                    />
                    {/* <SelectFunction
                        onlyinitial={!cleanFilter}
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