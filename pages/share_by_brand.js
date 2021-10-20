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

const brands = ["B&D", "BLACKLINE", "BORD", "BOSCH", "BOSSKO", "CONTINENTAL", "CUISINART", "ELECTRICLIFE", "ELECTROLUX", "FINEZZA", "FOSTERIER", "HOLSTEIN", "IMACO", "INDURAMA", "INSTAN POT", "JATARIY", "KENWOOD", "KITCHEN AID", "KORKMAZ", "LOVEN", "MAGEFESA", "MIRAY", "NEX", "OSTER", "PHILIPS", "PRACTIKA", "PRIMA", "PROFESIONAL SERIES", "RECCO", "RECORD", "TAURUS", "THOMAS", "VALESKA", "WURDEN", "ZYKLON", "OTROS", "DOLCE GUSTO"]
const colors = ["#bababa", "#575757", "#868686", "#4f4f4f", "#909090", "#c4c4c4", "#9d9d9d", "#494949", "#b9b9b9", "#545454", "#5e5e5e", "#535353", "yellow", "#b8b8b8", "#818181", "#a2a2a2", "#808080", "#838383", "#8a8a8a", "#929292", "#b5b5b5", "#d9d9d9", "#888888", "#0c4da2", "#c5c5c5", "#1e1e1e", "#7c7c7c", "#787878", "#565656", "#444444", "#d3d3d3", "rgb(251, 95, 95)", "#a9a9a9", "#878787", "#797979", "#797979", "#797979"]
const elementBrand = (week) => ({
    week: week,
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
    "IMACO": 0,
    "INDURAMA": 0,
    "INSTAN POT": 0,
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
    "OTROS": 0
})

const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
        type: filter
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
        color: "blue"
    }
}));

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${label} : ${payload[0].value}`}</p>

            </div>
        );
    }

    return null;
};

const Share_by_brand = () => {
    const classes = useStyles();
    const [waitFilter, setWaitFilter] = useState(false)
    const [dataGraph, setDataGraph] = useState([])
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
        retail: ''
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
            ]);
            filtrar()
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
            })
        })();
        return () => continuezyx = false;
    }, [])
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
            sub_category: '',
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
        const listResultDate = await triggeraxios('post', process.env.endpoints.selsimple, FILTERDATE(filter_to_send))
        let listbrand = [];
        let weeks = [];
        let totalweek = [];

        listResultDate.result.data.map(row => {
            if (!weeks.includes(row.Week)) { weeks.push(row.Week); totalweek.push(0) }
        })
        listResultDate.result.data.map(row => {
            totalweek[weeks.indexOf(row.Week)] += parseInt(row.cnt)
        })
        weeks.map(row => {
            listbrand.push(elementBrand(row))
        })
        listResultDate.result.data.map(row => {
            listbrand.forEach(list => {
                if (list.week === row.Week) {
                    list[row.brand] = Math.floor((parseInt(row.cnt) / totalweek[weeks.indexOf(row.Week)]) * 100)
                }
            })
        })
        setDataGraphDate(listbrand)
        settotalSKA(count)

        const listResultSKU = await triggeraxios('post', process.env.endpoints.selsimple, FILTERGraph1(filter_to_send))
        let categories = []
        let skucategory = [];
        let skucategoryperc = [];
        let skucategorytotal = [];
        listResultSKU.result.data.map(row => {
            if (!categories.includes(row.subcategory)) { categories.push(row.subcategory); skucategorytotal.push(0) }
        })
        listResultSKU.result.data.map(row => {
            skucategorytotal[categories.indexOf(row.subcategory)] += parseInt(row.cont)
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
                    list[row.brand] = Math.floor((parseInt(row.cont) / skucategorytotal[categories.indexOf(row.subcategory)]) * 100)
                }
            })
        })
        setcategorybrandSKU(skucategory)
        setcategorybrandSKUperc(skucategoryperc)

        const listpoiresult = await triggeraxios('post', process.env.endpoints.selsimple, FILTERPOI(filter_to_send))
        let categoriespoi = []
        let poicategories = [];
        let poicategoriesperc = [];
        let poicategoriestotal = [];
        listpoiresult.result.data.map(row => {
            if (!categoriespoi.includes(row.retail)) { categoriespoi.push(row.retail); poicategoriestotal.push(0) }
        })
        console.log(listpoiresult.result.data)
        listpoiresult.result.data.map(row => {
            poicategoriestotal[categoriespoi.indexOf(row.retail)] += parseInt(row.cont)
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
                    list[row.brand] = Math.floor((parseInt(row.cont) / poicategoriestotal[categoriespoi.indexOf(row.retail)]) * 100)
                }
            })
        })
        setpoicategory(poicategories)
        setpoicategoryperc(poicategoriesperc)
        setOpenBackdrop(false)
    }
    function descargar() {
        html2canvas(document.getElementById('divToPrint'))
            .then((canvas) => {
                const pdf = new jsPDF('l', 'mm', 'a4');
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
                        optionvalue="category"
                        optiondesc="category"
                        variant="outlined"
                        namefield="category"
                        descfield="category"
                        callback={({ newValue: value }) => {
                            setfilters({ ...filters, categoria: value?.id_form || 1 });
                            setcategory(value)
                            setdisablebutton(!value)
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
                                <div className={classes.titlecards}>Cantidad de SKUS por Marca</div>
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell align="center">N* SKU's</TableCell>
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
                                <div className={classes.titlecards}>Cantidad de SKUS por Marca por Semana</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.5}>
                                    <BarChart data={dataGraphDate}>
                                        <XAxis dataKey="week" />
                                        <YAxis domain={[0, 100]} />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip
                                            labelFormatter={(value) => [<b>Semana {value}</b>]}
                                            formatter={(value, name) => [value.toFixed(2) + " %", name]}
                                        />
                                        {
                                            brands.map((brand, i) => {
                                                return (
                                                    <Bar
                                                        key={brand}
                                                        type="monotone"
                                                        dataKey={brand}
                                                        stackId="a"
                                                        fill={colors[i]}
                                                        label={{content: () => brand}}
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
                                <div className={classes.titlecards}>Cantidad de SKUS por Marca y Categoría</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={categorybrandSKU} >
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor ="end" height={160} dy={5} dx={-5}/>
                                        <YAxis />
                                        <Tooltip />
                                        <CartesianGrid />
                                        {
                                            brands.map((brand, i) => (
                                                <Bar key={brand} type="monotone" dataKey={brand} stackId="a" fill={colors[i]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>Cantidad de SKUS por Marca y Categoría %</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={categorybrandSKUperc} >
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor ="end" height={160} dy={5} dx={-5}/>
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        <CartesianGrid />
                                        {
                                            brands.map((brand, i) => (
                                                <Bar key={brand} type="monotone" dataKey={brand} stackId="a" fill={colors[i]} />
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
                                <div className={classes.titlecards}>Cantidad de SKUS por Marca y Cadena</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={poicategory} >
                                        <XAxis dataKey="week" />
                                        <YAxis />
                                        <Tooltip />
                                        <CartesianGrid />
                                        {
                                            brands.map((brand, i) => (
                                                <Bar key={brand} type="monotone" dataKey={brand} stackId="a" fill={colors[i]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>Cantidad de SKUS por Marca y Cadena %</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={poicategoryperc} >
                                        <XAxis dataKey="week" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        <CartesianGrid />
                                        {
                                            brands.map((brand, i) => (
                                                <Bar key={brand} type="monotone" dataKey={brand} stackId="a" fill={colors[i]} />
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