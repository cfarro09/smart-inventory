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

const brands = ["IMACO", "B&D", "BLACKLINE", "BORD", "BOSCH", "BOSSKO", "CONTINENTAL", "CUISINART", "ELECTRICLIFE", "ELECTROLUX", "FINEZZA", "FOSTERIER", "HOLSTEIN", "INDURAMA", "JATARIY", "KENWOOD", "KITCHEN AID", "KORKMAZ", "LOVEN", "MAGEFESA", "MIRAY", "NEX", "OSTER", "PHILIPS", "PRACTIKA", "PRIMA", "PROFESIONAL SERIES", "RECCO", "RECORD", "TAURUS", "THOMAS", "VALESKA", "WURDEN", "ZYKLON", "OTROS", "DOLCE GUSTO", "LUMIKA", "INSTANTPOT", "WINIA", "SMEG", "KENT", "DELONGHI", "SEVERIN", "MIDIA", "FDV", "DAEWOO"]
const colors = ["#FFD600", "#bababa", "#26A69A", "#009688", "#4f4f4f", "#909090", "#c4c4c4", "#9d9d9d", "#494949", "#b9b9b9", "#545454", "#5e5e5e", "#00897B", "#b8b8b8", "#a2a2a2", "#808080", "#4527A0", "#8a8a8a", "#00695C", "#b5b5b5", "#4DB6AC", "#00796B", "#0c4da2", "#c5c5c5", "#1e1e1e", "#7c7c7c", "#787878", "#B2DFDB", "#444444", "#d3d3d3", "rgb(251, 95, 95)", "#a9a9a9", "#80CBC4", "#797979", "#5D4037", "#323232", "#7d7d7d", "#bababa", "#2c2c2c", "#828282", "#6d6d6d", "#757575", "#929292", "#6d6d6d", "#6f6f6f", "#bababa"]
const elementBrand = (week) => ({
    week: week,
    "IMACO": 0,
    "B&D": 0,
    "BLACKLINE": 0,
    "BORD": 0,
    "BOSCH": 0,
    "BOSSKO": 0,
    "CONTINENTAL": 0,
    "CUISINART": 0,
    "ELECTRICLIFE": 0,
    "ELECTROLUX": 0,
    "FINEZZA": 0,
    "FOSTERIER": 0,
    "HOLSTEIN": 0,
    "INDURAMA": 0,
    "JATARIY": 0,
    "KENWOOD": 0,
    "KITCHEN AID": 0,
    "KORKMAZ": 0,
    "LOVEN": 0,
    "MAGEFESA": 0,
    "MIRAY": 0,
    "NEX": 0,
    "OSTER": 0,
    "PHILIPS": 0,
    "PRACTIKA": 0,
    "PRIMA": 0,
    "PROFESIONAL SERIES": 0,
    "RECCO": 0,
    "RECORD": 0,
    "TAURUS": 0,
    "THOMAS": 0,
    "VALESKA": 0,
    "WURDEN": 0,
    "ZYKLON": 0,
    "OTROS": 0,
    "DOLCE GUSTO": 0,
    "LUMIKA": 0,
    "INSTANTPOT": 0,
    "WINIA": 0,
    "SMEG": 0,
    "KENT": 0,
    "DELONGHI": 0,
    "SEVERIN": 0,
    "MIDIA": 0,
    "FDV": 0,
    "DAEWOO": 0
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

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
})
const FILTER = (filter) => ({
    method: "SP_SKU_BRAND",
    data: filter
})
const FILTERPOI = (filter) => ({
    method: "SP_SKU_POINAME",
    data: filter
})
const FILTERDATE = (filter) => ({
    method: "SP_SKU_DATE",
    data: filter
})
const FILTERGraph1 = (filter) => ({
    method: "SP_SKU_CATEGORY",
    data: filter
})



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

    table: {
        minWidth: 200,
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
    ulist: {
        padding: "0px",
        margin: "0px",
        textAlign: "center",
        paddingBottom: "5px"
    },
    lilist: {
        display: "inline-block",
        marginRight: "10px",
    },
    svgstyle: {
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: "4px",
    }
}));

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}
const GET_FILTERRETAIL = (filter, id_form) => ({
    method: "SP_FILTER_BYID",
    data: {
        filter,
        id_form
    }
})

var curr = new Date; // get current date
var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
var last = first + 7; // last day is the first day + 6

var firstday = new Date(curr.setDate(first));
var lastday = new Date(curr.setDate(last));

const Share_by_brand = () => {
    const classes = useStyles();
    const [dataGraph, setDataGraph] = useState([])
    const [orderbrandsDate, setorderbrandsDate] = useState([])
    const [orderbrandsSKU, setorderbrandsSKU] = useState([])
    const [orderbrandspoi, setorderbrandspoi] = useState([])
    const [dataGraphDate, setDataGraphDate] = useState([])
    const [categorybrandSKU, setcategorybrandSKU] = useState([])
    const [categorybrandSKUperc, setcategorybrandSKUperc] = useState([])
    const [poicategory, setpoicategory] = useState([])
    const [poicategoryperc, setpoicategoryperc] = useState([])
    const [totalSKA, settotalSKA] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchdone, setsearchdone] = useState(false)
    const [category, setcategory] = useState(null);
    const { setLightBox, setOpenBackdrop } = React.useContext(popupsContext);
    const [subcategories, setsubcategories] = useState([]);

    const [disablebutton, setdisablebutton] = useState(true)
    const [dateRange, setdateRange] = useState([
        {
            startDate: firstday,
            endDate: lastday,
            key: 'selection'
        }
    ]);

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
    const [initial, setinitial] = useState(0);

    useEffect(() => {
        if (initial === 1) {
            filtrar()
        }
    }, [initial])
    useEffect(() => {
        let continuezyx = true;
        (async () => {
            // setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))
            const listResult = await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("format")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("channel")),
                // triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("department")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY("LINEAL")),
                // triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
                // triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("sub_category")),
            ]);

            setdatafilters({
                // ...datafilters,
                format: validateResArray(listResult[0], continuezyx),
                channel: validateResArray(listResult[1], continuezyx),
                categoria: validateResArray(listResult[2], continuezyx),
                // department: validateResArray(listResult[2], continuezyx),
                // marca: validateResArray(listResult[4], continuezyx),
                // subcategoria: validateResArray(listResult[5], continuezyx),
            })
            setinitial(1)
        })();
        return () => continuezyx = false;
    }, [])

    async function updatelistretail(id_form) {
        const listResult = await Promise.all([
            triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("retail", id_form)),
            triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("store_name", id_form)),
            triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("model", id_form)),
            triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
        ]);

        setfilters({
            ...filters,
            format: '',
            department: '',
            store_name: '',
            SKU: '',
            marca: '',
            retail: '',
            categoria: id_form
        });

        setdatafilters({
            ...datafilters,
            retail: validateResArray(listResult[0], true),
            store_name: validateResArray(listResult[1], true),
            SKU: validateResArray(listResult[2], true),
            marca: validateResArray(listResult[3], true),
        })
    }

    const getSubctegories = (id_form) => {
        triggeraxios('post', process.env.endpoints.selsimple, GET_SUBCATEGORY(id_form)).then(x => {
            setsubcategories(validateResArray(x, true))
        })
    }

    const cleanfilters = async () => {
        triggeraxios('post', process.env.endpoints.selsimple, GET_SUBCATEGORY(category?.id_form || 1)).then(x => {
            setsubcategories(validateResArray(x, true))
        })
        const listResult = await Promise.all([
            triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("retail", category?.id_form || 1)),
            triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("store_name", category?.id_form || 1)),
            triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("model", category?.id_form || 1)),
            triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
        ]);


        setfilters({
            ...filters,
            format: '',
            department: '',
            store_name: '',
            SKU: '',
            marca: '',
            retail: '',
            categoria: category?.id_form || 1
        });

        setdatafilters({
            ...datafilters,
            retail: validateResArray(listResult[0], true),
            store_name: validateResArray(listResult[1], true),
            SKU: validateResArray(listResult[2], true),
            marca: validateResArray(listResult[3], true),
        })
    }

    async function filtrar() {
        setsearchdone(true)
        let count = 0;
        const filter_to_send = {
            format: filters.format,
            channel: filters.channel,
            department: filters.department,
            store_name: filters.store_name,
            category: filters.categoria,
            sku_code: filters.SKU,
            brand: filters.marca,
            sub_category: filters.subcategoria,
            price: filters.tipo_pvp,
            retail: filters.retail,
            from_date: dateRange[0].startDate.toISOString().substring(0, 10),
            to_date: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        setOpenBackdrop(true)
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
        
        listResult.result.data.forEach((row) => {
            count += row.cont
        })
        const dd = listResult.result.data.map(x => ({
            ...x,
            percent: (x.cont / count) * 100,
        }))
        setDataGraph(dd)
        const listResultDate = await triggeraxios('post', process.env.endpoints.selsimple, FILTERDATE(filter_to_send))
        let listbrand = [];
        let brandlist = [];
        let weeks = [];
        let totalweek = [];
        let countbrand = new Array(49).fill(0);

        listResultDate.result.data.map(row => {
            if (!weeks.includes(row.Week)) { weeks.push(row.Week); totalweek.push(0) }
            if (!brandlist.includes(row.brand)) brandlist.push(row.brand)
        })
        listResultDate.result.data.map(row => {
            totalweek[weeks.indexOf(row.Week)] += parseInt(row.cnt)
            countbrand[brands.indexOf(row.brand)] += parseInt(row.cnt)
        })
        weeks.map(row => {
            listbrand.push(elementBrand(row))
        })
        function compare(a, b) {
            if (countbrand[brands.indexOf(a)] < countbrand[brands.indexOf(b)]) {
                return -1;
            }
            if (countbrand[brands.indexOf(a)] > countbrand[brands.indexOf(b)]) {
                return 1;
            }
            return 0;
        }
        brandlist.sort(compare);
        setorderbrandsDate(brandlist)
        listResultDate.result.data.map(row => {
            listbrand.forEach(list => {
                if (list.week === row.Week) {
                    list[row.brand] = ((parseInt(row.cnt) / totalweek[weeks.indexOf(row.Week)]) * 100)
                }
            })
        })
        setDataGraphDate(listbrand)
        settotalSKA(count)

        const listResultSKU = await triggeraxios('post', process.env.endpoints.selsimple, FILTERGraph1(filter_to_send))
        let categories = []
        let skucategory = [];
        let brandlistSKU = [];
        let skucategoryperc = [];
        let skucategorytotal = [];
        let countbrandSKU = new Array(49).fill(0);
        listResultSKU.result.data.map(row => {
            if (!categories.includes(row.subcategory)) { categories.push(row.subcategory); skucategorytotal.push(0) }
            if (!brandlistSKU.includes(row.brand)) brandlistSKU.push(row.brand)
        })
        listResultSKU.result.data.map(row => {
            skucategorytotal[categories.indexOf(row.subcategory)] += parseInt(row.cont)
            countbrandSKU[brands.indexOf(row.brand)] += parseInt(row.cont)
        })
        categories.map(row => {
            skucategory.push(elementBrand(row))
            skucategoryperc.push(elementBrand(row))
        })
        listResultSKU.result.data.map(row => {
            skucategory.forEach(list => {
                if (list.week === row.subcategory) {
                    list[row.brand] = parseInt(row.cont)
                }
            })
            skucategoryperc.forEach(list => {
                if (list.week === row.subcategory) {
                    list[row.brand] = ((parseInt(row.cont) / skucategorytotal[categories.indexOf(row.subcategory)]) * 100)
                }
            })
        })
        function compareSKU(a, b) {
            if (countbrandSKU[brands.indexOf(a)] < countbrandSKU[brands.indexOf(b)]) {
                return -1;
            }
            if (countbrandSKU[brands.indexOf(a)] > countbrandSKU[brands.indexOf(b)]) {
                return 1;
            }
            return 0;
        }
        brandlistSKU.sort(compareSKU);
        setorderbrandsSKU(brandlistSKU)
        setcategorybrandSKU(skucategory)
        setcategorybrandSKUperc(skucategoryperc)


        const listpoiresult = await triggeraxios('post', process.env.endpoints.selsimple, FILTERPOI(filter_to_send))
        let categoriespoi = []
        let poicategories = [];
        let poicategoriesperc = [];
        let brandlistpoi = [];
        let poicategoriestotal = [];
        let countbrandpoi = new Array(49).fill(0);
        listpoiresult.result.data.map(row => {
            if (!categoriespoi.includes(row.retail)) { categoriespoi.push(row.retail); poicategoriestotal.push(0) }
            if (!brandlistpoi.includes(row.brand)) brandlistpoi.push(row.brand)
        })
        listpoiresult.result.data.map(row => {
            poicategoriestotal[categoriespoi.indexOf(row.retail)] += parseInt(row.cont)
            countbrandpoi[brands.indexOf(row.brand)] += parseInt(row.cont)
        })
        categoriespoi.map(row => {
            poicategories.push(elementBrand(row))
            poicategoriesperc.push(elementBrand(row))
        })
        listpoiresult.result.data.map(row => {
            poicategories.forEach(list => {
                if (list.week === row.retail) {
                    list[row.brand] = parseInt(row.cont)
                }
            })
            poicategoriesperc.forEach(list => {
                if (list.week === row.retail) {
                    list[row.brand] = ((parseInt(row.cont) / poicategoriestotal[categoriespoi.indexOf(row.retail)]) * 100)
                }
            })
        })
        function comparepoi(a, b) {
            if (countbrandpoi[brands.indexOf(a)] < countbrandpoi[brands.indexOf(b)]) {
                return -1;
            }
            if (countbrandpoi[brands.indexOf(a)] > countbrandpoi[brands.indexOf(b)]) {
                return 1;
            }
            return 0;
        }
        brandlistpoi.sort(comparepoi);
        setorderbrandspoi(brandlistpoi)
        setpoicategory(poicategories)
        setpoicategoryperc(poicategoriesperc)
        setOpenBackdrop(false)

        const datatofiltro = await triggeraxios('post', process.env.endpoints.selsimple, {
            method: "SP_DATABASE",
            data: filter_to_send
        })
        const tlistskus = Array.from(new Set(datatofiltro.result.data.map(x => x.model)));
        const tlistbrand = Array.from(new Set(datatofiltro.result.data.map(x => (x.brand || "").trim())));
        const tlistdepartment = Array.from(new Set(datatofiltro.result.data.map(x => x.department)));
        const tlistretail = Array.from(new Set(datatofiltro.result.data.map(x => x.retail)));
        const tliststore_name = Array.from(new Set(datatofiltro.result.data.map(x => x.store_name)));

        setdatafilters({
            ...datafilters,
            SKU: tlistskus.filter(x => !!x).map(x => ({ model: x })),
            brand: tlistbrand.filter(x => !!x).map(x => ({ brand: x })),
            marca: tlistbrand.filter(x => !!x).map(x => ({ brand: x })),
            department: tlistdepartment.filter(x => !!x).map(x => ({ department: x })),
            retail: tlistretail.filter(x => !!x).map(x => ({ retail: x })),
            store_name: tliststore_name.filter(x => !!x).map(x => ({ store_name: x })),
        })
    }
    function descargar() {
        html2canvas(document.getElementById('divToPrint'))
            .then((canvas) => {
                const pdf = new jsPDF('p', 'px', [1480, 2100]);
                var width = pdf.internal.pageSize.getWidth();
                var height = pdf.internal.pageSize.getHeight();
                pdf.addImage(canvas.toDataURL('image/png'), 'JPEG', 0, 0, width, height);
                pdf.save("download.pdf");
            })
    }

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className={classes.ulist}>
                {
                    payload.reverse().map((entry, index) => (
                        <li key={`item-${index}`} className={classes.lilist}>
                            <svg width="14" height="14" viewBox="0 0 32 32" version="1.1" className={classes.svgstyle}>
                                <path stroke="none" fill={entry.color} d="M0,4h32v24h-32z" ></path></svg>
                            <span >{entry.value}</span>
                        </li>
                    ))
                }
            </ul>
        );
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
                        optionvalue="id_form"
                        optiondesc="category"
                        variant="outlined"
                        namefield="category"
                        descfield="category"
                        valueselected={filters.categoria}
                        callback={({ newValue: value }) => {
                            
                            setdisablebutton(!value)
                            if (value?.id_form) {
                                setcategory(value)
                                getSubctegories(value?.id_form)
                                // setfilters({ ...filters, categoria: value?.id_form || 1 });
                                updatelistretail(value?.id_form || 1)
                            }
                        }}
                    />
                    <SelectFunction
                        title="Marca"
                        datatosend={datafilters.marca}
                        optionvalue="brand"
                        optiondesc="brand"
                        valueselected={filters.marca}
                        variant="outlined"
                        namefield="brand"
                        descfield="brand"
                        style={{ width: "150px" }}
                        callback={({ newValue: value }) => setfilters({ ...filters, department: '',
                        store_name: '',
                        SKU: '',
                        retail: '', marca: value?.brand || '' })}
                    />

                    <SelectFunction
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
                    <Button
                        style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                        onClick={cleanfilters}
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

                    <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }} id="divToPrint">
                        <div className={classes.replacerowzyx}>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE SKUS POR MARCA EN UNIDADES</div>
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell align="center">N° SKU's</TableCell>
                                                <TableCell align="center">Partic %</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                dataGraph.map((row, i) =>
                                                (<TableRow key={`${row.brand}-${i}`} >
                                                    <TableCell style={{ padding: 5 }} align="center">{row.brand}</TableCell>
                                                    <TableCell style={{ padding: 5 }} align="center">{row.cont}</TableCell>
                                                    <TableCell style={{ padding: 5 }} align="center">{parseFloat(row.percent).toFixed(2)}%</TableCell>
                                                </TableRow>))
                                            }
                                            <TableRow>
                                                <TableCell align="center"></TableCell>
                                                <TableCell align="center">{totalSKA}</TableCell>
                                                <TableCell align="center">100%</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE SKUS POR MARCA POR SEMANA EN PORCENTAJE</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.5}>
                                    <BarChart data={dataGraphDate}>
                                        <XAxis dataKey="week" />
                                        <YAxis domain={[0, 100]} allowDecimals={false} allowDataOverflow={true} />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip
                                            itemSorter={item => -(item.value)}
                                            labelFormatter={(value) => [<b>Semana {value}</b>]}
                                            formatter={(value, name) => [value.toFixed(2) + " %", name]}
                                        />
                                        {
                                            orderbrandsDate.map((brand) => {
                                                return (
                                                    <Bar
                                                        key={`cantskus${brand}`}
                                                        type="monotone"
                                                        dataKey={brand}
                                                        stackId="a"
                                                        fill={colors[brands.indexOf(brand)]}
                                                        label={{ content: () => brand, className: brand === "OSTER" ? "textwhite" : undefined }}
                                                    />
                                                )
                                            })
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>


                        </div>
                        <div className={classes.replacerowzyx}>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE SKUS POR MARCA Y CATEGORÍA EN UNIDADES</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={categorybrandSKU} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis />
                                        <Tooltip itemSorter={item => -(orderbrandsSKU.indexOf(item.dataKey))} />
                                        <CartesianGrid />
                                        {
                                            orderbrandsSKU.map((brand, i) => (
                                                <Bar key={`marcC${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE SKUS POR MARCA Y CATEGORÍA EN PORCENTAJE</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={categorybrandSKUperc} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis domain={[0, 100]} allowDecimals={false} allowDataOverflow={true} />
                                        <Tooltip itemSorter={item => -(orderbrandsSKU.indexOf(item.dataKey))} formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        <CartesianGrid />
                                        {
                                            orderbrandsSKU.map((brand, i) => (
                                                <Bar key={`marcCperc${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                        </div>
                        <div className={classes.replacerowzyx}>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE SKUS POR MARCA Y CADENA EN UNIDADES</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={poicategory} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis />
                                        <Tooltip itemSorter={item => -(orderbrandspoi.indexOf(item.dataKey))} />
                                        <CartesianGrid />
                                        {
                                            orderbrandspoi.map((brand, i) => (
                                                <Bar key={`marcpoi${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE SKUS POR MARCA Y CADENA EN PORCENTAJE</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={poicategoryperc} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis domain={[0, 100]} allowDecimals={false} allowDataOverflow={true} />
                                        <Tooltip itemSorter={item => -(orderbrandspoi.indexOf(item.dataKey))} formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        <CartesianGrid />
                                        {
                                            orderbrandspoi.map((brand, i) => (
                                                <Bar key={`marcpoiperc${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                        </div>
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
                        title="Subcategoría"
                        datatosend={subcategories}
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

export default Share_by_brand;