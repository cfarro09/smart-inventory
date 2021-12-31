import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import triggeraxios from '../config/axiosv2';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import InputFormk from '../components/system/form/inputformik';
import { BarChart, Bar, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import DateRange from '../components/system/form/daterange';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import popupsContext from '../context/pop-ups/pop-upsContext';
import * as htmlToImage from 'html-to-image';

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
})

const GET_SUBCATEGORY = (id_form) => ({
    method: "SP_SUBCATEGORY_BYID",
    data: {
        id_form
    }
})

const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
        type: filter
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
    method: "SP_STEP_UP_CHAR",
    data: filter
})

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}

const brands = ["IMACO", "B&D", "BLACKLINE", "BORD", "BOSCH", "BOSSKO", "CONTINENTAL", "CUISINART", "ELECTRICLIFE", "ELECTROLUX", "FINEZZA", "FOSTERIER", "HOLSTEIN", "INDURAMA", "JATARIY", "KENWOOD", "KITCHEN AID", "KORKMAZ", "LOVEN", "MAGEFESA", "MIRAY", "NEX", "OSTER", "PHILIPS", "PRACTIKA", "PRIMA", "PROFESIONAL SERIES", "RECCO", "RECORD", "TAURUS", "THOMAS", "VALESKA", "WURDEN", "ZYKLON", "OTROS", "DOLCE GUSTO", "LUMIKA", "INSTANTPOT", "WINIA", "SMEG", "KENT", "DELONGHI", "SEVERIN", "MIDIA", "FDV", "DAEWOO"]
const colors = ["#FFD600", "#bababa", "#26A69A", "#009688", "#4f4f4f", "#909090", "#c4c4c4", "#9d9d9d", "#494949", "#b9b9b9", "#545454", "#5e5e5e", "#00897B", "#b8b8b8", "#a2a2a2", "#808080", "#4527A0", "#8a8a8a", "#00695C", "#b5b5b5", "#4DB6AC", "#00796B", "#0c4da2", "#c5c5c5", "#1e1e1e", "#7c7c7c", "#787878", "#B2DFDB", "#444444", "#d3d3d3", "rgb(251, 95, 95)", "#a9a9a9", "#80CBC4", "#797979", "#5D4037", "#323232", "#7d7d7d", "#bababa", "#2c2c2c", "#828282", "#6d6d6d", "#757575", "#929292", "#6d6d6d", "#6f6f6f", "#bababa"]

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


const useStyles = makeStyles(() => ({
    containerFilters: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        flex: 1,
    },
    itemFilter: {
        flex: '0 0 215px'
    }
}));

const RenderCustomizedLabel = (props) => {
    const { x, y, width, height, value, datatmp, index, enabletop } = props;
    const radius = 10;
    return (
        <g>
            <foreignObject x={x} y={y - width - 15} width={width} height={width}>
                <img style={{ width: '100%', height: '100%', borderRadius: width / 2, border: '1px solid #e1e1e1' }} src={datatmp[index].graphic} />
            </foreignObject>
            <text
                x={x + width / 2}
                y={y - 5}
                fill="#000"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={enabletop ? '12px' : '8px'}
                writingMode={enabletop ? 'horizontal-tb' : 'vertical-rl'}
            >
                {enabletop ? "S/." : ""}{value.toFixed(1)}
            </text>
        </g>
    );
};

const User = () => {
    const classes = useStyles();
    const [waitFilter, setWaitFilter] = useState(false)
    const [dataGraph, setDataGraph] = useState([])
    const [datagraphlength, setdatagraphlength] = useState(0)
    const [datainitial, setdatainitial] = useState([])
    const [disablebutton, setdisablebutton] = useState(true)
    const [searchdone, setsearchdone] = useState(false)
    const [enabletop, setenabletop] = useState(true)
    const [category, setcategory] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { setLightBox, setOpenBackdrop } = React.useContext(popupsContext);
    const [cleanFilter, setcleanFilter] = useState(false);
    const [stopFilter, setstopFilter] = useState(-1);
    const [initial, setinitial] = useState(0);

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
        retail: '',
        tipo_pvp: 'prom_price',
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
        retail: [],
        tipo_pvp: [],
        subcategoria: [],
    })

    useEffect(() => {
        if (enabletop) {
            setDataGraph(datainitial.length < 10 ? datainitial : datainitial.slice(datainitial.length - 10, datainitial.length))
        } else {
            setDataGraph(datainitial)
        }
    }, [enabletop])

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

    async function filtrar() {
        setsearchdone(true)
        //setWaitFilter(true)
        const filter_to_send = {
            format: filters.format,
            channel: filters.channel,
            department: filters.department,
            store_name: filters.store_name,
            category: filters.categoria,
            sku_code: filters.SKU,
            brand: filters.marca,
            retail: filters.retail,
            sub_category: filters.subcategoria,
            price: filters.tipo_pvp,
            from_date: dateRange[0].startDate.toISOString().substring(0, 10),
            to_date: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        setOpenBackdrop(true)
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
        setOpenBackdrop(false)
        const ff = listResult.result.data.map(x => ({ ...x, price: parseFloat(x.price) }));
        setdatainitial(ff);
        setDataGraph(enabletop ? ff.length < 10 ? ff : ff.slice(ff.length - 10, ff.length) : ff);
        setdatagraphlength(ff?.length || 0);

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

    function descargar() {
        htmlToImage.toPng(document.getElementById('divToPrint')).then(function (dataUrl) {
            require("downloadjs")(dataUrl, 'stepchart.png', "image/png");
        });
    }

    return (
        <Layout>
            <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
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
                            onlyinitial={!cleanFilter}
                            variant="outlined"
                            namefield="category"
                            descfield="category"
                            callback={({ newValue: value }) => {
                                if (!cleanFilter) {
                                    setfilters({ ...filters, categoria: value?.id_form || 1 });
                                    setcategory(value)
                                    setdisablebutton(!value)
                                }
                            }}
                        />

                        <SelectFunction
                            title="Marca"
                            datatosend={datafilters.marca}
                            optionvalue="brand"
                            optiondesc="brand"
                            valueselected={filters.marca}
                            onlyinitial={!cleanFilter}
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
                            title="SKU"
                            datatosend={datafilters.SKU}
                            optionvalue="model"
                            optiondesc="model"
                            valueselected={filters.SKU}
                            onlyinitial={!cleanFilter}
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
                            title="Retail"
                            variant="outlined"
                            datatosend={datafilters.retail}
                            optionvalue="retail"
                            optiondesc="retail"
                            valueselected={filters.retail}
                            onlyinitial={!cleanFilter}
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
                            onClick={() => {
                                setcleanFilter(true)
                            }}
                        >Limpiar filtros</Button>
                    </div>
                    {category &&
                        <InputFormk
                            valuedefault={category?.last_consulted}
                            variant="outlined"
                            disabled={true}
                            label="Última Actualización"
                        />
                    }
                </div>
                {searchdone ?
                    <div style={{ display: 'flex', gap: 8, background: "white" }} id="divToPrint">
                        <ResponsiveContainer aspect={4.0 / 2}>
                            <BarChart
                                data={dataGraph}
                                margin={{ top: enabletop ? 150 : (datagraphlength <= 10 ? 150 : 1500 / datagraphlength) }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="model" style={{ fontSize: "0.8em" }} angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                <XAxis dataKey="model" style={{ fontSize: "0.8em" }} angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                <YAxis type="number" domain={[0, Math.ceil((dataGraph[dataGraph.length - 1]?.price || 0) / 10) * 10]} />
                                <Tooltip formatter={(value) => { return `S/.${parseFloat(value).toFixed(2)}` }} />
                                <Bar
                                    layout="horizontal"
                                    dataKey="price"
                                    fill="#0c4da2"
                                    maxBarSize={100}
                                >
                                    {
                                        dataGraph.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[brands.indexOf(entry.brand)]} />
                                        ))
                                    }
                                    <LabelList
                                        dataKey="price"
                                        position="top"
                                        content={<RenderCustomizedLabel datatmp={dataGraph} enabletop={enabletop} />}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div> : ""
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
                    {searchdone &&
                        <FormGroup>
                            <FormControlLabel control={<Switch checked={enabletop} onChange={(e) => { setenabletop(e.target.checked) }} />} label={enabletop ? "Mostrando Top 10" : "Mostrando todo"} />
                        </FormGroup>
                    }
                    <SelectFunction
                        title="Formato"
                        datatosend={datafilters.format}
                        optionvalue="format"
                        optiondesc="format"
                        onlyinitial={!cleanFilter}
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
                        title="Canal"
                        datatosend={datafilters.channel}
                        optionvalue="channel"
                        optiondesc="channel"
                        onlyinitial={!cleanFilter}
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
                        title="Departamento"
                        datatosend={datafilters.department}
                        optionvalue="department"
                        onlyinitial={!cleanFilter}
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
                        title="PDV"
                        datatosend={datafilters.store_name}
                        optionvalue="store_name"
                        optiondesc="store_name"
                        variant="outlined"
                        onlyinitial={!cleanFilter}
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
                        title="Subcategoría"
                        datatosend={datafilters.subcategoria}
                        optionvalue="subcategory"
                        optiondesc="subcategory"
                        onlyinitial={!cleanFilter}
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

export default User;