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

const brands = ["IMACO", "B&D", "BLACKLINE", "BORD", "BOSCH", "BOSSKO", "CONTINENTAL", "CUISINART", "ELECTRICLIFE", "ELECTROLUX", "FINEZZA", "FOSTERIER", "HOLSTEIN", "INDURAMA", "JATARIY", "KENWOOD", "KITCHEN AID", "KORKMAZ", "LOVEN", "MAGEFESA", "MIRAY", "NEX", "OSTER", "PHILIPS", "PRACTIKA", "PRIMA", "PROFESIONAL SERIES", "RECCO", "RECORD", "TAURUS", "THOMAS", "VALESKA", "WURDEN", "ZYKLON", "OTROS", "DOLCE GUSTO", "LUMIKA", "INSTANTPOT","WINIA","SMEG","KENT","DELONGHI","SEVERIN","MIDIA","FDV","DAEWOO"]
const colors = ["#FFD600", "#bababa", "#26A69A", "#009688", "#4f4f4f", "#909090", "#c4c4c4", "#9d9d9d", "#494949", "#b9b9b9", "#545454", "#5e5e5e", "#00897B", "#b8b8b8", "#a2a2a2", "#808080", "#4527A0", "#8a8a8a", "#00695C", "#b5b5b5", "#4DB6AC", "#00796B", "#0c4da2", "#c5c5c5", "#1e1e1e", "#7c7c7c", "#787878", "#B2DFDB", "#444444", "#d3d3d3", "#fb5f5f", "#a9a9a9", "#80CBC4", "#797979", "#5D4037", "#323232", "#7d7d7d", "#bababa", "#2c2c2c", "#828282", "#6d6d6d", "#757575", "#929292", "#6d6d6d", "#6f6f6f", "#bababa"]
const elementBrand = (week) => ({
    week: week,
    "IMACO":0,
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
const FILTERWARBOARD = (filter) => ({
    method: "SP_WARBOARD_NEW_PRODUCTS",
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

const New_Products = () => {
    const classes = useStyles();
    const [dataGraph, setDataGraph] = useState([])
    const [orderbrandsDate, setorderbrandsDate] = useState([])
    const [orderbrandsSKU, setorderbrandsSKU] = useState([ "BOSCH", "IMACO", "OSTER", "PHILIPS", "PRACTIKA", "RECCO", "TAURUS", "THOMAS"])
    const [orderbrandspoi, setorderbrandspoi] = useState([])
    const [dataGraphDate, setDataGraphDate] = useState(
        [
            {
                week: "Licuadora",
                BOSCH: 3,
                IMACO: 3,
                OSTER: 4,
                PHILIPS: 3,
                PRACTIKA: 3,
                RECCO: 1,
                TAURUS: 3,
                THOMAS: 2
            },  
            {
                week: "Arrocera",
                BOSCH: 0,
                IMACO: 1,
                OSTER: 4,
                PHILIPS: 1,
                PRACTIKA: 1,
                RECCO: 1,
                TAURUS: 2,
                THOMAS: 2
            },  
            {
                week: "Freidora",
                BOSCH: 3,
                IMACO: 2,
                OSTER: 1,
                PHILIPS: 1,
                PRACTIKA: 3,
                RECCO: 3,
                TAURUS: 3,
                THOMAS: 0
            },  
        ])
    const [categorybrandSKU, setcategorybrandSKU] = useState([])
    const [categorybrandSKUperc, setcategorybrandSKUperc] = useState(
    [
    {
        mes:  "Agosto",
        BOSCH: 3,
        IMACO: 3,
        OSTER: 4,
        PHILIPS: 3,
        PRACTIKA: 3,
        RECCO: 1,
        TAURUS: 3,
        THOMAS: 2
    },
    {
        mes:  "Setiembre",
        BOSCH: 0,
        IMACO: 1,
        OSTER: 4,
        PHILIPS: 1,
        PRACTIKA: 1,
        RECCO: 1,
        TAURUS: 2,
        THOMAS: 2
    },
    {
        mes:  "Octubre",
        BOSCH: 3,
        IMACO: 2,
        OSTER: 1,
        PHILIPS: 1,
        PRACTIKA: 3,
        RECCO: 3,
        TAURUS: 3,
        THOMAS: 0
    },

    ])
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
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            key: 'selection'
        }
    ]);
    
    const columns = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'formid',
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
                Header: 'Tienda',
                accessor: 'poiname',
            },
            {
                Header: 'Hora',
                accessor: 'form_timestamp',
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
                Header: 'Retail',
                accessor: 'retail',
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
                Header: 'Url de la foto',
                accessor: 'photo_url'
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

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
                GET_FILTER("format"),
                GET_FILTER("channel"),
                GET_FILTER("department"),
                GET_CATEGORY("LINEAL"),
                RB_MARCA,
                GET_FILTER("sub_category"),
            ])
            filtrar()
            if (resultMulti.result instanceof Array) {
                const resarray = resultMulti.result;
                setdatafilters({
                    ...datafilters,
                    format: resarray[0]?.success ? resarray[0].data : [],
                    channel: resarray[1]?.success ? resarray[1].data : [],
                    department: resarray[2]?.success ? resarray[2].data : [],
                    categoria: resarray[3]?.success ? resarray[3].data : [],
                    marca: resarray[4]?.success ? resarray[4].data : [],
                    subcategoria: resarray[5]?.success ? resarray[5].data : [],
                })
            }         
        })();
        return () => continuezyx = false;
    }, [])
    
    async function updatelistretail(id_form){
        const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
            GET_FILTERRETAIL("retail",id_form),
            GET_FILTERRETAIL("store_name",id_form),
            GET_FILTERRETAIL("model",id_form),
        ])
        if (resultMulti.result instanceof Array) {
            const resarray = resultMulti.result;
            setdatafilters({
                ...datafilters,
                retail: resarray[0]?.success ? resarray[0].data : [],
                store_name: resarray[1]?.success ? resarray[1].data : [],
                SKU: resarray[2]?.success ? resarray[2].data : [],
            })
        }    
    }

    const getSubctegories = (id_form) => {
        triggeraxios('post', process.env.endpoints.selsimple, GET_SUBCATEGORY(id_form)).then(x => {
            setsubcategories(validateResArray(x, true))
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
        listResult.result.data.map((row) => {
            count += row.cont
        })
        setDataGraph(listResult.result.data)
        const listwarboard = await triggeraxios('post', process.env.endpoints.selsimple, FILTERWARBOARD(filter_to_send))
        console.log(listwarboard)
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
        //setorderbrandsSKU(brandlistSKU)
        setcategorybrandSKU(skucategory)


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
                            getSubctegories(value?.id_form)
                            setfilters({ ...filters, categoria: value?.id_form || 1 });
                            setcategory(value)
                            setdisablebutton(!value)
                            updatelistretail(value?.id_form || 1)
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
                        style={{width: "150px"}}
                        callback={({ newValue: value }) => setfilters({ ...filters, marca: value?.brand || '' })}
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
                        style={{width: "200px"}}
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
                        style={{width: "200px"}}
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
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.5}>
                                    <LineChart data={categorybrandSKUperc} >
                                        <Legend verticalAlign="bottom"/>
                                        <XAxis dataKey="mes" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis allowDecimals={false} allowDataOverflow={true}/>
                                        <Tooltip itemSorter={item => -(orderbrandsSKU.indexOf(item.dataKey))} formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        <CartesianGrid />
                                        {
                                            orderbrandsSKU.map((brand, i) => (
                                                <Line key={`marcCperc${brand}`} type="monotone" dataKey={brand} stroke={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </LineChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.5}>
                                    <BarChart data={dataGraphDate}>
                                        <XAxis dataKey="week" />
                                        <YAxis allowDecimals={false} allowDataOverflow={true}/>
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
                            <div style={{flex: 1}} className={classes.replacerowzyx}>
                                <div style={{flex: 2}} >
                                    <div style={{textAlign: "center"}}>
                                        <div>RC006R</div>
                                        <div>IMACO</div>
                                    </div>
                                    
                                    <div style={{display: "flex"}} >
                                        
                                        <div style={{flex: 1}}>
                                            <TableContainer component={Paper}>
                                                <Table aria-label="simple table" >
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">subcategoria</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">Arrocera</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Precio Regular</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">S/. 79.95</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Precio Promoción</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">S/. 7.50</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Capacidad</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">0.6LTS</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Watts</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">350</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Acabado</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">METAL</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">color</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">BLANCO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">material del tazon</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row"></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">medida del tazon</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SI</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </div>
                                        <div style={{flex: 1}}>
                                            <TableContainer component={Paper}>
                                                <Table aria-label="simple table" >
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">recubrimiento</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SIN RECUBRIMIENTO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">funciones</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">COOK/WARM</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">MATERIAL DE LA TAPA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">VIDRIO REFRACTADO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">TIPO DE TAPA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">NO HERMETICA</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">CABLE DESMONTABLE</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SI</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">VAPORERA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">NO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">MATERIAL DE LA VAPORERA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SIN VAPORERA</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </div>
                                    </div>
                                </div>
                                <div style={{flex: 1}} >
                                <img style={{ width: "100%", height: "auto"}} alt="image.jpg" src="http://142.44.214.184:5000/storage/master_imagenes/RC6.png"></img>
                                </div>
                            </div>
                            <div style={{flex: 1}} className={classes.replacerowzyx}>
                            <div style={{flex: 2}} >
                                    <div style={{textAlign: "center"}}>
                                        <div>RC006R</div>
                                        <div>IMACO</div>
                                    </div>
                                    
                                    <div style={{display: "flex"}} >
                                        
                                        <div style={{flex: 1}}>
                                            <TableContainer component={Paper}>
                                                <Table aria-label="simple table" >
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">subcategoria</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">Arrocera</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Precio Regular</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">S/. 79.95</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Precio Promoción</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">S/. 7.50</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Capacidad</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">0.6LTS</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Watts</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">350</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Acabado</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">METAL</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">color</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">BLANCO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">material del tazon</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row"></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">medida del tazon</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SI</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </div>
                                        <div style={{flex: 1}}>
                                            <TableContainer component={Paper}>
                                                <Table aria-label="simple table" >
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">recubrimiento</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SIN RECUBRIMIENTO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">funciones</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">COOK/WARM</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">MATERIAL DE LA TAPA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">VIDRIO REFRACTADO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">TIPO DE TAPA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">NO HERMETICA</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">CABLE DESMONTABLE</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SI</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">VAPORERA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">NO</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">MATERIAL DE LA VAPORERA</TableCell>
                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">SIN VAPORERA</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </div>
                                    </div>
                                </div>
                                <div style={{flex: 1}} >
                                <img style={{ width: "100%", height: "auto"}} alt="image.jpg" src="http://142.44.214.184:5000/storage/master_imagenes/2816P.png"></img>
                                </div>
                            </div>
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

export default New_Products;