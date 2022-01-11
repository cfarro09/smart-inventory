import React, { useState, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import { Box } from "@material-ui/core";
import triggeraxios from '../config/axiosv2';

import {  makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRange from '../components/system/form/daterange';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
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

const fields = [
    /*ARROCERA*/[
        { name: "capacity", title: "capacidad" },
        { name: "watts", title: "watts" },
        { name: "finish", title: "acabado" },
        { name: "color", title: "color" },
        { name: "bowl_material", title: "material del tazón" },
        { name: "bowl_size", title: "medida del tazón" },
        { name: "coating", title: "recubrimiento" },
        { name: "functions", title: "funciones" },
        { name: "lid_material", title: "material de la tapa" },
        { name: "lid_type", title: "tipo de tapa" },
        { name: "detachable_cable", title: "cable desmontable" },
        { name: "steamer", title: "vaporera" },
        { name: "steamer_position", title: "posición de la vaporera" },
        { name: "steamer_material", title: "material de la vaporera" },
        { name: "accessories", title: "accesorios" },
        { name: "temperature_control", title: "control de temperatura" },
    ],
    /*LICUADORA*/[
        { name: "base_material", title: "material de la base" },
        { name: "color", title: "color" },
        { name: "speeds", title: "velocidades" },
        { name: "push_button", title: "pulsador" },
        { name: "power", title: "potencia" },
        { name: "tumbler_capacity", title: "capacidad del vaso" },
        { name: "cover_with_measure", title: "sobretapa con medida" },
        { name: "cup_material", title: "material del vaso" },
        { name: "coupling_material", title: "material de acople" },
        { name: "coupling_position", title: "posición de acople" },
        { name: "reversible_technology", title: "tecnología reversible" },
        { name: "num_automatic_programs", title: "cantidad de programas automáticos" },
        { name: "automatic_programs", title: "programas automáticos" },
        { name: "shut_off_times", title: "tiempos de apagado" },
        { name: "accessories", title: "accesorios" },
        { name: "blade_material", title: "material de las cuchillas" },
        { name: "number_of_blades", title: "numero de aspas" },
    ],
    /*BATIDORA*/[
        { name: "power", title: "potencia" },
        { name: "speeds", title: "velocidades" },
        { name: "turbo", title: "turbo" },
        { name: "base_material", title: "material de la base" },
        { name: "color", title: "color" },
        { name: "kneading_hook", title: "gancho amasador" },
        { name: "frothing_hook", title: "gancho espumador" },
        { name: "double_motor", title: "doble motor" },
        { name: "bowl_material", title: "material del tazón" },
        { name: "capacity", title: "capacidad" },
        { name: "accessories", title: "accesorios" },
    ],
    [],
    /*FREIDORA*/[
        { name: "capacity", title: "capacidad" },
        { name: "watts", title: "watts" },
        { name: "color", title: "color" },
        { name: "external_finish", title: "acabado externo" },
        { name: "inner_tray", title: "acabado externo" },
        { name: "indicator_on_bowl", title: "INDICADOR EN EL TAZÓN" },
        { name: "coating", title: "RECUBIMIENTO" },
        { name: "functions", title: "funciones" },
        { name: "food_types", title: "TIPOS DE ALIMENTOS" },
        { name: "variable_temperature", title: "temperatura variable" },
        { name: "max_time", title: "tiempo maximo" },
        { name: "accessories", title: "accesorios" },
        { name: "recipe_book", title: "recetario" },
    ],
    /*HORNOS*/[
        {name: "liters", title: "LITROS"},
        {name: "power", title: "POTENCIA"},
        {name: "material", title: "MATERIAL"},
        {name: "inner_finish", title: "ACABADO INTERNO"},
        {name: "color", title: "COLOR"},
        {name: "internal_light", title: "LUZ INTERNA"},
        {name: "rotisserie", title: "ROSTICERO"},
        {name: "accessories", title: "ACCESORIOS"},
        {name: "recipe_book", title: "RECETARIO"},
        {name: "functions", title: "FUNCIONES"},
        {name: "variable_time", title: "TIEMPO VARIABLE"},
        {name: "variable_temperature", title: "TEMPERATURA VARIABLE"},
        {name: "fan_location", title: "UBICACIÓN DEL VENTILADOR"},
    ],
]

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
const FILTERWARBOARD = (filter) => ({
    method: "SP_WARBOARD_NEW_PRODUCTS",
    data: filter
})
const FILTERFECHA = (filter) => ({
    method: "SP_SKU_DATE_NEW_PRODUCT",
    data: filter
})
const FILTERCAT  = (filter) => ({
    method: "SP_SKU_CAT_NEW_PRODUCT",
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
const GET_FILTERRETAIL = (filter,id_form) => ({
    method: "SP_FILTER_BYID",
    data: {
        filter,
        id_form
    }
})

const New_Products = () => {
    const classes = useStyles();
    const [miniwarboard, setminiwarboard] = useState([])
    const [categorybrandSKU, setcategorybrandSKU] = useState([])
    const [categorybrandSKUperc, setcategorybrandSKUperc] = useState([])
    const [secondgraphcategory, setsecondgraphcategory] = useState([])
    const [secondgraphdata, setsecondgraphdata] = useState([])
    const [initial, setinitial] = useState(0);
    const [stopFilter, setstopFilter] = useState(-1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchdone, setsearchdone] = useState(false)
    const [category, setcategory] = useState(null);
    const {  setOpenBackdrop } = React.useContext(popupsContext);
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

    const applyfilter = async (fill, initial = false) => {
        if (initial) {
            fill.categoria = fill?.categoria || 1;
            setOpenBackdrop(true);
            const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
                FILTERv2("format", fill),
                FILTERv2("channel", fill),
                FILTERv2("department",fill),
                FILTERv2("brand", fill),
                FILTERv2("model", fill),
                FILTERv2("sub_category", fill),
                FILTERv2("store_name", fill),
                FILTERv2("department", fill),
                ...(initial ? [GET_CATEGORY("LINEAL")] : [])
            ])
            if (resultMulti.result instanceof Array) {
                const resarray = resultMulti.result;
                setdatafilters(x => ({
                    ...x,
                    format: resarray[0]?.success ? resarray[0].data : [],
                    channel: resarray[1]?.success ? resarray[1].data : [],
                    department: resarray[2]?.success ? resarray[2].data : [],
                    marca: resarray[3]?.success ? resarray[3].data : [],
                    SKU: resarray[4]?.success ? resarray[4].data : [],
                    subcategoria: resarray[5]?.success ? resarray[5].data : [],
                    store_name: resarray[6]?.success ? resarray[6].data : [],
                    department: resarray[7]?.success ? resarray[7].data : [],
                    categoria: initial ? (resarray[8]?.success ? resarray[8].data : []) : x.categoria,
                }))
            }
            setstopFilter(stopFilter * -1);
            setOpenBackdrop(false);
        }
    }
    useEffect(() => {
        if (initial === 1) {
            filtrar()
        }
    }, [initial])
    
    useEffect(() => {
        
        (async () => {
            await applyfilter({}, true)
            setinitial(1)
        })();
        
    }, [])
    useEffect(() => {
        if (initial){
            applyfilter(filters, !!initial)
            console.log(initial)
            setinitial(0)
        }
    }, [filters])
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
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTERFECHA(filter_to_send))
        let dataFecha = listResult.result.data
        let containerbrands = []
        let dataFechasArray = []
        dataFecha.forEach((x=>{
            if(dataFechasArray.findIndex(y=>(y.week === x.date))==-1){
                dataFechasArray.push(elementBrand(x.date))
            }
            if(!containerbrands.includes(x.brand)) containerbrands.push(x.brand)
        }))
        dataFecha.forEach((x=>{
            let index = dataFechasArray.findIndex(y=>(y.week === x.date))
            dataFechasArray[index][x.brand]=x.count
        }))
        setcategorybrandSKU(containerbrands)
        setcategorybrandSKUperc(dataFechasArray)
        
        const listcategory = await triggeraxios('post', process.env.endpoints.selsimple, FILTERCAT(filter_to_send))
        let dataCategory = listcategory.result.data
        let containerbrandscategory = []
        let dataCategorysArray = []
        dataCategory.forEach((x=>{
            if(dataCategorysArray.findIndex(y=>(y.week === x.id_form))==-1){
                dataCategorysArray.push(elementBrand(x.id_form))
            }
            if(!containerbrandscategory.includes(x.brand)) containerbrandscategory.push(x.brand)
        }))
        dataCategory.forEach((x=>{
            let index = dataCategorysArray.findIndex(y=>(y.week === x.id_form))
            dataCategorysArray[index][x.brand]=x.count
        }))
        setsecondgraphcategory(containerbrandscategory)
        setsecondgraphdata(dataCategorysArray)

        const listwarboard = await triggeraxios('post', process.env.endpoints.selsimple, FILTERWARBOARD(filter_to_send))
        setminiwarboard(listwarboard.result.data)
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
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={100} dy={5} dx={-5} />
                                        <YAxis allowDecimals={false} allowDataOverflow={true}/>
                                        <Tooltip itemSorter={item => -(categorybrandSKU.indexOf(item.dataKey))} formatter={(value, name) => [value.toFixed(0), name]} />
                                        <CartesianGrid />
                                        {
                                            categorybrandSKU.map((brand, i) => (
                                                <Line key={`marcCperc${i}`} type="monotone" dataKey={brand} stroke={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </LineChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.5}>
                                    <BarChart data={secondgraphdata}>
                                        <XAxis dataKey="week" tickFormatter={(x)=>datafilters.categoria.filter(y=>y.id_form === x)[0].category.split(" ")[3]}/>
                                        <YAxis allowDecimals={false} allowDataOverflow={true}/>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip
                                            itemSorter={item => -(item.value)}
                                            labelFormatter={(value) => [<b>{datafilters.categoria.filter(y=>y.id_form === value)[0].category.split(" ")[3]}</b>]}
                                            formatter={(value, name) => [value.toFixed(0), name]}
                                        />
                                        {
                                            secondgraphcategory.map((brand,i) => {
                                                return (
                                                    <Bar
                                                        key={`cantskus${i}`}
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
                        {
                            miniwarboard.map((x,i)=>{
                                console.log(x)
                                let tempCat = datafilters.categoria.filter(y=>y.id_form === x.id_form)
                                let xcategory = tempCat.length>0?tempCat[0].category.split(" ")[3]:""
                                let parameterquant = fields[Number(x.id_form)-1].length
                                let firsthalf = Math.floor(parameterquant/2)
                                return( 
                                <div key={`miniwarboard-${i}`} className={classes.replacerowzyx}>
                                    <div style={{flex: 2}} >
                                        <div style={{textAlign: "center"}}>
                                            <div>{x.model}</div>
                                            <div>{x.brand}</div>
                                        </div>
                                        
                                        <div style={{display: "flex"}} >
                                            
                                            <div style={{flex: 1}}>
                                                <TableContainer component={Paper}>
                                                    <Table aria-label="simple table" >
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">subcategoria</TableCell>
                                                                <TableCell className={classes.datacell} align="center" component="th" scope="row">{xcategory}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Precio Regular</TableCell>
                                                                <TableCell className={classes.datacell} align="center" component="th" scope="row">S/. {Number(x.regular_price).toFixed(2)}</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">Precio Promoción</TableCell>
                                                                <TableCell className={classes.datacell} align="center" component="th" scope="row">S/. {Number(x.prom_price).toFixed(2)}</TableCell>
                                                            </TableRow>
                                                            {
                                                                fields[Number(x.id_form)-1].map((y,i)=>{
                                                                    if(i<firsthalf){
                                                                        return <TableRow>
                                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">{y.title}</TableCell>
                                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">{x[y.name]}</TableCell>
                                                                        </TableRow>
                                                                    }else{
                                                                        return ""
                                                                    }
                                                                })
                                                            }
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                            <div style={{flex: 1}}>
                                                <TableContainer component={Paper}>
                                                    <Table aria-label="simple table" >
                                                        <TableBody>
                                                            {
                                                                fields[Number(x.id_form)-1].map((y,i)=>{
                                                                    if(i>=firsthalf){
                                                                        return <TableRow>
                                                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">{y.title}</TableCell>
                                                                            <TableCell className={classes.datacell} align="center" component="th" scope="row">{x[y.name]}</TableCell>
                                                                        </TableRow>
                                                                    }else{
                                                                        return ""
                                                                    }
                                                                })
                                                            }
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </div>
                                    </div>    
                                    <div style={{flex: 1}} >
                                    <img style={{ width: "100%", height: "auto"}} alt="image.jpg" src={x.graphic}></img>
                                    </div>
                                </div>
                                )
                            })
                        }
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