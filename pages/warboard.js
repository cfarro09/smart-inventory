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
]

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
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

function tmpgetfields(value) {
    if (value.includes("ARROCERA")) {
        return fields[0];
    }
    else if (value.includes("LICUADORA")) {
        return fields[1];
    }
    else if (value.includes("BATIDORA")) {
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
        categoria: 0,
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
            // setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))
            const listResult = await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("format")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("channel")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("department")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("store_name")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY("LINEAL")),
                triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("model")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("retail")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("sub_category")),
            ]);
            setdatafilters({
                ...datafilters,
                channel: validateResArray(listResult[1], continuezyx),
                format: validateResArray(listResult[0], continuezyx),
                department: validateResArray(listResult[2], continuezyx),
                store_name: validateResArray(listResult[3], continuezyx),
                categoria: validateResArray(listResult[4], continuezyx),
                marca: validateResArray(listResult[5], continuezyx),
                SKU: validateResArray(listResult[6], continuezyx),
                retail: validateResArray(listResult[7], continuezyx),
                subcategoria: validateResArray(listResult[8], continuezyx),
            })
        })();
        return () => continuezyx = false;
    }, [])
    

    async function filtrar() {
        setsearchdone(true)
        setpvpprom(true)
        setpvpreg(true)
        setcategorysearchfield(category.category)

        const constfieldstouse = tmpgetfields(category.category);

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
        setDataGraph(listResult.result?.data||[])
        
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
                    acc[indexfound].push(value)
                }
            });
            return acc;
        }, arrayinitials)

        setDataArray(ff)
    }
    function setcategorysearchfield(value) {
        if (value.includes("ARROCERA")) {
            setfieldstoshow(fields[0])
        }
        else if (value.includes("LICUADORA")) {
            setfieldstoshow(fields[1])
        }
        else if (value.includes("BATIDORA")) {
            setfieldstoshow(fields[2])
        }
    }

    
    function generateZIP() {
        console.log('TEST');
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
        
        dataGraph.map((row,i)=>{
            JSZipUtils.getBinaryContent(row.graphic, function (err, data) {
                if (err) {
                    //throw err; // or handle the error
                    console.log(err);
                }
                //zip.file(`image-${i}.jpg`, data, { binary: true });
                count++;
                if (count == dataGraph.length) {
                    zip.file(`warboard.xlsx`, dataexcel, { binary: true });
                    zip.generateAsync({ type: 'blob' }).then(function (content) {
                        saveAs(content, zipFilename);
                        setOpenBackdrop(false)
                    });
                }
            });
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
                            setdisablebutton(!value)
                            setfilters({ ...filters, categoria: value?.id_form || 1 });
                            setcategory(value)
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
                        callback={({ newValue: value }) => setfilters({ ...filters, marca: value?.brand || '' })}
                    />

                    <SelectFunction
                        title="SKU"
                        datatosend={datafilters.SKU}
                        optionvalue="model_2"
                        optiondesc="model_2"
                        valueselected={filters.SKU}
                        variant="outlined"
                        namefield="model_2"
                        descfield="model_2"
                        callback={({ newValue: value }) => setfilters({ ...filters, SKU: value?.model_2 || '' })}
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
                        datatosend={datafilters.subcategoria}
                        optionvalue="sub_category"
                        optiondesc="sub_category"
                        variant="outlined"
                        namefield="sub_category"
                        descfield="sub_category"
                        callback={({ newValue: value }) => {
                            setfilters({ ...filters, subcategoria: value?.sub_category || "" });
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

export default BulkLoad;