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
import { BarChart, Bar, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    const { x, y, width, height, value, datatmp, index } = props;
    const radius = 10;
    return (
        <g>
            <foreignObject x={x} y={y - width - 15} width={width} height={width}>
                <img style={{ width: '100%', height: '100%', borderRadius: width / 2, border: '1px solid #e1e1e1' }} src={datatmp[index].graphic} />
            </foreignObject>
            <text x={x + width / 2} y={y - 5} fill="#000" textAnchor="middle" dominantBaseline="middle">
                S/ {value.toFixed(2)}
            </text>
        </g>
    );
};
const RenderCustomizedLabelonly_Image = (props) => {
    const { x, y, width, height, value, datatmp, index } = props;
    const radius = 10;
    return (
        // <g>

        // </g>
        <g>
            <foreignObject x={x} y={y - width} width={width} height={width}>
                <img style={{ width: '100%', height: '100%', borderRadius: width / 2, border: '1px solid #e1e1e1' }} src={datatmp[index].graphic} />
            </foreignObject>
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
    const [subcategories, setsubcategories] = useState([]);
    const [listmodel, setlistmodel] = useState([]);
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

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            // setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))
            const listResult = await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("format")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("channel")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("department")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY("LINEAL")),
                triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("sub_category")),
            ]);
            setdatafilters({
                ...datafilters,
                channel: validateResArray(listResult[1], continuezyx),
                format: validateResArray(listResult[0], continuezyx),
                department: validateResArray(listResult[2], continuezyx),
                categoria: validateResArray(listResult[3], continuezyx),
                marca: validateResArray(listResult[4], continuezyx),
                subcategoria: validateResArray(listResult[5], continuezyx),
            })
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
    console.log(filters)
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
        htmlToImage.toPng(document.getElementById('divToPrint')).then(function (dataUrl) {
            require("downloadjs")(dataUrl, 'stepchart.png', "image/png");
        });
    }

    const getSubctegories = (id_form) => {
        triggeraxios('post', process.env.endpoints.selsimple, GET_SUBCATEGORY(id_form)).then(x => {
            setsubcategories(validateResArray(x, true))
        })
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
                            variant="outlined"
                            namefield="category"
                            descfield="category"
                            callback={({ newValue: value }) => {
                                getSubctegories(value?.id_form)
                                // setfilters({ ...filters, categoria: value?.id_form || 1 });
                                setdisablebutton(!value)
                                setcategory(value)
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
                                    {enabletop ?
                                        <LabelList
                                            dataKey="price"
                                            position="top"
                                            content={<RenderCustomizedLabel datatmp={dataGraph} />}
                                        // formatter={(value) => `S/.${parseFloat(value).toFixed(2)}`}
                                        /> :
                                        <LabelList
                                            dataKey="price"
                                            position="top"
                                            content={<RenderCustomizedLabel datatmp={dataGraph} />}
                                        // formatter={(value) => `S/.${parseFloat(value).toFixed(2)}`}
                                        />
                                    }
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

export default User;