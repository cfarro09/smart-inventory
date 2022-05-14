import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-paginated';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import Payment from 'components/payment/payment'
import authContext from '../context/auth/authContext';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Payment as PaymentIcon
} from '@material-ui/icons';
import { validateResArray } from 'config/helper';
import TextField from '@material-ui/core/TextField';
import SelectFunction from '../components/system/form/select-function';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
const SEL_BOOKINGS = (startdate, id_campus) => ({
    "method": "fn_sel_booking_campus",
    "data": {
        startdate,
        id_campus,
    }
})

const SEL_DETAIL_BOOKING = (id_event_calendar) => ({
    method: "fn_sel_event_detail",
    data: {
        id_event_calendar
    }
})

const SELCAMPUS = {
    method: "fn_sel_campus",
    data: { status: 'ACTIVO' }
}

const SEL_FIELDS_BY_CAMPUS = (id_campus) => ({
    method: "fn_sel_field_by_campus ",
    data: { status: 'ACTIVO', id_campus }
})

const CampusMain = ({ openModal, setOpenModal, row }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);

    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='md'
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            Cliente <b>{row?.[0]?.cliente || ""}</b>
                        </div>
                        <div>
                            <b>{row?.[0]?.fecha_reserva || ""}</b>
                        </div>
                    </div>
                    <div>
                        Reservado por <b>{row?.[0]?.reservado_por || ""}</b>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontWeight: 500 }}>
                            DETALLE DE LA RESERVA
                        </div>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Cancha</TableCell>
                                        <TableCell>Fecha y hora</TableCell>
                                        <TableCell>Importe</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ marginTop: 5 }}>

                                    <TableRow >
                                        <TableCell>{row?.[0]?.cancha || ""}</TableCell>
                                        <TableCell>{row?.[0]?.start_date || ""} - {row?.[0]?.end_date.split(" ")[1] || ""}</TableCell>
                                        <TableCell style={{ textAlign: 'right' }}>{parseFloat(row?.[0]?.importe_reserva || "0").toFixed(2)}</TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontWeight: 500 }}>
                            DETALLE DE PAGOS
                        </div>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell># Recibo</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Tipo</TableCell>
                                        <TableCell>Referencia</TableCell>
                                        <TableCell>Importe S/</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ marginTop: 5 }}>
                                    {row?.map((x, i2) => (
                                        <TableRow key={"cell-" + i2}>
                                            <TableCell>{x.recibo_pago}</TableCell>
                                            <TableCell>{x.fecha_pago}</TableCell>
                                            <TableCell>{x.tipo_pago}</TableCell>
                                            <TableCell>{x.referencia_pago}</TableCell>
                                            <TableCell style={{ textAlign: 'right' }}>{parseFloat(x.monto_pago || "0").toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        Importe pendiente de pago <b>S/ {((row?.[0]?.importe_reserva || 0) - (row?.reduce((acc, item) => acc + parseFloat(item.monto_pago), 0) || 0)).toFixed(2)}</b>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="button"
                        color="secondary"
                        style={{ marginLeft: '1rem' }}
                        onClick={() => setOpenModal(false)}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}


const CampusBooking = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [row, setrow] = useState([])
    const [openModal, setOpenModal] = useState(false);


    const [datatable, setdatatable] = useState([]);
    const [dataclients, setdataclients] = useState([]);


    const [campusSelected, setCampusSelected] = useState(0)
    const [dateG, setDateG] = useState(new Date(new Date().setHours(10)).toISOString().substring(0, 10))
    const [campus, setcampus] = useState([]);


    useEffect(() => {
        triggeraxios('post', process.env.endpoints.selsimple, SELCAMPUS).then(res => setcampus(validateResArray(res, true)))
    }, [])

    const fetchData = async () => {
        let hours = [...Array(24)].map((x, i) => ({ hour: i, description: `${i.toString().padStart(2, "0")}:00 - ${(i + 1).toString().padStart(2, "0")}:00` }))
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, SEL_BOOKINGS(dateG, campusSelected));
        const resclients = await triggeraxios('post', process.env.endpoints.selsimple, SEL_FIELDS_BY_CAMPUS(campusSelected))
        const databookings = validateResArray(res, true);
        const dataclients = validateResArray(resclients, true);

        const initialaa = dataclients.reduce((acc, item) => [
            ...acc,
            ...JSON.parse(item.time_prices).map(x => parseInt(x.start_time.split(":")[0]))
        ], []).sort((a, b) => a - b);

        const finalaa = dataclients.reduce((acc, item) => [
            ...acc,
            ...JSON.parse(item.time_prices).map(x => parseInt(x.end_time.split(":")[0]))
        ], []).sort((a, b) => b - a)

        setdataclients(dataclients)

        let aa = databookings.reduce((acc, x) => {
            const hour_start = parseInt(x.start_date.split(" ")[1].split(":")[0]);
            const hour_end = parseInt(x.end_date.split(" ")[1].split(":")[0]);
            const field_name = dataclients.find(y => y.id_field === x.id_field).field_name;
            
            for (let i = hour_start; i < hour_end; i++) {
                if (acc[i]) {
                    acc[i][`field_${x.id_field}`] = {
                        id_event_calendar: x.id_event_calendar,
                        cliente: x.cliente,
                        tipo_cliente: x.tipo_cliente,
                        status: x.status
                    };
                }
            }
            return acc
        }, hours)

        aa = aa.filter(x => x.hour >= initialaa[0] && x.hour <= finalaa[0])

        setdatatable(aa)

        setloadingglobal(false)
    }

    const selectrow = async (id_event_calendar) => {
        const res = await triggeraxios('post', process.env.endpoints.selsimple, SEL_DETAIL_BOOKING(id_event_calendar));
        if (res.result.data.length > 0) {
            setrow(res.result.data)
            setOpenModal(true)
        }
    }

    return (
        <Layout>
            <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 200 }}>
                    <TextField
                        id="date"
                        size="small"
                        label="Fecha"
                        fullWidth
                        type="date"
                        variant='outlined'
                        value={dateG}
                        onChange={(e) => setDateG(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </div>
                <div style={{ width: 200 }}>
                    <SelectFunction
                        title="Sede"
                        datatosend={campus}
                        classname="col-4"
                        optionvalue="id_campus"
                        optiondesc="description"
                        callback={({ newValue }) => {
                            setCampusSelected(newValue?.id_campus || 0);
                        }}
                    />
                </div>
                <div style={{ width: 200 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!campusSelected}
                        onClick={fetchData}
                    >Buscar
                    </Button>
                </div>
            </div>
            <div>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Hora</TableCell>
                                {dataclients.map(x => (
                                    <TableCell key={x.id_field}>{x.field_name}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody style={{ marginTop: 5 }}>
                            {datatable.map((item, i) =>
                                <TableRow key={i}>
                                    <TableCell width={130}>
                                        {item.description}
                                    </TableCell>
                                    {dataclients.map(x => {
                                        const field = item[`field_${x.id_field}`]
                                        return (
                                            <TableCell
                                                key={x.id_field}
                                                onClick={() => {
                                                    if (!!field) {
                                                        selectrow(field.id_event_calendar)
                                                    }
                                                }}
                                                style={{
                                                    borderRight: '1px solid #e1e1e1',
                                                    borderLeft: '1px solid #e1e1e1',
                                                    cursor: field?.cliente && 'pointer',
                                                    backgroundColor: (field?.status === "PAGADO" ? "#8cdf8c" : (field?.tipo_cliente === "FRECUENTE" ? "rgb(245 255 139)" : (field?.status === "PAGADO PARCIAL" ? "orange" : undefined)))
                                                }}
                                            >
                                                {field?.cliente || ""}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <CampusMain
                setOpenModal={setOpenModal}
                openModal={openModal}
                row={row}
            />
        </Layout>
    );
}

export default CampusBooking;