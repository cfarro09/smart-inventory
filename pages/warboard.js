import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import triggeraxios from '../config/axiosv2';

import { withStyles, makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import { BarChart, Bar, Sector, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRange from '../components/system/form/daterange';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

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
  
  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }

  const rows = [
    {marca:"OSTER",modelo: "6026",precio:139.00,subcategoria:"SOFRITO", capacidad:"1.2LT",watts:500, frecuenciahz:"50/60",acabado:"PINTADO AL HORNO",color: "SILVER",tazon:"ALUMINIO",medidastazon:"MAX",recubrimiento:"ANTIHADERENTE", 
        funciones:"COOK/WARM/ADEREZO",tapa:"VIDRIO",cable:"SI",vaporera:"NO",accesorios:"TAZA MEDIDORA, CUCHARA",garantia:"1 AÑO",image:"https://falabella.scene7.com/is/image/FalabellaPE/880315975_1?wid=800&hei=800&qlt=70"},
    {marca:"PRACTIKA",modelo: "180MCS",precio:149.90,subcategoria:"TRADICIONAL", capacidad:"1.8LT",watts:750, frecuenciahz:"60",acabado:"METAL",color: "SILVER",tazon:"ALUMINIO",medidastazon:"SI",recubrimiento:"ANTIHADERENTE", 
        funciones:"COOK/WARM",tapa:"VIDRIO",cable:"NO",vaporera:"SI/ALUMINIO",accesorios:"TAZA MEDIDORA, CUCHARA",garantia:"1 AÑO",image:"https://falabella.scene7.com/is/image/FalabellaPE/880315975_1?wid=800&hei=800&qlt=70"},
    {marca:"OSTER",modelo: "6026",precio:139.00,subcategoria:"SOFRITO", capacidad:"1.2LT",watts:500, frecuenciahz:"50/60",acabado:"PINTADO AL HORNO",color: "SILVER",tazon:"ALUMINIO",medidastazon:"MAX",recubrimiento:"ANTIHADERENTE", 
        funciones:"COOK/WARM/ADEREZO",tapa:"VIDRIO",cable:"SI",vaporera:"NO",accesorios:"TAZA MEDIDORA, CUCHARA",garantia:"1 AÑO",image:"https://falabella.scene7.com/is/image/FalabellaPE/880315975_1?wid=800&hei=800&qlt=70"},
    {marca:"PRACTIKA",modelo: "180MCS",precio:149.90,subcategoria:"TRADICIONAL", capacidad:"1.8LT",watts:750, frecuenciahz:"60",acabado:"METAL",color: "SILVER",tazon:"ALUMINIO",medidastazon:"SI",recubrimiento:"ANTIHADERENTE", 
        funciones:"COOK/WARM",tapa:"VIDRIO",cable:"NO",vaporera:"SI/ALUMINIO",accesorios:"TAZA MEDIDORA, CUCHARA",garantia:"1 AÑO",image:"https://falabella.scene7.com/is/image/FalabellaPE/880315975_1?wid=800&hei=800&qlt=70"},
    {marca:"OSTER",modelo: "6026",precio:139.00,subcategoria:"SOFRITO", capacidad:"1.2LT",watts:500, frecuenciahz:"50/60",acabado:"PINTADO AL HORNO",color: "SILVER",tazon:"ALUMINIO",medidastazon:"MAX",recubrimiento:"ANTIHADERENTE", 
        funciones:"COOK/WARM/ADEREZO",tapa:"VIDRIO",cable:"SI",vaporera:"NO",accesorios:"TAZA MEDIDORA, CUCHARA",garantia:"1 AÑO",image:"https://falabella.scene7.com/is/image/FalabellaPE/880315975_1?wid=800&hei=800&qlt=70"},
    {marca:"PRACTIKA",modelo: "180MCS",precio:149.90,subcategoria:"TRADICIONAL", capacidad:"1.8LT",watts:750, frecuenciahz:"60",acabado:"METAL",color: "SILVER",tazon:"ALUMINIO",medidastazon:"SI",recubrimiento:"ANTIHADERENTE", 
        funciones:"COOK/WARM",tapa:"VIDRIO",cable:"NO",vaporera:"SI/ALUMINIO",accesorios:"TAZA MEDIDORA, CUCHARA",garantia:"1 AÑO",image:"https://falabella.scene7.com/is/image/FalabellaPE/880315975_1?wid=800&hei=800&qlt=70"},
  ];


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
    },
    
    table: {
        minWidth: 700,
    },
    labelcell: {
        border: "1px #e0e0e0 solid",
        fontWeight: "bold"
    },
    datacell: {
        border: "1px #e0e0e0 solid"
    }
}));

const BulkLoad = () => {
    const classes = useStyles();
    const [waitFilter, setWaitFilter] = useState(false)
    const [dataGraph, setDataGraph] = useState([])
    const [disablebutton, setdisablebutton] = useState(false)
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
    useEffect(() => {
        if(waitFilter){
            
        }
    }, [])
    async function filtrar(){
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
                    <RadioGroup row aria-label="tipo_pvp" name="row-radio-buttons-group"
                        defaultValue="prom_price"
                        onChange={(event) => {setfilters({ ...filters, tipo_pvp: event.target.value })}}
                    >
                        <FormControlLabel value="todopvp" control={<Radio />} label="Todo PVP" />
                        <FormControlLabel value="prom_price" control={<Radio />} label="Promo PVP" />
                        <FormControlLabel value="regular_price" control={<Radio />} label="Regular PVP" />
                    </RadioGroup>
                    <Button variant="outlined" onClick={()=>filtrar()} >Filtrar</Button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableBody>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row"></TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row"><img style={{width: "100px", height: "100px"}} alt="image.jpg" src={row.image}></img></TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">MARCA</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.marca}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">MODELO</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.modelo}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">PRECIO</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">S/.{row.precio.toFixed(2)}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">SUBCATEGORIA</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.subcategoria}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">CAPACIDAD</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.capacidad}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">WATTS</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.watts}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">FRECUENCIA HZ</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.frecuenciahz}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">ACABADO</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.acabado}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">COLOR</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.color}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">TAZON</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.tazon}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">MEDIDAS DEL TAZON</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.medidastazon}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">RECUBRIMIENTO</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.recubrimiento}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">FUNCIONES</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.funciones}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">TAPA</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.tapa}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">CABLE DESMONTABLE</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.cable}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">VAPORERA/ALUMINIO/ACERO</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.vaporera}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">ACCESORIOS</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.accesorios}</TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className={classes.labelcell} align="right" component="th" scope="row">GARANTIA</TableCell>
                                {rows.map((row)=>(
                                    <TableCell className={classes.datacell} align="center" component="th" scope="row">{row.garantia}</TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                </div>
            </div>

        </Layout>
    );
}

export default BulkLoad;