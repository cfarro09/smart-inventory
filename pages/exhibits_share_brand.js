import React, { useState, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import { Box } from "@material-ui/core";
import triggeraxios from '../config/axiosv2';

import { makeStyles } from '@material-ui/core/styles';
import TableZyx from '../components/system/form/table-simple';
import MultiSelectFunction from '../components/system/form/multiselect';
import Button from '@material-ui/core/Button';
import SelectFunction from '../components/system/form/select-function';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import DateRange from '../components/system/form/daterange';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import InputFormk from '../components/system/form/inputformik';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import popupsContext from '../context/pop-ups/pop-upsContext';

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';

const brands = ["IMACO", "B&D", "BLACKLINE", "BORD", "BOSCH", "BOSSKO", "CONTINENTAL", "CUISINART", "ELECTRICLIFE", "ELECTROLUX", "FINEZZA", "FOSTERIER", "HOLSTEIN", "INDURAMA", "JATARIY", "KENWOOD", "KITCHEN AID", "KORKMAZ", "LOVEN", "MAGEFESA", "MIRAY", "NEX", "OSTER", "PHILIPS", "PRACTIKA", "PRIMA", "PROFESIONAL SERIES", "RECCO", "RECORD", "TAURUS", "THOMAS", "VALESKA", "WURDEN", "ZYKLON", "OTROS", "DOLCE GUSTO", "LUMIKA", "INSTANTPOT", "WINIA", "SMEG", "KENT", "DELONGHI", "SEVERIN", "MIDIA", "FDV", "DAEWOO", "INSTANT"]
const colors = ["#FFD600", "#bababa", "#26A69A", "#009688", "#4f4f4f", "#909090", "#c4c4c4", "#9d9d9d", "#494949", "#b9b9b9", "#545454", "#5e5e5e", "#00897B", "#b8b8b8", "#a2a2a2", "#808080", "#4527A0", "#8a8a8a", "#00695C", "#b5b5b5", "#4DB6AC", "#00796B", "#0c4da2", "#c5c5c5", "#1e1e1e", "#7c7c7c", "#787878", "#B2DFDB", "#444444", "#d3d3d3", "#fb5f5f", "#a9a9a9", "#80CBC4", "#797979", "#5D4037", "#323232", "#7d7d7d", "#bababa", "#2c2c2c", "#828282", "#6d6d6d", "#757575", "#929292", "#6d6d6d", "#6f6f6f", "#bababa", "#bababa"]
const elementBrand = (week) => ({
    week: week,
    "IMACO": 0,
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
const FILTER = (filter) => ({
    method: "SP_SKU_DATE_EXHIBIT",
    data: filter
})
const FILTERBRAND = (filter) => ({
    method: "SP_SKU_BRAND_EXHIBIT",
    data: filter
})
const FILTERPOI = (filter) => ({
    method: "SP_SKU_POINAME_EXHIBIT",
    data: filter
})
const FILTERGraph1 = (filter) => ({
    method: "SP_SKU_CATEGORY_EXHIBIT ",
    data: filter
})
const FILTERTYPEEXH = (filter) => ({
    method: "SP_SKU_TYPE_OF_EXHIBIT ",
    data: filter
})
const FILTERv2 = (filter, filters) => ({
    method: ["brand", "model", "sub_category", "area", "management", "type_exhibit"].includes(filter) ? "SP_ALL_FILTER_MASTER_EXIHIBIT" : "SP_ALL_FILTER_DATA_EXIHIBIT",
    data: {
        filter,
        format: "", //filters?.format || "",
        channel: "", //filters?.channel || "",
        department: "", //filters?.department || "",
        area: "", //filters?.area || "",
        type_exhibit: "", //filters?.type_exhibit || "",
        management: "", //filters?.management || "",
        store_name: "", //filters?.store_name || "",

        category: 4,
        sku_code: filters?.SKU || "",
        brand: filters?.marca || "",
        sub_category: filters?.subcategoria || "",
        retail: filters?.retail || "",
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
    itemFilter1: {
        width: '100%',
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



const Exhibits_share_brand = () => {
    const classes = useStyles();
    const [dataGraphDate, setDataGraphDate] = useState([])
    const [categorybrandSKU, setcategorybrandSKU] = useState([])
    const [categorybrandSKUperc, setcategorybrandSKUperc] = useState([])
    const [resultBrand, setResultBrand] = useState([])
    const [typeexhibit, settypeexhibit] = useState([])
    const [totalbrand, settotalbrand] = useState(0)
    const [poicategory, setpoicategory] = useState([])
    const [poicategoryperc, setpoicategoryperc] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchdone, setsearchdone] = useState(false)
    const [category, setcategory] = useState(null);
    const { setLightBox, setOpenBackdrop } = React.useContext(popupsContext);
    const [orderbrandsDate, setorderbrandsDate] = useState([])
    const [stopFilter, setstopFilter] = useState(-1);
    const [orderbrandsSKU, setorderbrandsSKU] = useState([])
    const [orderbrandspoi, setorderbrandspoi] = useState([])
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
                Header: 'Marca',
                accessor: 'brand',
            },
            {
                Header: 'Tipo de exhibición',
                accessor: 'type_exhibit',
            },
            {
                Header: 'Cantidad',
                accessor: 'cont',
            },
            {
                Header: 'Porcentaje',
                accessor: 'percent',
                Cell: props => {
                    const price = (parseFloat(props.cell.row.original.percent).toFixed(2)) + " %";
                    return (
                        <div style={{ textAlign: 'right' }}>
                            {price}
                        </div>
                    )
                }
            },
        ],
        []
    );

    const [filters, setfilters] = useState({
        format: '',
        channel: '',
        department: '',
        store_name: '',
        management: '',
        SKU: '',
        marca: "",
        subcategoria: "",
        type_exhibit: '',
        area: '',
        retail: ''
    })

    const [datafilters, setdatafilters] = useState({
        format: [],
        channel: [],
        department: [],
        store_name: [],
        subcategoria: [],
        SKU: [],
        banda: [],
        marca: '',
        management: [],
        tipo_pvp: [],
        retail: [],
    })

    useEffect(() => {
        (async () => {
            await applyfilter({})
        })();
    }, [])
    const applyfilter = async (fill) => {
        setOpenBackdrop(true);
        const resultMulti = await triggeraxios('post', process.env.endpoints.multi, [
            FILTERv2("format", fill),
            FILTERv2("channel", fill),
            FILTERv2("retail", fill.last === "retail" ? { ...fill, retail: "" } : fill),
            FILTERv2("brand", fill.last === "brand" ? { ...fill, marca: "" } : { ...fill, retail: '', sku_code: '' }),
            FILTERv2("model", fill.last === "model" ? { ...fill, SKU: "" } : fill),
            FILTERv2("sub_category", fill),
            FILTERv2("store_name", fill),
            FILTERv2("department", fill),
            FILTERv2("management", fill),
            FILTERv2("type_exhibit", fill),
            FILTERv2("area", fill),
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
                management: resarray[8]?.success ? resarray[8].data : [],
                type_exhibit: resarray[9]?.success ? resarray[9].data : [],
                area: resarray[10]?.success ? resarray[10].data : [],
            }));
        }
        setstopFilter(stopFilter * -1);
        setOpenBackdrop(false)
    }
    async function filtrar() {
        setsearchdone(true)
        const filter_to_send = {
            format: filters.format,
            channel: filters.channel,
            department: filters.department,
            store_name: filters.store_name,
            category: 4,
            sku_code: filters.SKU,
            brand: filters.marca,
            management: filters.management,
            sub_category: filters.subcategoria,
            type_exhibit: filters.type_exhibit,
            area: filters.area,
            retail: filters.retail,
            from_date: dateRange[0].startDate.toISOString().substring(0, 10),
            to_date: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        setOpenBackdrop(true)
        const listResultBrand = await triggeraxios('post', process.env.endpoints.selsimple, FILTERBRAND(filter_to_send))
        let resultbrandlistchildren = []
        let counter = 0
        listResultBrand.result.data.map((row) => {
            resultbrandlistchildren.push({ name: (row.brand), cont: (row.cont) })
            counter += row.cont
        })
        settotalbrand(counter)
        setResultBrand(resultbrandlistchildren)

        const listResultDate = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
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
            totalweek[weeks.indexOf(row.Week)] += parseInt(row.cont)
            countbrand[brands.indexOf(row.brand)] += parseInt(row.cont)
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
                    list[row.brand] = ((parseInt(row.cont) / totalweek[weeks.indexOf(row.Week)]) * 100)
                }
            })
        })

        setDataGraphDate(listbrand)




        const listResultSKU = await triggeraxios('post', process.env.endpoints.selsimple, FILTERGraph1(filter_to_send))
        let categories = []
        let skucategory = [];
        let brandlistSKU = [];
        let countbrandSKU = new Array(49).fill(0);
        let uniqueBrands = [];
        let skucategoryperc = [];
        let skucategorytotal = [];
        listResultSKU.result.data.map(row => {
            if (!categories.includes(row.category)) { categories.push(row.category); skucategorytotal.push(0) }
            if (!uniqueBrands.includes(row.brand)) { uniqueBrands.push(row.brand) }
            if (!brandlistSKU.includes(row.brand)) brandlistSKU.push(row.brand)
        })
        listResultSKU.result.data.map(row => {
            skucategorytotal[categories.indexOf(row.category)] += parseInt(row.cont)
            countbrandSKU[brands.indexOf(row.brand)] += parseInt(row.cont)
        })
        categories.map(row => {
            skucategory.push(elementBrand(row))
            skucategoryperc.push(elementBrand(row))
        })
        listResultSKU.result.data.map(row => {
            skucategory.forEach(list => {
                if (list.week === row.category) {
                    list[row.brand] = parseInt(row.cont)
                }
            })
            skucategoryperc.forEach(list => {
                if (list.week === row.category) {
                    list[row.brand] = ((parseInt(row.cont) / skucategorytotal[categories.indexOf(row.category)]) * 100)
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
        const listtypeexhi = await triggeraxios('post', process.env.endpoints.selsimple, FILTERTYPEEXH(filter_to_send))
        settypeexhibit(listtypeexhi.result.data)

        setOpenBackdrop(false)
    }
    function descargar() {
        html2canvas(document.getElementById('divToPrint'))
            .then((canvas) => {
                const pdf = new jsPDF('p', 'px', [1480, 2600]);
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
                    <MultiSelectFunction
                        title="Categoría"
                        classname={classes.itemFilter}
                        datatosend={datafilters.subcategoria}
                        optionvalue="category"
                        optiondesc="category"
                        variant="outlined"
                        namefield="category"
                        descfield="category"
                        callback={(values) => {
                            setfilters({ ...filters, subcategoria: values.map(x => `'${x.category}'`).join(',') });
                        }}
                    />
                    <MultiSelectFunction
                        title="Marca"
                        datatosend={datafilters.marca}
                        classname={classes.itemFilter}
                        optionvalue="brand"
                        optiondesc="brand"
                        valueselected={filters.marca ? filters.marca.replace(/'/gi, "") : ""}
                        variant="outlined"
                        namefield="brand"
                        descfield="brand"
                        style={{ width: "150px" }}
                        callback={(values) => setfilters({ ...filters, marca: values.map(x => `'${x.brand}'`).join(',') })}
                    />
                    <MultiSelectFunction
                        title="Retail"
                        classname={classes.itemFilter}
                        variant="outlined"
                        datatosend={datafilters.retail}
                        optionvalue="retail"
                        optiondesc="retail"
                        valueselected={filters.retail ? filters.retail.replace(/'/gi, "") : ""}
                        namefield="retail"
                        descfield="retail"
                        style={{ width: "200px" }}
                        callback={(values) => setfilters({ ...filters, retail: values.map(x => `'${x.retail}'`).join(',') })}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => filtrar()}
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
                                <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3}>
                                    <PieChart >
                                        <Pie data={resultBrand} dataKey="cont" nameKey="name" fill="#8884d8"
                                            cx="50%"
                                            cy="50%">
                                            {resultBrand.map((entry, index) => (
                                                <Cell key={`exhibicionexmarca-${index}`} fill={colors[brands.indexOf(entry.name)]} />
                                            ))}
                                        </Pie>
                                        <Legend verticalAlign="top" />
                                        <Tooltip formatter={(value, name) => [value + "/" + (value * 100 / totalbrand).toFixed(2) + " %", name]} />
                                    </PieChart  >
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA POR SEMANA EN PORCENTAJE</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3}>
                                    <BarChart data={dataGraphDate}>
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" />
                                        <YAxis domain={[0, 100]} allowDecimals={false} allowDataOverflow={true} />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip itemSorter={item => -(orderbrandsDate.indexOf(item.dataKey))} labelFormatter={(value) => [<b>Semana {value}</b>]} formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        {
                                            orderbrandsDate.map((brand, i) => (
                                                <Bar key={`exhibicionexmarcaperc${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </BarChart >
                                </ResponsiveContainer >

                            </Box>


                        </div>
                        <div className={classes.replacerowzyx}>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA Y CATEGORÍA EN UNIDADES</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={categorybrandSKU} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis />
                                        <Tooltip itemSorter={item => -(orderbrandsSKU.indexOf(item.dataKey))} />
                                        <CartesianGrid />
                                        {
                                            orderbrandsSKU.map((brand, i) => (
                                                <Bar key={`exhicat${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA Y CATEGORÍA EN PORCENTAJE</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={categorybrandSKUperc} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis domain={[0, 100]} allowDecimals={false} allowDataOverflow={true} />
                                        <Tooltip itemSorter={item => -(orderbrandsSKU.indexOf(item.dataKey))} formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        <CartesianGrid />
                                        {
                                            orderbrandsSKU.map((brand, i) => (
                                                <Bar key={`exhicatperc${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
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
                                <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA Y CADENA EN UNIDADES</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={poicategory} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis />
                                        <Tooltip itemSorter={item => -(orderbrandspoi.indexOf(item.dataKey))} />
                                        <CartesianGrid />
                                        {
                                            orderbrandspoi.map((brand, i) => (
                                                <Bar key={`exhicad${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
                                            ))
                                        }
                                    </BarChart>
                                </ResponsiveContainer >

                            </Box>
                            <Box
                                className={classes.itemCard}
                            >
                                <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA Y CADENA EN PORCENTAJE</div>
                                <ResponsiveContainer width={"100%"} aspect={4.0 / 3.0}>
                                    <BarChart data={poicategoryperc} >
                                        <Legend verticalAlign="top" content={renderLegend} />
                                        <XAxis dataKey="week" angle={270} interval={0} textAnchor="end" height={160} dy={5} dx={-5} />
                                        <YAxis domain={[0, 100]} allowDecimals={false} allowDataOverflow={true} />
                                        <Tooltip itemSorter={item => -(orderbrandspoi.indexOf(item.dataKey))} formatter={(value, name) => [value.toFixed(2) + " %", name]} />
                                        <CartesianGrid />
                                        {
                                            orderbrandspoi.map((brand, i) => (
                                                <Bar key={`exhicadperc${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]} />
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
                                <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR TIPO</div>
                                <div style={{ width: "100%" }}>
                                    <TableZyx
                                        columns={columns}
                                        data={typeexhibit}
                                        // fetchData={filtrar}
                                        register={false}
                                    />
                                </div>
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
                    <MultiSelectFunction
                        classname={classes.itemFilter1}
                        title="Formato"
                        datatosend={datafilters.format}
                        optionvalue="format"
                        optiondesc="format"
                        variant="outlined"
                        valueselected={filters.format.replace(/'/gi, "")}
                        namefield="format"
                        descfield="format"
                        callback={(values) => setfilters({ ...filters, format: values.map(x => `'${x.format}'`).join(",") })}
                    />
                    <MultiSelectFunction
                        classname={classes.itemFilter1}
                        title="Canal"
                        datatosend={datafilters.channel}
                        optionvalue="channel"
                        optiondesc="channel"
                        variant="outlined"
                        namefield="channel"
                        valueselected={filters.channel.replace(/'/gi, "")}
                        descfield="channel"
                        callback={(values) => setfilters({ ...filters, channel: values.map(x => `'${x.channel}'`).join(",") })}
                    />
                    <MultiSelectFunction
                        classname={classes.itemFilter1}
                        title="Departamento"
                        datatosend={datafilters.department}
                        optionvalue="department"
                        optiondesc="department"
                        valueselected={filters.department.replace(/'/gi, "")}
                        variant="outlined"
                        namefield="department"
                        descfield="department"
                        callback={(values) => setfilters({ ...filters, department: values.map(x => `'${x.department}'`).join(",") })}
                    />
                    <MultiSelectFunction
                        classname={classes.itemFilter1}
                        title="PDV"
                        datatosend={datafilters.store_name}
                        optionvalue="store_name"
                        optiondesc="store_name"
                        variant="outlined"
                        valueselected={filters.store_name.replace(/'/gi, "")}
                        namefield="store_name"
                        descfield="store_name"
                        callback={(values) => setfilters({ ...filters, store_name: values.map(x => `'${x.store_name}'`).join(",") })}
                    />
                    <MultiSelectFunction
                        classname={classes.itemFilter1}
                        title="Management"
                        datatosend={datafilters.management}
                        optionvalue="management"
                        optiondesc="management"
                        variant="outlined"
                        valueselected={filters.management.replace(/'/gi, "")}
                        namefield="management"
                        descfield="management"
                        callback={(values) => setfilters({ ...filters, management: values.map(x => `'${x.management}'`).join(",") })}
                    />
                    <MultiSelectFunction
                        title="Tipo Exhibición"
                        datatosend={datafilters.type_exhibit}
                        optionvalue="type_exhibit"
                        optiondesc="type_exhibit"
                        variant="outlined"
                        valueselected={filters.type_exhibit.replace(/'/gi, "")}
                        namefield="type_exhibit"
                        descfield="type_exhibit"
                        callback={(values) => setfilters({ ...filters, type_exhibit: values.map(x => `'${x.type_exhibit}'`).join(",") })}
                    />
                    <MultiSelectFunction
                        classname={classes.itemFilter1}
                        title="Área"
                        datatosend={datafilters.area}
                        optionvalue="area"
                        optiondesc="area"
                        variant="outlined"
                        namefield="area"
                        valueselected={filters.area.replace(/'/gi, "")}
                        descfield="area"
                        callback={(values) => setfilters({ ...filters, area: values.map(x => `'${x.area}'`).join(",") })}
                    />
                </div>
            </SwipeableDrawer>
        </Layout>
    );
}

export default Exhibits_share_brand;