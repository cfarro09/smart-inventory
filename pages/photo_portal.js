import React, { useState, useEffect, Component, Fragment } from 'react';
import Layout from '../components/system/layout/layout'
import triggeraxios from '../config/axiosv2';

import { withStyles, makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import DateRange from '../components/system/form/daterange';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import TableRow from '@material-ui/core/TableRow';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import Tooltip from '@material-ui/core/Tooltip';
import InputFormk from '../components/system/form/inputformik';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Typography from '@material-ui/core/Typography';
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import { saveAs } from 'file-saver';
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
function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        margin: "-120px 0",
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))(Tooltip);

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
})
const FILTER = (filter) => ({
    method: "SP_PHOTO_PORTAL",
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


const Photo_portal = () => {
    const classes = useStyles();
    const [waitFilter, setWaitFilter] = useState(false)
    const [dataGraph, setDataGraph] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [category, setcategory] = useState(null);
    const { setLightBox, setOpenBackdrop } = React.useContext(popupsContext);
    const [subcategories, setsubcategories] = useState([]);
    const [initial, setinitial] = useState(0);
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
    function generateZIP() {
        console.log('TEST');
        var zip = new JSZip();
        var count = 0;
        var zipFilename = "Pictures.zip";
        setOpenBackdrop(true)
        dataGraph.map((row, i) => {
            JSZipUtils.getBinaryContent(row.photo_url, function (err, data) {
                if (err) {
                    //throw err; // or handle the error
                    console.log(err);
                }
                zip.file(`${row.form_timestamp.split(' ')[0]} - ${row.brand} - ${row.model} - ${row.poiname}.jpg`, data, { binary: true });
                count++;
                if (count == dataGraph.length) {
                    zip.generateAsync({ type: 'blob' }).then(function (content) {
                        saveAs(content, zipFilename);
                        setOpenBackdrop(false)
                    });
                }
            });
        })
    }

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
            await applyfilter({}, true)
            setinitial(1)
        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        if (initial)
            applyfilter(filters)
    }, [filters])

    
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
        setOpenBackdrop(false);
    }

    async function filtrar() {
        //setWaitFilter(true)
        setDataGraph([])
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
        setDataGraph(listResult.result.data)

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
                                if (!cleanFilter) {
                                    setfilters({ ...filters, categoria: values.map(x => x.id_form).join(',') });
                                    setcategory(values.map(x => x.id_form).join(','))
                                    setdisablebutton(!values)
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
                    {dataGraph.length ?
                        <Fragment>
                            <Button
                                style={{ backgroundColor: 'rgb(85, 189, 132)', color: '#FFF' }}
                                onClick={() => generateZIP()}
                                startIcon={<GetAppIcon style={{ color: '#FFF' }} />}
                            >Descargar ZIP</Button>
                        </Fragment> : ""
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
                            disabled={true}
                            label="Última Actualización"
                        />
                    }
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: "wrap" }} id="divToPrint">
                    {dataGraph.map((row, i) => (
                        <Box key={i}>
                            <HtmlTooltip
                                placement="bottom"
                                title={
                                    <Fragment>
                                        <Typography color="inherit">{`Tienda: ${row.poiname}`}</Typography>
                                        <Typography color="inherit">{`Marca: ${row.brand}`}</Typography>
                                        <Typography color="inherit">{`Modelo: ${row.model}`}</Typography>
                                        <Typography color="inherit">{`Subcategoría: ${row.subcategory}`}</Typography>
                                        <Typography color="inherit">{`Fecha: ${row.form_timestamp.split(' ')[0]}`}</Typography>
                                    </Fragment>
                                }>
                                <img
                                    style={{ height: "150px", width: "150px", objectFit: 'cover' }}
                                    alt="image.jpg"
                                    src={row.photo_url}
                                    crossOrigin="*"
                                    onClick={() => setLightBox({ open: true, index: i, images: dataGraph.map(x => x.photo_url) })}
                                />
                            </HtmlTooltip>
                        </Box>
                    ))}
                </div>
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
                        datatosend={subcategories}
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

export default Photo_portal;