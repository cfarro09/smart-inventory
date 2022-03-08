import React, { useState, useContext, useEffect, Component, PropTypes, Fragment } from 'react';
import Layout from '../components/system/layout/layout'
import triggeraxios from '../config/axiosv2';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import DateRange from '../components/system/form/daterange';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import 'jspdf-autotable'
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import InputFormk from '../components/system/form/inputformik';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import popupsContext from '../context/pop-ups/pop-upsContext';

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

const GET_SUBCATEGORY = (id_form) => ({
    method: "SP_SUBCATEGORY_BYID",
    data: {
        id_form
    }
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


const headerfields = [
    { name: "brand", title: "marca" },
    { name: "subcategory", title: "subcategoría" },
    { name: "regular_price", title: "precio regular" },
    { name: "prom_price", title: "precio promoción" },
]
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
        { name: "liters", title: "LITROS" },
        { name: "power", title: "POTENCIA" },
        { name: "material", title: "MATERIAL" },
        { name: "inner_finish", title: "ACABADO INTERNO" },
        { name: "color", title: "COLOR" },
        { name: "internal_light", title: "LUZ INTERNA" },
        { name: "rotisserie", title: "ROSTICERO" },
        { name: "accessories", title: "ACCESORIOS" },
        { name: "recipe_book", title: "RECETARIO" },
        { name: "functions", title: "FUNCIONES" },
        { name: "variable_time", title: "TIEMPO VARIABLE" },
        { name: "variable_temperature", title: "TEMPERATURA VARIABLE" },
        { name: "fan_location", title: "UBICACIÓN DEL VENTILADOR" },
    ],
    /*EXTRACTORES*/[
        { name: 'accessories', title: 'ACCESORIOS' },
        { name: 'bagasse_capacity', title: 'BAGAZO CAPACIDAD' },
        { name: 'bagasse_receiving_material', title: 'MATERIAL DE RECEPCIÓN DE BAGAZO' },
        { name: 'brand', title: 'MARCA' },
        { name: 'capacity', title: 'CAPACIDAD' },
        { name: 'carafe_capacity', title: 'CAPACIDAD DE LA JARRA' },
        { name: 'color', title: 'COLOR' },
        { name: 'feed_pipe_diameter', title: 'FEED PIPE DIAMETER' },
        { name: 'finish', title: 'FINALIZAR' },
        { name: 'foam_separator', title: 'SEPARADOR DE ESPUMA' },
        { name: 'graphic', title: 'GRÁFICO' },
        { name: 'juice_receiver_material', title: 'JUGO RECEPTOR MATERIAL' },
        { name: 'model', title: 'MODELO' },
        { name: 'number_of_blades', title: 'NÚMERO DE CUCHILLAS' },
        { name: 'power', title: 'ENERGÍA' },
        { name: 'safety_system_type', title: 'TIPO DE SISTEMA DE SEGURIDAD' },
        { name: 'self_cleaning_system', title: 'SISTEMA DE AUTOLIMPIEZA' },
        { name: 'speeds', title: 'VELOCIDADES' },
        { name: 'subcategory', title: 'SUBCATEGORÍA' },
        { name: 'technology', title: 'TECNOLOGÍA ' },
    ],
    /*CAFETERAS*/[
        { name: 'accessories', title: 'ACCESORIOS' },
        { name: 'automatic_shutoff', title: 'APAGADO AUTOMÁTICO' },
        { name: 'barsdepression', title: 'BARESDEPRESIÓN' },
        { name: 'brand', title: 'MARCA' },
        { name: 'capacity_n_cups', title: 'CAPACIDAD N TAZAS' },
        { name: 'cleaning_function', title: 'FUNCIÓN LIMPIEZA' },
        { name: 'coffee_strength', title: 'CAFÉ FUERZA' },
        { name: 'color', title: 'COLOR' },
        { name: 'filter_type', title: 'TIPO DE FILTRO' },
        { name: 'finish', title: 'FINALIZAR' },
        { name: 'freshness_timer', title: 'FRESCURA TEMPORIZADOR' },
        { name: 'grinder_capacity', title: 'MOLINILLO CAPACIDAD' },
        { name: 'grinder_capactiy', title: 'GRINDER CAPACTIY' },
        { name: 'hot_water_dispenser', title: 'DISPENSADOR DE AGUA CALIENTE' },
        { name: 'integrated_grinder', title: 'MOLINILLO INTEGRADO' },
        { name: 'milk_feeder', title: 'ALIMENTADOR DE LECHE' },
        { name: 'milk_tank_capacity', title: 'CAPACIDAD TANQUE DE LECHE' },
        { name: 'model', title: 'MODELO' },
        { name: 'pitcher', title: 'LANZADOR' },
        { name: 'power', title: 'ENERGÍA' },
        { name: 'programmable', title: 'PROGRAMABLE' },
        { name: 'pump_type', title: 'TIPO BOMBA' },
        { name: 'recipe_book', title: 'LIBRO DE RECETAS' },
        { name: 'removable_diffuser', title: 'DIFUSOR REMOVIBLE' },
        { name: 'removable_filter', title: 'FILTRO REMOVIBLE' },
        { name: 'subcategory', title: 'SUBCATEGORÍA' },
        { name: 'technology', title: 'TECNOLOGÍA' },
        { name: 'type_of_carafe', title: 'TIPO DE JARRA' },
        { name: 'viewer_windows', title: 'VISOR VENTANAS' },
        { name: 'water_tank_capacity', title: 'CAPACIDAD TANQUE DE AGUA' },
        { name: 'watts', title: 'WATTS' },
    ],
    /*HERVIDORES*/[
        { name: "accessories", title: "ACCESORIOS" },
        { name: "brand", title: "MARCA" },
        { name: "capacity", title: "CAPACIDAD" },
        { name: "color", title: "COLOR" },
        { name: "fill_indicator", title: "INDICADOR_DE_RELLENO" },
        { name: "fixed_cover", title: "CUBIERTA_FIJA" },
        { name: "indicator_led", title: "INDICADOR_LED" },
        { name: "light_switch", title: "INTERRUPTOR DE LUZ" },
        { name: "model", title: "MODELO" },
        { name: "subcategory", title: "SUBCATEGORÍA" },
        { name: "technology", title: "TECNOLOGÍA" },
        { name: "temperature_control", title: "CONTROL DE TEMPERATURA" },
        { name: "type_resistance", title: "TIPO_RESISTENCIA" },
        { name: "watts", title: "VATIOS" },
    ],
    /*PLANCHAS*/[
        { name: "360_cable", title: "CABLE 360" },
        { name: "accessories", title: "ACCESORIOS" },
        { name: "anti_drip_system", title: "SISTEMA ANTIGOTEO" },
        { name: "anti_scale_system", title: "SISTEMA ANTICAL" },
        { name: "automatic_shutoff", title: "APAGADO AUTOMÁTICO" },
        { name: "brand", title: "MARCA" },
        { name: "coating", title: "REVESTIMIENTO" },
        { name: "color", title: "COLOR" },
        { name: "cord_type", title: "TIPO DE CABLE" },
        { name: "extra_shot_steam", title: "TIRO EXTRA DE VAPOR" },
        { name: "gram_steam_per_minutes", title: "GRAMO DE VAPOR POR MINUTO" },
        { name: "model", title: "MODELO" },
        { name: "self_cleaning_system", title: "SISTEMA DE AUTOLIMPIEZA" },
        { name: "sprayer", title: "PULVERIZADOR" },
        { name: "steam_level", title: "NIVEL DE VAPOR" },
        { name: "steam_levels", title: "NIVELES DE VAPOR" },
        { name: "subcategory", title: "SUBCATEGORÍA" },
        { name: "times", title: "VECES" },
        { name: "vertical_steam", title: "VAPOR VERTICAL" },
        { name: "water_tank_capacity", title: "CAPACIDAD DEL TANQUE DE AGUA" },
        { name: "watts", title: "VATIOS" },
        { name: "wireless", title: "INALÁMBRICA" },
    ],
]

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
})
const GET_FILTERRETAIL = (filter, id_form) => ({
    method: "SP_FILTER_BYID",
    data: {
        filter,
        id_form
    }
})
const FILTER = (filter) => ({
    method: "SP_WARBOARD",
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
        borderCollapse: "separate"
    },
    labelcell: {
        border: "1px #e0e0e0 solid",
        fontWeight: "bold",
        backgroundColor: "white"
    },
    datacell: {
        border: "1px #e0e0e0 solid",
        backgroundColor: "white",
        padding: 5
    },
    datacelltitle: {
        border: "1px #e0e0e0 solid",
        position: "sticky",
        left: 0,
        background: "white",
        textTransform: "uppercase",
        fontWeight: "bold",
        padding: 5
    }
}));

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}

function urlToPromise(url) {
    return new Promise(function (resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function tmpgetfields(value) {
    console.log("aaa", value)
    if (value.includes("ARROCERA")) {
        return fields[0];
    }
    else if (value.includes("LICUADORA")) {
        return fields[1];
    }
    else if (value.includes("BATIDORA")) {
        return fields[2];
    }
    else if (value.includes("FREIDORAS")) {
        return fields[4];
    }
    else if (value.includes("HORNOS")) {
        return fields[5];
    }
    else if (value.includes("EXTRACTORES")) {
        return fields[6];
    }
    else if (value.includes("CAFETERAS")) {
        return fields[7];
    }
    else if (value.includes("HERVIDORES")) {
        return fields[8];
    }
    else if (value.includes("PLANCHAS")) {
        return fields[9];
    }
    else {
        return fields[2];
    }
}


const BulkLoad = () => {
    const classes = useStyles();
    const [dataGraph, setDataGraph] = useState([])
    const [searchdone, setsearchdone] = useState(false);
    const [fieldstoshow, setfieldstoshow] = useState([]);
    const [pvpprom, setpvpprom] = useState(true);
    const [pvppreg, setpvpreg] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [category, setcategory] = useState(null);
    const { setOpenBackdrop } = React.useContext(popupsContext);
    const [dataArray, setDataArray] = useState([])
    const [disablebutton, setdisablebutton] = useState(true)
    const [subcategories, setsubcategories] = useState([]);
    const [cleanFilter, setcleanFilter] = useState(false);
    const [stopFilter, setstopFilter] = useState(-1);
    const [dateRange, setdateRange] = useState([
        {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
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
            // await triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY("LINEAL"))
            filtrar()
        }
    }, [initial])

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


    async function filtrar() {
        setsearchdone(true)
        setpvpprom(true)
        setpvpreg(true)
        setcategorysearchfield(category?.category || "ARROCERA")
        console.log(category)
        const constfieldstouse = tmpgetfields(category?.category || "ARROCERA");

        if (filters.tipo_pvp === "prom_price") setpvpreg(false)
        if (filters.tipo_pvp === "regular_price") setpvpprom(false)

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
        setOpenBackdrop(false)
        setDataGraph(listResult.result?.data || [])
        const listValues = [
            { name: "model", title: "Modelo" },
            { name: "graphic", title: "Gráfica" },
            ...headerfields,
            ...constfieldstouse
        ]

        const arrayinitials = listValues.map(x => [x.title]);

        const ff = listResult.result.data.reduce((acc, item) => {
            Object.entries(item).forEach(([key, value], index) => {
                const indexfound = listValues.findIndex(x => x.name === key);
                if (indexfound >= 0) {
                    acc[indexfound].push(key === "graphic" ? value?.split("/").pop() || "" : value)
                }
            });
            return acc;
        }, arrayinitials)

        setDataArray(ff)

    }


    const applyfilter = async (fill, initial = false) => {
        fill.categoria = fill?.categoria || 1;
        setOpenBackdrop(true);
        const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
            FILTERv2("format", fill),
            FILTERv2("channel", fill),
            FILTERv2("retail", fill),
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
                retail: resarray[2]?.success ? resarray[2].data : [],
                marca: resarray[3]?.success ? resarray[3].data : [],
                SKU: resarray[4]?.success ? resarray[4].data : [],
                subcategoria: resarray[5]?.success ? resarray[5].data : [],
                store_name: resarray[6]?.success ? resarray[6].data : [],
                department: resarray[7]?.success ? resarray[7].data : [],
                categoria: initial ? (resarray[8]?.success ? resarray[8].data : []) : x.categoria,
            }))
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
                categoria: 1,
                SKU: '',
                banda: '',
                marca: '',
                tipo_pvp: 'prom_price',
                retail: '',
                subcategoria: '',
            })
        }
    }, [cleanFilter])

    function setcategorysearchfield(value) {
        console.log("bbbb", value)
        if (value.includes("ARROCERA")) {
            setfieldstoshow(fields[0])
        }
        else if (value.includes("LICUADORA")) {
            setfieldstoshow(fields[1])
        }
        else if (value.includes("BATIDORA")) {
            setfieldstoshow(fields[2])
        }
        else if (value.includes("FREIDORAS")) {
            setfieldstoshow(fields[4]);
        }
        else if (value.includes("HORNOS")) {
            setfieldstoshow(fields[5]);
        }
        else if (value.includes("EXTRACTORES")) {
            setfieldstoshow(fields[6]);
        }
        else if (value.includes("CAFETERAS")) {
            setfieldstoshow(fields[7]);
        }
        else if (value.includes("HERVIDORES")) {
            setfieldstoshow(fields[8]);
        }
        else if (value.includes("PLANCHAS")) {
            setfieldstoshow(fields[9]);
        }
    }
    const URLMACRO = "https://staticfileszyxme.s3.us-east.cloud-object-storage.appdomain.cloud/macro-warboard.xlsm"

    async function generateZIP() {
        setOpenBackdrop(true)
        var zip = new JSZip();
        var count = 0;
        var zipFilename = "Warboard.zip";
        let datafromtable = dataArray;

        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        const ws = XLSX.utils.aoa_to_sheet(datafromtable);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataexcel = new Blob([excelBuffer], { type: fileType });

        await Promise.all(dataGraph.map(async (row, i) => {
            try {
                const data = await urlToPromise(row.graphic);
                zip.file(`images/${row.model}.png`, data, { binary: true });
            } catch (error) {
                return null;
            }
        }));

        const datamacro = await urlToPromise(URLMACRO);
        zip.file('macro-warboard.xlsm', datamacro, { binary: true });

        zip.file(`warboard.xlsx`, dataexcel, { binary: true });
        zip.generateAsync({ type: 'blob' }).then(function (content) {
            saveAs(content, zipFilename);
            setOpenBackdrop(false)
        });
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
                        onlyinitial={!cleanFilter}
                        namefield="category"
                        descfield="category"
                        valueselected={filters.categoria}
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setdisablebutton(!value)
                                setcategory(value)
                                setfilters({ ...filters, categoria: value?.id_form || 1 });
                            }
                        }}
                    />

                    <SelectFunction
                        onlyinitial={!cleanFilter}
                        title="Marca"
                        datatosend={datafilters.marca}
                        optionvalue="brand"
                        optiondesc="brand"
                        valueselected={filters.marca}
                        variant="outlined"
                        namefield="brand"
                        descfield="brand"
                        style={{ width: "150px" }}
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({
                                    ...filters, department: '',
                                    store_name: '',
                                    SKU: '',
                                    retail: '', marca: value?.brand || ''
                                })
                            }
                        }}
                    />

                    <SelectFunction
                        onlyinitial={!cleanFilter}
                        title="SKU"
                        datatosend={datafilters.SKU}
                        optionvalue="model"
                        optiondesc="model"
                        valueselected={filters.SKU}
                        variant="outlined"
                        namefield="model"
                        descfield="model"
                        style={{ width: "200px" }}
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, SKU: value?.model || '' })
                            }
                        }}
                    />
                    <SelectFunction
                        onlyinitial={!cleanFilter}
                        title="Retail"
                        variant="outlined"
                        datatosend={datafilters.retail}
                        optionvalue="retail"
                        optiondesc="retail"
                        valueselected={filters.retail}
                        namefield="retail"
                        descfield="retail"
                        style={{ width: "200px" }}
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, retail: value?.retail || '' })
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
                    {searchdone &&
                        <Fragment>
                            <Button
                                style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                                onClick={() => generateZIP()}
                                startIcon={<GetAppIcon style={{ color: '#FFF' }} />}
                            >Descargar</Button>
                        </Fragment>
                    }
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
                            valuedefault={category?.last_consulted}
                            variant="outlined"
                            onlyinitial={!cleanFilter}
                            label="Última Actualización"
                        />
                    }
                </div>
                {searchdone &&
                    <div id="divToPrint">
                        <TableContainer component={Paper}>
                            <Table stickyHeader id="maintable" className={classes.table} aria-label="simple table" >
                                <TableHead style={{ zIndex: 1000 }}>

                                    <TableRow style={{ position: "sticky", top: 0, zIndex: 1000 }} >
                                        <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">modelo</TableCell>
                                        {dataGraph.map((row, j) => (
                                            <TableCell key={`graphic2${j}`} className={classes.datacell} align="center" component="th" scope="row">{row.model}</TableCell>
                                        ))}

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className={classes.datacelltitle} align="right" component="th" scope="row"></TableCell>
                                        {dataGraph.map((row, j) => (
                                            <TableCell key={`graphic${j}`} className={classes.datacell} align="center" component="th" scope="row"><img style={{ width: "100px", height: "100px" }} alt="image.jpg" src={row.graphic}></img></TableCell>
                                        ))}

                                    </TableRow>
                                </TableBody>
                                <TableBody>
                                    {headerfields.map((field, i) => {
                                        if (field.name === "regular_price") {
                                            if (pvppreg) {
                                                return (
                                                    <TableRow key={`fieldstoshow${i}`}>
                                                        <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">{field.title}</TableCell>
                                                        {dataGraph.map((row, j) => (

                                                            <TableCell key={`${field.name}${j}`} className={classes.datacell} align="center" component="th" scope="row">S/.{parseFloat(row[field.name]).toFixed(2)}</TableCell>
                                                        ))}

                                                    </TableRow>)
                                            } else return (null)
                                        }
                                        else if (field.name === "prom_price") {
                                            if (pvpprom) {
                                                return (
                                                    <TableRow key={`fieldstoshow${i}`}>
                                                        <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">{field.title}</TableCell>
                                                        {dataGraph.map((row, j) => (

                                                            <TableCell key={`${field.name}${j}`} className={classes.datacell} align="center" component="th" scope="row">S/.{parseFloat(row[field.name]).toFixed(2)}</TableCell>
                                                        ))}

                                                    </TableRow>)
                                            } else return (null)
                                        }
                                        else {
                                            return (<TableRow key={`fieldstoshow${i}`}>
                                                <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">{field.title}</TableCell>
                                                {dataGraph.map((row, j) => (

                                                    <TableCell key={`${field.name}${j}`} className={classes.datacell} align="center" component="th" scope="row">{row[field.name]}</TableCell>
                                                ))}

                                            </TableRow>)
                                        }
                                    })}
                                    {fieldstoshow.map((field, i) => (
                                        <TableRow key={`fieldstoshow${i}`}>
                                            <TableCell className={classes.datacelltitle} align="right" component="th" scope="row">{field.title}</TableCell>
                                            {dataGraph.map((row, j) => (
                                                <TableCell key={`${field.name}${j}`} className={classes.datacell} align="center" component="th" scope="row">{row[field.name]}</TableCell>
                                            ))}

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                        onlyinitial={!cleanFilter}
                        title="Formato"
                        datatosend={datafilters.format}
                        optionvalue="format"
                        optiondesc="format"
                        variant="outlined"
                        valueselected={filters.format}
                        namefield="format"
                        descfield="format"
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, format: value?.format || '' })
                            }
                        }}
                    />
                    <SelectFunction
                        onlyinitial={!cleanFilter}
                        title="Canal"
                        datatosend={datafilters.channel}
                        optionvalue="channel"
                        optiondesc="channel"
                        variant="outlined"
                        namefield="channel"
                        valueselected={filters.channel}
                        descfield="channel"
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, channel: value?.channel || '' })
                            }
                        }}
                    />
                    <SelectFunction
                        onlyinitial={!cleanFilter}
                        title="Departamento"
                        datatosend={datafilters.department}
                        optionvalue="department"
                        optiondesc="department"
                        valueselected={filters.department}
                        variant="outlined"
                        namefield="department"
                        descfield="department"
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, department: value?.department || '' })
                            }
                        }}
                    />
                    <SelectFunction
                        onlyinitial={!cleanFilter}
                        title="PDV"
                        datatosend={datafilters.store_name}
                        optionvalue="store_name"
                        optiondesc="store_name"
                        variant="outlined"
                        valueselected={filters.store_name}
                        namefield="store_name"
                        descfield="store_name"
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, store_name: value?.store_name || '' })
                            }
                        }}
                    />
                    <SelectFunction
                        onlyinitial={!cleanFilter}
                        title="Subcategoría"
                        datatosend={datafilters.subcategoria}
                        optionvalue="subcategory"
                        optiondesc="subcategory"
                        variant="outlined"
                        namefield="subcategory"
                        descfield="subcategory"
                        callback={({ newValue: value }) => {
                            if (!cleanFilter) {
                                setfilters({ ...filters, subcategoria: value?.subcategory || "" });
                            }
                        }}
                    />
                </div>
            </SwipeableDrawer>
        </Layout>
    );
}

export default BulkLoad;