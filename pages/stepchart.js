import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import UserModal from '../components/user/usermain';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { makeStyles } from '@material-ui/core/styles';

import { validateResArray } from '../config/helper';
import IconButton from '@material-ui/core/IconButton';
import authContext from '../context/auth/authContext';
import SelectFunction from '../components/system/form/select-function';
import { PieChart, Pie, Sector, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRange from '../components/system/form/daterange';

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

const dataLines = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];


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
        categoria: '',
        SKU: '',
        banda: '',
        marca: '',
        tipo_pvp: ''
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
            ]);
            console.log(validateResArray(listResult[0], continuezyx))
            setdatafilters({
                ...datafilters,
                channel: validateResArray(listResult[1], continuezyx),
                format: validateResArray(listResult[0], continuezyx),
                department: validateResArray(listResult[2], continuezyx),
                store_name: validateResArray(listResult[3], continuezyx),
            })
        })();
        return () => continuezyx = false;
    }, [])


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
                        optionvalue="category"
                        optiondesc="category"
                        variant="outlined"
                        namefield="category"
                        descfield="category"
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value.category })}
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
                        callback={({ newValue: value }) => setfilters({ ...filters, format: value.format })}
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
                        callback={({ newValue: value }) => setfilters({ ...filters, channel: value.channel })}
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
                        callback={({ newValue: value }) => setfilters({ ...filters, department: value.department })}
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
                        callback={({ newValue: value }) => setfilters({ ...filters, store_name: value.store_name })}
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
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value.id })}
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
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value.id })}
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
                        callback={({ newValue: value }) => setfilters({ ...filters, formato: value.id })}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <LineChart
                        width={500}
                        height={300}
                        data={dataLines}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                    </LineChart>
                </div>
            </div>

        </Layout>
    );
}

export default User;