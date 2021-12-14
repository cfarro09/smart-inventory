import React, { useState, useContext, useEffect, Component } from 'react';
import Layout from '../components/system/layout/layout'
import { Box,Theme } from "@material-ui/core";
import triggeraxios from '../config/axiosv2';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableZyx from '../components/system/form/table-simple';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import { LineChart ,  BarChart , Bar, Treemap, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,PieChart,Pie,Cell, ResponsiveContainer } from 'recharts';
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
function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }
  
const dataTable = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  const DEFAULT_COLORS = [
    '#7A871E',
    '#DAD870',
    '#FFCD58',
    '#FF9636',
    '#FF5C4D',
    '#9F2B00',
];

const brands = ["IMACO", "B&D", "BLACKLINE", "BORD", "BOSCH", "BOSSKO", "CONTINENTAL", "CUISINART", "ELECTRICLIFE", "ELECTROLUX", "FINEZZA", "FOSTERIER", "HOLSTEIN", "INDURAMA", "JATARIY", "KENWOOD", "KITCHEN AID", "KORKMAZ", "LOVEN", "MAGEFESA", "MIRAY", "NEX", "OSTER", "PHILIPS", "PRACTIKA", "PRIMA", "PROFESIONAL SERIES", "RECCO", "RECORD", "TAURUS", "THOMAS", "VALESKA", "WURDEN", "ZYKLON", "OTROS", "DOLCE GUSTO", "LUMIKA", "INSTANTPOT","WINIA","SMEG","KENT","DELONGHI","SEVERIN","MIDIA","FDV","DAEWOO"]
const colors = ["#FFD600", "#bababa", "#26A69A", "#009688", "#4f4f4f", "#909090", "#c4c4c4", "#9d9d9d", "#494949", "#b9b9b9", "#545454", "#5e5e5e", "#00897B", "#b8b8b8", "#a2a2a2", "#808080", "#4527A0", "#8a8a8a", "#00695C", "#b5b5b5", "#4DB6AC", "#00796B", "#0c4da2", "#c5c5c5", "#1e1e1e", "#7c7c7c", "#787878", "#B2DFDB", "#444444", "#d3d3d3", "rgb(251, 95, 95)", "#a9a9a9", "#80CBC4", "#797979", "#5D4037", "#323232", "#7d7d7d", "#bababa", "#2c2c2c", "#828282", "#6d6d6d", "#757575", "#929292", "#6d6d6d", "#6f6f6f", "#bababa"]
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

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
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
const FILTERTYPEEXH= (filter) => ({
    method: "SP_SKU_TYPE_OF_EXHIBIT ",
    data: filter
})
const GET_FILTERRETAIL = (filter,id_form) => ({
    method: "SP_FILTER_BYID",
    data: {
        filter,
        id_form
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
    titlecards:{
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
    svgstyle:{
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: "4px",        
    }
}));

const RB_MARCA = {
    "method": "SP_SEL_DATA_MASTER",
    "data": {
        "filter": "brand"
    }
}


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
                    const price = ( parseFloat(props.cell.row.original.percent).toFixed(2))+" %";
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
        retail:[],
    })
    

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            const listResult = await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("format")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("channel")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("department")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("store_name",4)),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("category")),
                triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("management")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTERRETAIL("retail",4)),
            ]);
            setdatafilters({
                ...datafilters,
                channel: validateResArray(listResult[1], continuezyx),
                format: validateResArray(listResult[0], continuezyx),
                department: validateResArray(listResult[2], continuezyx),
                store_name: validateResArray(listResult[3], continuezyx),
                subcategoria: validateResArray(listResult[4], continuezyx),
                marca: validateResArray(listResult[5], continuezyx),
                management: validateResArray(listResult[6], continuezyx),
                retail: validateResArray(listResult[7], continuezyx),
            })
        })();
        return () => continuezyx = false;
    }, [])
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
        let counter=0
        listResultBrand.result.data.map((row)=>{
            resultbrandlistchildren.push({name: (row.brand), cont:(row.cont)})
            counter+=row.cont
        })
        settotalbrand(counter)
        setResultBrand(resultbrandlistchildren)

        const listResultDate = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
        let listbrand=[];
        let brandlist = [];
        let weeks=[];
        let totalweek=[];
        let countbrand=new Array(49).fill(0);

        listResultDate.result.data.map(row=>{
            if(!weeks.includes(row.Week)) {weeks.push(row.Week);totalweek.push(0)}
            if (!brandlist.includes(row.brand)) brandlist.push(row.brand)
        })
        listResultDate.result.data.map(row=>{
            totalweek[weeks.indexOf(row.Week)] += parseInt(row.cont)
            countbrand[brands.indexOf(row.brand)] += parseInt(row.cont)
        })
        weeks.map(row=>{
            listbrand.push(elementBrand(row))
        })
        function compare( a, b ) {
            if ( countbrand[brands.indexOf(a)] < countbrand[brands.indexOf(b)] ){
                return -1;
            }
            if ( countbrand[brands.indexOf(a)] > countbrand[brands.indexOf(b)] ){
                return 1;
            }
            return 0;
        }
        brandlist.sort( compare );
        setorderbrandsDate(brandlist)
        listResultDate.result.data.map(row=>{
            listbrand.forEach(list=>{
                if(list.week===row.Week){
                    list[row.brand]= ((parseInt(row.cont)/totalweek[weeks.indexOf(row.Week)])*100)
                }
            })
        })

        setDataGraphDate(listbrand)




        const listResultSKU = await triggeraxios('post', process.env.endpoints.selsimple, FILTERGraph1(filter_to_send))
        let categories= []
        let skucategory=[];
        let brandlistSKU = [];
        let countbrandSKU=new Array(49).fill(0);
        let uniqueBrands = [];
        let skucategoryperc=[];
        let skucategorytotal=[];
        listResultSKU.result.data.map(row=>{
            if(!categories.includes(row.category)) {categories.push(row.category);skucategorytotal.push(0)}
            if(!uniqueBrands.includes(row.brand)) {uniqueBrands.push(row.brand)}
            if (!brandlistSKU.includes(row.brand)) brandlistSKU.push(row.brand)
        })
        listResultSKU.result.data.map(row=>{
            skucategorytotal[categories.indexOf(row.category)] += parseInt(row.cont)
            countbrandSKU[brands.indexOf(row.brand)] += parseInt(row.cont)
        })
        categories.map(row=>{
            skucategory.push(elementBrand(row))
            skucategoryperc.push(elementBrand(row))
        })
        listResultSKU.result.data.map(row=>{
            skucategory.forEach(list=>{
                if(list.week===row.category){
                    list[row.brand]=parseInt(row.cont)
                }
            })
            skucategoryperc.forEach(list=>{
                if(list.week===row.category){
                    list[row.brand]=((parseInt(row.cont)/skucategorytotal[categories.indexOf(row.category)])*100)
                }
            })
        })
        function compareSKU( a, b ) {
            if ( countbrandSKU[brands.indexOf(a)] < countbrandSKU[brands.indexOf(b)] ){
              return -1;
            }
            if ( countbrandSKU[brands.indexOf(a)] > countbrandSKU[brands.indexOf(b)] ){
              return 1;
            }
            return 0;
          }
        brandlistSKU.sort( compareSKU );
        setorderbrandsSKU(brandlistSKU)
        setcategorybrandSKU(skucategory)
        setcategorybrandSKUperc(skucategoryperc)


        const listpoiresult = await triggeraxios('post', process.env.endpoints.selsimple, FILTERPOI(filter_to_send))
        let categoriespoi = []
        let poicategories = [];
        let poicategoriesperc = [];
        let brandlistpoi = [];
        let poicategoriestotal = [];
        let countbrandpoi=new Array(49).fill(0);
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
        function comparepoi( a, b ) {
            if ( countbrandpoi[brands.indexOf(a)] < countbrandpoi[brands.indexOf(b)] ){
              return -1;
            }
            if ( countbrandpoi[brands.indexOf(a)] > countbrandpoi[brands.indexOf(b)] ){
              return 1;
            }
            return 0;
          }
        brandlistpoi.sort( comparepoi );
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
                const pdf = new jsPDF('p', 'px', [1480, 2500]);
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
                        title="Categoría"
                        classname={classes.itemFilter}
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
                            <ResponsiveContainer width={"100%"} aspect={4.0/3}>
                                <PieChart >
                                    <Pie data={resultBrand} dataKey="cont" nameKey="name"  fill="#8884d8" 
                                        cx="50%"
                                        cy="50%">
                                        {resultBrand.map((entry, index) => (
                                          <Cell key={`exhibicionexmarca-${index}`} fill={colors[brands.indexOf(entry.name)]} />
                                          ))}
                                      </Pie>
                                    <Legend verticalAlign="top"/>
                                    <Tooltip formatter={(value,name)=>[value + "/" +(value*100/totalbrand).toFixed(2) +" %",name]}/>
                                </PieChart  >
                            </ResponsiveContainer >
                            
                        </Box>
                        <Box
                            className={classes.itemCard}
                        >
                            <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA POR SEMANA EN PORCENTAJE</div>
                            <ResponsiveContainer width={"100%"} aspect={4.0/3}>
                                <BarChart  data={dataGraphDate}>
                                    <Legend verticalAlign="top" content={renderLegend}/>
                                    <XAxis dataKey="week"/>
                                    <YAxis  domain={[0, 100]} allowDecimals={false} allowDataOverflow={true}/>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Tooltip itemSorter={item => -(orderbrandsDate.indexOf(item.dataKey))}  labelFormatter={(value)=>[<b>Semana {value}</b>]}  formatter={(value,name)=>[value.toFixed(2) + " %",name]} />
                                    {
                                        orderbrandsDate.map((brand,i)=>(
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
                            <ResponsiveContainer width={"100%"} aspect={4.0/3.0}>
                                <BarChart data={categorybrandSKU} >
                                    <Legend verticalAlign="top" content={renderLegend}/>
                                    <XAxis dataKey="week" angle={270} interval={0} textAnchor ="end" height={160} dy={5} dx={-5}/>
                                    <YAxis />
                                    <Tooltip itemSorter={item => -(orderbrandsSKU.indexOf(item.dataKey))} />
                                    <CartesianGrid />
                                    {
                                        orderbrandsSKU.map((brand,i)=>(
                                            <Bar  key={`exhicat${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]}/>
                                        ))
                                    }
                                </BarChart>
                            </ResponsiveContainer >
                            
                        </Box>
                        <Box
                            className={classes.itemCard}
                        >
                            <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA Y CATEGORÍA EN PORCENTAJE</div>
                            <ResponsiveContainer width={"100%"} aspect={4.0/3.0}>
                                <BarChart data={categorybrandSKUperc} >
                                    <Legend verticalAlign="top" content={renderLegend}/>
                                    <XAxis dataKey="week" angle={270} interval={0} textAnchor ="end" height={160} dy={5} dx={-5}/>
                                    <YAxis  domain={[0, 100]} allowDecimals={false} allowDataOverflow={true}/>
                                    <Tooltip  itemSorter={item => -(orderbrandsSKU.indexOf(item.dataKey))} formatter={(value,name)=>[value.toFixed(2) + " %",name]}/>
                                    <CartesianGrid />
                                    {
                                        orderbrandsSKU.map((brand,i)=>(
                                            <Bar key={`exhicatperc${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]}/>
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
                            <ResponsiveContainer width={"100%"} aspect={4.0/3.0}>
                                <BarChart data={poicategory} >
                                    <Legend verticalAlign="top" content={renderLegend}/>
                                    <XAxis dataKey="week" angle={270} interval={0} textAnchor ="end" height={160} dy={5} dx={-5}/>
                                    <YAxis />
                                    <Tooltip  itemSorter={item => -(orderbrandspoi.indexOf(item.dataKey))}/>
                                    <CartesianGrid />
                                    {
                                        orderbrandspoi.map((brand,i)=>(
                                            <Bar  key={`exhicad${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]}/>
                                        ))
                                    }
                                </BarChart>
                            </ResponsiveContainer >
                            
                        </Box>
                        <Box
                            className={classes.itemCard}
                        >
                            <div className={classes.titlecards}>CANTIDAD DE EXHIBICIONES POR MARCA Y CADENA EN PORCENTAJE</div>
                            <ResponsiveContainer width={"100%"} aspect={4.0/3.0}>
                                <BarChart data={poicategoryperc} >
                                    <Legend verticalAlign="top" content={renderLegend}/>
                                    <XAxis dataKey="week" angle={270} interval={0} textAnchor ="end" height={160} dy={5} dx={-5}/>
                                    <YAxis  domain={[0, 100]} allowDecimals={false} allowDataOverflow={true}/>
                                    <Tooltip  itemSorter={item => -(orderbrandspoi.indexOf(item.dataKey))} formatter={(value,name)=>[value.toFixed(2) + " %",name]}/>
                                    <CartesianGrid />
                                    {
                                        orderbrandspoi.map((brand,i)=>(
                                            <Bar key={`exhicadperc${brand}`} type="monotone" dataKey={brand} stackId="a" fill={colors[brands.indexOf(brand)]}/>
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
                            <div className={classes.titlecards}>Q Exhibiciones por Marca y Tipo de Exhibición</div>
                            <div style={{width:"100%"}}>
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
                        title="Management"
                        datatosend={datafilters.management}
                        optionvalue="management"
                        optiondesc="management"
                        variant="outlined"
                        valueselected={filters.management}
                        namefield="management"
                        descfield="management"
                        callback={({ newValue: value }) => setfilters({ ...filters, management: value })}
                    />
                    <SelectFunction
                        title="Tipo Exhibición"
                        datatosend={[]}
                        optionvalue="type_exhibit"
                        optiondesc="description"
                        variant="outlined"
                        namefield="type_exhibit"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, type_exhibit: value?.id || '' })}
                    />
                    <SelectFunction
                        title="Área"
                        datatosend={[]}
                        optionvalue="area"
                        optiondesc="description"
                        variant="outlined"
                        namefield="area"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, area: value?.id || '' })}
                    />
                </div>
            </SwipeableDrawer>
        </Layout>
    );
}

export default Exhibits_share_brand;