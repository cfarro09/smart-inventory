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
import { BarChart, Bar,LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRange from '../components/system/form/daterange';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const GET_FILTER = (filter) => ({
    method: "SP_SEL_FILTER",
    data: {
        filter
    }
})
const GET_CATEGORY = (filter) => ({
    method: "SP_SEL_CATEGORY",
    data: {
    }
})
const FILTER = (filter) => ({
    method: "SP_STEP_UP_CHAR",
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
    }
}));

const User = () => {
    const classes = useStyles();
    const [waitFilter, setWaitFilter] = useState(false)
    const [dataGraph, setDataGraph] = useState([])
    const [disablebutton, setdisablebutton] = useState(true)
    const [searchdone, setsearchdone] = useState(false)    
    const [enabletop, setenabletop] = useState(true)
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
                triggeraxios('post', process.env.endpoints.selsimple, GET_CATEGORY()),                
            ]);
            console.log(validateResArray(listResult[0], continuezyx))
            setdatafilters({
                ...datafilters,
                channel: validateResArray(listResult[1], continuezyx),
                format: validateResArray(listResult[0], continuezyx),
                department: validateResArray(listResult[2], continuezyx),
                store_name: validateResArray(listResult[3], continuezyx),
                categoria:  validateResArray(listResult[4], continuezyx),
            })
        })();
        return () => continuezyx = false;
    }, [])
    useEffect(() => {
        if(waitFilter){
            
        }
    }, [])
    async function filtrar(){
        setsearchdone(true)
        //setWaitFilter(true)
        const filter_to_send = {
            format:filters.format,
            channel:filters.channel,
            department:filters.department,
            store_name:filters.store_name,
            category:filters.categoria,
            sku_code:filters.SKU,
            brand:filters.banda,
            sub_category:filters.marca,
            price:filters.tipo_pvp,
            from_date:dateRange[0].startDate.toISOString().substring(0,10),
            to_date:dateRange[0].endDate.toISOString().substring(0,10)
        }
        const listResult = await triggeraxios('post', process.env.endpoints.selsimple, FILTER(filter_to_send))
        setDataGraph(listResult.result.data)
    }
    function descargar(){
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
            <div style={{display: 'flex', gap: 16, flexDirection: 'column'}}>
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
                        callback={({ newValue: value }) => {setfilters({ ...filters, categoria: value?.id_form||1 });setdisablebutton(!value)}}
                    />
                </div>
                <div className={classes.containerFilters}>

                    <SelectFunction
                        title="Formato"
                        classname={classes.itemFilter}
                        datatosend={datafilters.format}
                        optionvalue="format"
                        optiondesc="format"
                        variant="outlined"
                        namefield="format"
                        descfield="format"
                        callback={({ newValue: value }) => setfilters({ ...filters, format: value?.format||'' })}
                    />
                    <SelectFunction
                        title="Canal"
                        classname={classes.itemFilter}
                        datatosend={datafilters.channel}
                        optionvalue="channel"
                        optiondesc="channel"
                        variant="outlined"
                        namefield="channel"
                        descfield="channel"
                        callback={({ newValue: value }) => setfilters({ ...filters, channel: value?.channel||'' })}
                    />
                    <SelectFunction
                        title="Departamento"
                        classname={classes.itemFilter}
                        datatosend={datafilters.department}
                        optionvalue="department"
                        optiondesc="department"
                        variant="outlined"
                        namefield="department"
                        descfield="department"
                        callback={({ newValue: value }) => setfilters({ ...filters, department: value?.department||'' })}
                    />
                    <SelectFunction
                        title="PDV"
                        classname={classes.itemFilter}
                        datatosend={datafilters.store_name}
                        optionvalue="store_name"
                        optiondesc="store_name"
                        variant="outlined"
                        namefield="store_name"
                        descfield="store_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, store_name: value?.store_name||'' })}
                    />

                    <SelectFunction
                        title="SKU"
                        classname={classes.itemFilter}
                        datatosend={[]}
                        optionvalue="id_role"
                        optiondesc="description"
                        variant="outlined"
                        namefield="id_role"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value?.id||'' })}
                    />
                    <SelectFunction
                        title="Banda"
                        classname={classes.itemFilter}
                        datatosend={[]}
                        optionvalue="id_role"
                        optiondesc="description"
                        variant="outlined"
                        namefield="id_role"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value?.id||'' })}
                    />
                    <SelectFunction
                        title="Marca"
                        classname={classes.itemFilter}
                        datatosend={[]}
                        optionvalue="id_role"
                        optiondesc="description"
                        variant="outlined"
                        namefield="id_role"
                        descfield="role_name"
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value?.id||'' })}
                    />
                    <RadioGroup row aria-label="tipo_pvp" name="row-radio-buttons-group"
                        defaultValue="prom_price"
                        onChange={(event) => {setfilters({ ...filters, tipo_pvp: event.target.value })}}
                    >
                        <FormControlLabel value="todopvp" control={<Radio />} label="Todo PVP" />
                        <FormControlLabel value="prom_price" control={<Radio />} label="Promo PVP" />
                        <FormControlLabel value="regular_price" control={<Radio />} label="Regular PVP" />
                    </RadioGroup>
                    <Button variant="outlined" onClick={()=>filtrar()} disabled={disablebutton}>Filtrar</Button>
                    {searchdone?
                        <Button variant="outlined" onClick={()=>descargar()}  >Descargar</Button>:""
                    }
                    {searchdone?
                        <FormGroup>
                            <FormControlLabel control={<Switch defaultChecked onChange={(e)=>{setenabletop(e.target.checked)}}/>} label={enabletop?"Mostrando Top 10":"Mostrando todo"} />
                        </FormGroup>:""

                    }
                    
                </div>
                {searchdone?
                <div style={{ display: 'flex', gap: 8 }} id="divToPrint">
                <ResponsiveContainer  aspect={4.0 / 1.5}>
                    <BarChart data={enabletop?dataGraph.slice(dataGraph.length<10?0:dataGraph.length-11,dataGraph.length):dataGraph}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sku_code" />
                        <YAxis type="number" domain={[0, 1000]}/>
                        <Tooltip formatter={(value, name, props) => { return `S/.${parseFloat(value).toFixed(2)}` }} />
                        <Bar dataKey="price" fill="#8884d8">
                            {enabletop?
                                <LabelList dataKey="price" position="top" formatter={(value, name, props) => { return `S/.${parseFloat(value).toFixed(2)}` }}/>
                                :""
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>:""
                }
            </div>

        </Layout>
    );
}

export default User;