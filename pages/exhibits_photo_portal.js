import React, { useState, useEffect, useContext, Fragment } from 'react';
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

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
} from '@material-ui/icons';



const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);
const StyledTableCell2 = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);

const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
        type: filter
    }
})
function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

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

const paramTemplate = {
    method: "SP_SEL_TEMPLATE",
    data: { id_corporation: null, id_organization: null, status: 'ACTIVO' }
}

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
})
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

const Exhibits_photo_portal = () => {
    const classes = useStyles();
    const [waitFilter, setWaitFilter] = useState(false)
    const [dataGraph, setDataGraph] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [category, setcategory] = useState(null);

    const [disablebutton, setdisablebutton] = useState(true)
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

        rows.map((row, i) => {
            JSZipUtils.getBinaryContent(row.image, function (err, data) {
                if (err) {
                    //throw err; // or handle the error
                }
                zip.file(`image-${i}.jpg`, data, { binary: true });
                count++;
                if (count == rows.length) {
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
        retail:[],
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
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("sub_category")),
                triggeraxios('post', process.env.endpoints.selsimple, RB_MARCA),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("management")),
                triggeraxios('post', process.env.endpoints.selsimple, GET_FILTER("retail")),
            ]);
            console.log(validateResArray(listResult[0], continuezyx))
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
    useEffect(() => {
        if (waitFilter) {

        }
    }, [])
    async function filtrar() {
        //setWaitFilter(true)
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
                        title="Subcategoría"
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
                        callback={({ newValue: value }) => setfilters({ ...filters, retail: value?.retail || '' })}
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
                                onClick={() => descargar()}
                                startIcon={<GetAppIcon style={{ color: '#FFF' }} />}
                            >Descargar</Button>
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
                        <Box key={i} width="19%" height={"200px"}>
                            <HtmlTooltip placement="bottom"
                                title={
                                    <Fragment>
                                        <Typography color="inherit">{`Tienda: ${row.poiname}`}</Typography>
                                        <Typography color="inherit">{`Marca: ${row.brand}`}</Typography>
                                        <Typography color="inherit">{`Categoría: ${row.category}`}</Typography>
                                        <Typography color="inherit">{`Management: ${row.management}`}</Typography>
                                    </Fragment>
                                }>
                                <img crossOrigin="*"
                                    style={{ height: "200px", width: "200px", objectFit: 'cover' }} alt="image.jpg" src={row.exhibit_photo}></img>
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
                        datatosend={[]}
                        optionvalue="sub_category"
                        optiondesc="sub_category"
                        variant="outlined"
                        namefield="sub_category"
                        descfield="sub_category"
                        callback={({ newValue: value }) => setfilters({ ...filters, sub_category: value?.id || '' })}
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

export default Exhibits_photo_portal;