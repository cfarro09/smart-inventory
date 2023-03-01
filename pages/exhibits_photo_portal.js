import React, { useState, useEffect, useContext, Fragment } from 'react';
import Layout from '../components/system/layout/layout'
import triggeraxios from '../config/axiosv2';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import MultiSelectFunction from '../components/system/form/multiselect';
import Button from '@material-ui/core/Button';
import SelectFunction from '../components/system/form/select-function';
import DateRange from '../components/system/form/daterange';
import Box from '@material-ui/core/Box';
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
import Avatar from '@material-ui/core/Avatar';
import CheckIcon from '@material-ui/icons/Check';
import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';


const rows = [
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
    { image: "http://142.44.214.184:5000/storage/master_images/BOA15V.png", description: "This is a photo", title: "Nombre de la tienda" },
];

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

const FILTER = (filter) => ({
    method: "SP_PHOTO_PORTAL_EXHIBIT",
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

const Exhibits_photo_portal = () => {
    const classes = useStyles();
    const [dataGraph, setDataGraph] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [category, setcategory] = useState(null);
    const [stopFilter, setstopFilter] = useState(-1);
    const [dataToExport, setDataToExport] = useState({})
    const { setLightBox, setOpenBackdrop } = useContext(popupsContext);
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
        const datt = Object.values(dataToExport)

        datt.map((row, i) => {
            JSZipUtils.getBinaryContent(row.exhibit_photo, function (err, data) {
                if (err) {
                    //throw err; // or handle the error
                }
                zip.file(`${row.form_timestamp.split(' ')[0]} - ${row.brand} - ${row.type_exhibit} - ${row.poiname}.jpg`, data, { binary: true });
                count++;
                if (count == datt.length) {
                    debugger
                    zip.generateAsync({ type: 'blob' }).then(function (content) {
                        saveAs(content, zipFilename);
                    });
                }
            });
        })
        /*links.forEach(function (url, i) {
          // loading a file and add it in a zip file
          JSZipUtils.getBinaryContent(url, function (err, data) {
            if (err) {
              throw err; // or handle the error
            }
            zip.file(filename, data, { binary: true });
            count++;
            if (count == links.length) {
              zip.generateAsync({ type: 'blob' }).then(function (content) {
                saveAs(content, zipFilename);
              });
            }
          });
        });*/
    }

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
    async function filtrar() {
        //setWaitFilter(true)
        setDataToExport([])
        setDataGraph([])
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
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
        setOpenBackdrop(false)
        console.log(listResult.result.data)
        setDataGraph(listResult.result.data)
    }
    useEffect(() => {
        (async () => {
            await applyfilter({})
        })();
        // return () => continuezyx = false;
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

    const manageImage = (row) => {
        if (dataToExport[row.exhibit_photo]) {
            const copyxz = { ...dataToExport }
            delete copyxz[row.exhibit_photo];
            setDataToExport(copyxz);
        } else {
            setDataToExport({
                ...dataToExport,
                [row.exhibit_photo]: row
            })
        }
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
                        <Box key={i} >
                            <HtmlTooltip placement="bottom"
                                title={
                                    <Fragment>
                                        <Typography color="inherit">{`Tienda: ${row.poiname}`}</Typography>
                                        <Typography color="inherit">{`Marca: ${row.brand}`}</Typography>
                                        <Typography color="inherit">{`Categoría: ${row.category}`}</Typography>
                                        <Typography color="inherit">{`Management: ${row.management}`}</Typography>
                                        <Typography color="inherit">{`Fecha: ${row.form_timestamp}`}</Typography>
                                    </Fragment>
                                }>
                                <div style={{ position: "relative", height: "150px", width: "150px" }}>
                                    <img crossOrigin="*"
                                        style={{ height: "100%", width: "100%", objectFit: 'cover', cursor: "pointer" }}
                                        alt="image.jpg"
                                        onClick={() => manageImage(row)}
                                        src={row.exhibit_photo} />
                                    {dataToExport[row.exhibit_photo] && (
                                        <Avatar style={{ position: "absolute", top: 5, left: 5, width: 30, height: 30, backgroundColor: "white" }}>
                                            <CheckIcon style={{ color: "black" }} />
                                        </Avatar>
                                    )}
                                </div>
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

export default Exhibits_photo_portal;