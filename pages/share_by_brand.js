import React, { useState, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import { Box } from "@material-ui/core";
import triggeraxios from '../config/axiosv2';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const brands = ["IMACO", "B&D", "BLACKLINE", "BORD", "BOSCH", "BOSSKO", "CONTINENTAL", "CUISINART", "ELECTRICLIFE", "ELECTROLUX", "FINEZZA", "FOSTERIER", "HOLSTEIN", "INDURAMA", "JATARIY", "KENWOOD", "KITCHEN AID", "KORKMAZ", "LOVEN", "MAGEFESA", "MIRAY", "NEX", "OSTER", "PHILIPS", "PRACTIKA", "PRIMA", "PROFESIONAL SERIES", "RECCO", "RECORD", "TAURUS", "THOMAS", "VALESKA", "WURDEN", "ZYKLON", "OTROS", "DOLCE GUSTO", "LUMIKA", "INSTANTPOT","WINIA","SMEG","KENT","DELONGHI","SEVERIN","MIDIA","FDV","DAEWOO", "INSTANT"]
const colors = ["#FFD600", "#bababa", "#26A69A", "#009688", "#4f4f4f", "#909090", "#c4c4c4", "#9d9d9d", "#494949", "#b9b9b9", "#545454", "#5e5e5e", "#00897B", "#b8b8b8", "#a2a2a2", "#808080", "#4527A0", "#8a8a8a", "#00695C", "#b5b5b5", "#4DB6AC", "#00796B", "#0c4da2", "#c5c5c5", "#1e1e1e", "#7c7c7c", "#787878", "#B2DFDB", "#444444", "#d3d3d3", "#fb5f5f", "#a9a9a9", "#80CBC4", "#797979", "#5D4037", "#323232", "#7d7d7d", "#bababa", "#2c2c2c", "#828282", "#6d6d6d", "#757575", "#929292", "#6d6d6d", "#6f6f6f", "#bababa", "#bababa"]
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
    "DAEWOO": 0, 
    "INSTANT": 0,
})

const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
        type: filter
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
    
    const [triggerfilter, settriggerfilter] = useState(false)
    const [disablebutton, setdisablebutton] = useState(true)
    const [cleanfilters, setcleanfilters] = useState(false)
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
    const [cleanFilter, setcleanFilter] = useState(false);
    const [stopFilter, setstopFilter] = useState(-1);

    useEffect(() => {
        if (initial === 1) {
            // await triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY("LINEAL"))
            filtrar()
        }
    }, [initial])

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

    const applyfilter = async (fill, initial = false) => {
        if (initial) {
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
    }

    useEffect(() => {
        
        (async () => {
            await applyfilter({}, true)
            setinitial(1)
        })();
        
    }, [])

    useEffect(() => {
        console.log('aplyfilter', initial)
        if (initial)
            applyfilter(filters, !!initial)
    }, [filters])

    useEffect(() => {
        if (cleanfilters) {
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
            setcleanfilters(false)
        }
    }, [cleanfilters])


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
            retail: filters.retail,
            price: filters.tipo_pvp,
            from_date: dateRange[0].startDate.toISOString().substring(0, 10),
            to_date: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        setOpenBackdrop(true)

        const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
            FILTER(filter_to_send),
            FILTERDATE(filter_to_send),
            FILTERGraph1(filter_to_send),
            FILTERPOI(filter_to_send)
        ])

        const listResult = resultMulti.result[0]

        listResult.data.forEach((row) => {
            count += row.cont
        })
        const dd = listResult.data.map(x => ({
            ...x,
            percent: (x.cont / count) * 100,
        }))
        setDataGraph(dd)
        const listResultDate = resultMulti.result[1]
        let listbrand = [];
        let brandlist = [];
        let weeks = [];
        let totalweek = [];
        let countbrand = new Array(49).fill(0);

        listResultDate.data.map(row => {
            if (!weeks.includes(row.Week)) { weeks.push(row.Week); totalweek.push(0) }
            if (!brandlist.includes(row.brand)) brandlist.push(row.brand)
        })
        listResultDate.data.map(row => {
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
        listResultDate.data.map(row => {
            listbrand.forEach(list => {
                if (list.week === row.Week) {
                    list[row.brand] = ((parseInt(row.cnt) / totalweek[weeks.indexOf(row.Week)]) * 100)
                }
            })
        })
        setDataGraphDate(listbrand)
        settotalSKA(count)

        const listResultSKU = resultMulti.result[2]
        let categories = []
        let skucategory = [];
        let brandlistSKU = [];
        let skucategoryperc = [];
        let skucategorytotal = [];
        let countbrandSKU = new Array(49).fill(0);
        listResultSKU.data.map(row => {
            if (!categories.includes(row.subcategory)) { categories.push(row.subcategory); skucategorytotal.push(0) }
            if (!brandlistSKU.includes(row.brand)) brandlistSKU.push(row.brand)
        })
        listResultSKU.data.map(row => {
            skucategorytotal[categories.indexOf(row.subcategory)] += parseInt(row.cont)
            countbrandSKU[brands.indexOf(row.brand)] += parseInt(row.cont)
        })
        categories.map(row => {
            skucategory.push(elementBrand(row))
            skucategoryperc.push(elementBrand(row))
        })
        listResultSKU.data.map(row => {
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


        const listpoiresult = resultMulti.result[3]
        let categoriespoi = []
        let poicategories = [];
        let poicategoriesperc = [];
        let brandlistpoi = [];
        let poicategoriestotal = [];
        let countbrandpoi = new Array(49).fill(0);
        listpoiresult.data.map(row => {
            if (!categoriespoi.includes(row.retail)) { categoriespoi.push(row.retail); poicategoriestotal.push(0) }
            if (!brandlistpoi.includes(row.brand)) brandlistpoi.push(row.brand)
        })
        listpoiresult.data.map(row => {
            poicategoriestotal[categoriespoi.indexOf(row.retail)] += parseInt(row.cont)
            countbrandpoi[brands.indexOf(row.brand)] += parseInt(row.cont)
        })
        categoriespoi.map(row => {
            poicategories.push(elementBrand(row))
            poicategoriesperc.push(elementBrand(row))
        })
        listpoiresult.data.map(row => {
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
                        onlyinitial={!cleanFilter}
                        namefield="category"
                        descfield="category"
                        valueselected={filters.categoria}
                        callback={({ newValue: value }) => {
                            setdisablebutton(!value)
                            if (value?.id_form && !cleanFilter) {
                                setcategory(value)
                                setfilters({ ...filters, categoria: value?.id_form || 1 });
                                // settriggerfilter(!triggerfilter)
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
                            console.log(cleanFilter)
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
                        variant="outlined"
                        namefield="model"
                        onlyinitial={!cleanFilter}
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
                        onlyinitial={!cleanFilter}
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
                        onlyinitial={!cleanFilter}
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
                        onlyinitial={!cleanFilter}
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
                        title="Subcategoría"
                        datatosend={datafilters.subcategoria}
                        optionvalue="subcategory"
                        onlyinitial={!cleanFilter}
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