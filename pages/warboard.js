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


const headerfields = [
    { name: "brand", title: "marca" },
    { name: "subcategory", title: "subcategoría" },
    { name: "regular_price", title: "precio regular" },
    { name: "prom_price", title: "precio promoción" },
]
const fields = [
    /*ARROCERA*/[
        { name: 'brand', title: 'MARCA' },
        { name: 'subcategory', title: 'SUBCATEGORÍA' },
        { name: 'model', title: 'MODELO' },
        { name: "color", title: "COLOR" },
        { name: "capacity", title: "CAPACIDAD" },
        { name: "watts", title: "WATTS" },
        { name: "finish", title: "ACABADO" },
        { name: "bowl_material", title: "MATERIAL DEL TAZON" },
        { name: "bowl_size", title: "MEDIDA DEL TAZON" },
        { name: "coating", title: "RECUBRIMIENTO" },
        { name: "functions", title: "FUNCIONES" },
        { name: "lid_material", title: "MATERIAL DE LA TAPA" },
        { name: "lid_type", title: "TIPO DE TAPA" },
        { name: "detachable_cable", title: "CABLE DESMONTABLE" },
        { name: "steamer", title: "VAPORERA" },
        { name: "steamer_position", title: "POSICIÓN DE LA VAPORERA" },
        { name: "steamer_material", title: "MATERIAL DE LA VAPORERA" },
        { name: "accessories", title: "ACCESORIOS" },
        { name: "temperature_control", title: "CONTROL DE TEMPERATURA" },
        { name: "indicator_on_bowl", title: "MEDIDAS EN EL TAZON" },
    ],
    /*LICUADORA*/[
        { name: "brand", title: "MARCA" },
        { name: "subcategory", title: "SUBCATEGORIA" },
        { name: "model", title: "MODELO" },
        { name: "color", title: "COLOR" },
        { name: "accessories", title: "ACCESORIOS" },
        { name: "power", title: "POTENCIA" },
        { name: "speeds", title: "VELOCIDADES" },
        { name: "base_material", title: "MATERIAL DE LA BASE" },
        { name: "tumbler_capacity", title: "CAPACIDAD DEL VASO" },
        { name: "tumbler_material", title: "MATERIAL DEL VASO" },
        { name: "category", title: "CATEGORIA" },
        { name: "push_button", title: "PULSADOR" },
        { name: "over_lid_with_measure", title: "SOBRE TAPA CON MEDIDA" },
        { name: "coupling_material", title: "MATERIAL DE ACOPLE" },
        { name: "reversible_technology", title: "TECNOLOGIA REVERSIBLE" },
        { name: "coupling_position", title: "POSICION DE ACOPLE" },
        { name: "num_automatic_programs", title: "PROGRAMAS AUTOMATICOS" },
        { name: "shut_off_times", title: "TIEMPOS DE APAGADO" },
        { name: "blades_material", title: "MATERIAL DE CUCHILLAS" },
        { name: "blades_number", title: "NUMERO DE CUCHILLAS" },
        { name: "blades_number", title: "NUMERO DE ASPAS" },
    ],
    /*BATIDORA*/[
        { name: 'brand', title: 'MARCA' },
        { name: 'subcategory', title: 'SUBCATEGORIA' },
        { name: 'model', title: 'MODELO' },
        { name: 'color', title: 'COLOR' },
        { name: 'accessories', title: 'ACCESORIOS' },
        { name: 'bowl_material', title: 'MATERIAL DEL TAZON' },
        { name: 'power', title: 'POTENCIA' },
        { name: 'speeds', title: 'VELOCIDADES' },
        { name: 'turbo', title: 'TURBO' },
        { name: 'base_material', title: 'MATERIAL DE LA BASE' },
        { name: 'kneading_hook', title: 'GANCHO AMASADOR' },
        { name: 'beater_hook', title: 'GANCHO BATIDOR' },
        { name: 'double_motor', title: 'DOBLE MOTOR' },
        { name: 'bowl_capacity', title: 'CAPACIDAD DEL TAZON' },
        { name: 'mixing_hook', title: 'GANCHO MEZCLADOR' },
        { name: 'frothing_hook', title: 'GANCHO ESPUMADOR' },
        { name: 'mixing_hook_with_flexible_edge', title: 'GANCHO MEZCLADOR CON BORDE FLEXIBLE' },
        { name: 'pulse_turbo_capacity', title: 'CAPACIDAD DE PULSO/TURBO' },
        { name: 'adjustable_speeds', title: 'VELOCIDADES GRADUABLES' },
        { name: 'rod_material', title: 'MATERIAL DE VARILLA' },
        { name: 'tumbler', title: 'VASO' },
        { name: 'tumbler_capacity', title: 'CAPACIDAD DEL VASO' },
        { name: 'tumbler_material', title: 'MATERIAL DEL VASO' },
        { name: 'detachable', title: 'DESMONTABLE' },
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
        { name: "brand", title: "MARCA" },
        { name: "model", title: "MODELO" },
        { name: "color", title: "COLOR" },
        { name: "functions", title: "FUNCIONES" },
        { name: "accessories", title: "ACCESORIOS" },
        { name: "power", title: "POTENCIA" },
        { name: "recipe_book", title: "RECETARIO" },
        { name: "variable_temperature", title: "TEMPERATURA VARIABLE" },
        { name: "category", title: "CATEGORIA" },
        { name: "liters", title: "LITROS" },
        { name: "material", title: "MATERIAL" },
        { name: "internal_finish", title: "ACABADO INTERNO" },
        { name: "inner_light", title: "LUZ INTERNA" },
        { name: "rotisserie", title: "ROSTICERO" },
        { name: "variable_time", title: "TIEMPO VARIABLE" },
        { name: "fan_ubication", title: "UBICACION DEL VENTILADOR" },
    ],
    /*EXTRACTORES*/[
        { name: 'brand', title: 'MARCA' },
        { name: 'subcategory', title: 'SUBCATEGORIA' },
        { name: 'model', title: 'MODELO' },
        { name: 'capacity', title: 'CAPACIDAD' },
        { name: 'finish', title: 'ACABADO' },
        { name: 'color', title: 'COLOR' },
        { name: 'accessories', title: 'ACCESORIOS' },
        { name: 'power', title: 'POTENCIA' },
        { name: 'technology', title: 'TECNOLOGIA' },
        { name: 'feed_pipe_diameter', title: 'DIAMETRO DEL TUBO DE ALIMENTACION' },
        { name: 'safety_system_type', title: 'TIPO SISTEMA DE SEGURIDAD' },
        { name: 'speeds_number', title: 'NRO DE VELOCIDADES' },
        { name: 'juice_receiver_material', title: 'MATERIAL RECEPTOR JUGO' },
        { name: 'pitcher_capacity', title: 'CAPACIDAD DE JARRA' },
        { name: 'bagasse_receiving_material', title: 'MATERIAL RECEPTOR BAGAZO' },
        { name: 'bagasse_capacity', title: 'CAPACIDAD DE BAGAZO' },
        { name: 'blades_number', title: 'NRO DE CUCHILLAS' },
        { name: 'frothing_separator', title: 'SEPARADOR DE ESPUMA' },
        { name: 'self_cleaning_system', title: 'SISTEMA DE AUTOLIMPIEZA' },
    ],
    /*CAFETERAS*/[
        { name: 'brand', title: 'MARCA' },
        { name: 'subcategory', title: 'SUBCATEGORIA' },
        { name: 'model', title: 'MODELO' },
        { name: 'capacity', title: 'CAPACIDAD' },
        { name: 'watts', title: 'WATTS' },
        { name: 'color', title: 'COLOR' },
        { name: 'functions', title: 'FUNCIONES' },
        { name: 'accessories', title: 'ACCESORIOS' },
        { name: 'coating', title: 'RECUBIMIENTO' },
        { name: 'recipe_book', title: 'RECETARIO' },
        { name: 'external_finish', title: 'ACABADO EXTERNO' },
        { name: 'inner_tray', title: 'BANDEJA INTERIOR' },
        { name: 'indicator_on_bowl', title: 'INDICADOR EN EL TAZON' },
        { name: 'food_types', title: 'TIPOS DE ALIMENTOS' },
        { name: 'variable_temperature', title: 'TEMPERATURA VARIABLE' },
        { name: 'max_time', title: 'TIEMPO MAXIMO' },
    ],
    /*HERVIDORES*/[
        { name: "brand", title: "MARCA" },
        { name: "subcategory", title: "SUBCATEGORIA" },
        { name: "model", title: "MODELO" },
        { name: "capacity", title: "CAPACIDAD" },
        { name: "watts", title: "WATTS" },
        { name: "color", title: "COLOR" },
        { name: "accessories", title: "ACCESORIOS" },
        { name: "temperature_control", title: "CONTROL DE TEMPERATURA" },
        { name: "technology", title: "TECNOLOGIA" },
        { name: "resistance_type", title: "TIPO RESISTENCIA" },
        { name: "fill_indicator", title: "INDICADOR DE LLENADO" },
        { name: "fixed_lid", title: "TAPA FIJA" },
        { name: "indicator_led", title: "INDICADOR LUMINOSO" },
        { name: "light_switch", title: "SWITCH LUMINOSO" },
    ],
    /*PLANCHAS*/[
        { name: "brand", title: "MARCA" },
        { name: "subcategory", title: "SUBCATEGORIA" },
        { name: "model", title: "MODELO" },
        { name: "watts", title: "WATTS" },
        { name: "color", title: "COLOR" },
        { name: "coating", title: "RECUBRIMIENTO" },
        { name: "accessories", title: "ACCESORIOS" },
        { name: "water_tank_capacity", title: "CAPACIDAD DEL TANQUE DE AGUA" },
        { name: "automatic_shutoff", title: "APAGADO AUTOMATICO" },
        { name: "sprayer", title: "ROCIADOR" },
        { name: "extra_shot_steam", title: "GOLPE EXTRA DE VAPOR" },
        { name: "steam_levels", title: "NIVELES DE VAPOR" },
        { name: "vertical_steam", title: "VAPOR VERTICAL" },
        { name: "times", title: "TIEMPOS" },
        { name: "cord_type", title: "TIPO DE CORDON" },
        { name: "wireless", title: "INALAMBRICA" },
        { name: "anti_drip_system", title: "SISTEMA ANTIGOTEO" },
        { name: "anti_scale_system", title: "SISTEMA ANTICAL" },
        { name: "self_cleaning", title: "AUTOLIMPIEZA" },
        { name: "gram_steam_per_minutes", title: "GRAMOS DE VAPOR POR MINUTO" },
        { name: "cable_360", title: "CABLE 360" },
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
    itemFilter1: {
        width: '100%',
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
        (async () => {
            await applyfilter({}, true)
            setinitial(1)
        })();
    }, [])

    useEffect(() => {
        // if (initial)
        //     applyfilter(filters)
    }, [filters])


    async function filtrar() {
        applyfilter(filters, true)
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
        console.log("fill", fill)
        const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
            FILTERv2("format", fill.last === "format" ? { ...fill, format: "" } : fill),
            FILTERv2("channel", fill.last === "channel" ? { ...fill, channel: "" } : fill),
            FILTERv2("retail", fill.last === "retail" ? { ...fill, retail: "" } : fill),
            FILTERv2("brand", fill.last === "brand" ? { ...fill, marca: "" } : { ...fill, retail: '', SKU: '' }),
            FILTERv2("model", fill.last === "SKU" ? { ...fill, SKU: "" } : fill),
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
    const URLMACRO = "https://staticfileszyxme.s3.us-east.cloud-object-storage.appdomain.cloud/abrir_aqui_y_click_en_el_boton.xlsm"

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

    console.log(filters.marca.replace("'", ""))

    return (
        <Layout>
            <div style={{}}>
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
                                setfilters({
                                    ...filters,
                                    categoria: value?.id_form || 1,
                                    last: ''
                                });
                            }
                        }}
                    />

                    <MultiSelectFunction
                        title="Marca"
                        classname={classes.itemFilter}
                        datatosend={datafilters.marca}
                        optionvalue="brand"
                        onlyinitial={!cleanFilter}
                        optiondesc="brand"
                        valueselected={filters.marca ? filters.marca.replace(/'/gi, "") : ""}
                        variant="outlined"
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
                                    last: 'SKU',
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
                </div>
            </SwipeableDrawer>
        </Layout>
    );
}

export default BulkLoad;