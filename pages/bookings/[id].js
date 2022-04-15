import React, { useState, useContext, useEffect } from 'react';
import Layout from 'components/system/layout/layout'
import Payment from 'components/payment/payment'
import Button from '@material-ui/core/Button';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import { useRouter } from 'next/router'
import triggeraxios from 'config/axiosv2';
import { validateResArray, getDomain, validateres } from 'config/helper';
import RadioGroup from 'components/system/form/RadioGroup';
import Switch from 'components/system/form/switch';
import popupsContext from 'context/pop-ups/pop-upsContext';
import authContext from 'context/auth/authContext';
import SelectFunction from 'components/system/form/select-function';
import ClientMain from 'components/client/clientmain';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useFormik } from 'formik';
import InputFormk from 'components/system/form/inputformik';
import * as Yup from 'yup';
import {
    Scheduler,
    Resources,
    MonthView,
    Appointments,
    AppointmentTooltip,
    AppointmentForm,
    EditRecurrenceMenu,
    DragDropProvider,
    ConfirmationDialog,
    DayView,
    WeekView,
    Toolbar,
    DateNavigator,
    CurrentTimeIndicator,
    AllDayPanel,
    TodayButton,
    ViewSwitcher
} from '@devexpress/dx-react-scheduler-material-ui';
import { add } from 'date-fns';
import { Fab } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';

const daysd = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado"
]

const resources = (data) => [{
    fieldName: 'id_field',
    title: 'Campos',
    instances: data,
}]

const SELCLIENTS = {
    method: "fn_sel_client",
    data: { status: 'ACTIVO' }
}

const SELCAMPUS = {
    method: "fn_sel_campus_by_user",
    data: { status: 'ACTIVO' }
}

const SEL_BOOKING_BY_ID = (id_booking) => ({
    method: "fn_sel_booking",
    data: { status: null, id_booking }
})

const SEL_FIELDS_BY_CAMPUS = (id_campus) => ({
    method: "fn_sel_field_by_campus ",
    data: { status: 'ACTIVO', id_campus }
})

const VALIDATE_BOOKING_BY_EVENT = (data) => ({
    method: "fn_validate_booking_date",
    header: { data: {} },
    details: { data }
})

const SEL_EVENTS_BY_CAMPUS = ({ id_campus = null, id_field = null, start_date = null, end_date = null, id_booking = null }) => ({
    method: "fn_sel_calendar_event",
    data: { id_campus, id_field, start_date, end_date, id_booking }
})

const METHOD_INS = "fn_ins_client";

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const daysX = {
    "SU": 0,
    "MO": 1,
    "TU": 2,
    "WE": 3,
    "TH": 4,
    "FR": 5,
    "SA": 6
}

const convertDate = (str) => {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    const hour = str.substring(9, 10);
    const minute = str.substring(11, 13);
    const second = str.substring(13, 15);
    return new Date(year, month - 1, day, hour, minute, second);
}

const validateRule = (rule, startDate, endDate) => {
    if (!rule)
        return null;
    console.log(rule)
    const paramsSplited = rule.replace("RRULE:", "").split(";");
    const rules = paramsSplited.reduce((acc, item) => {
        const [key, value] = item.split("=");
        acc[key] = value;
        return acc;
    }, {});

    const count = rules["COUNT"] ? parseInt(rules["COUNT"]) : 0;
    const until = rules["UNTIL"] ? convertDate(rules["UNTIL"]) : null;
    let bydays = rules["BYDAY"] ? rules["BYDAY"].split(",").map(x => daysX[x]) : null;
    const interval = parseInt(rules["INTERVAL"]);
    const freq = rules["FREQ"];

    if (freq === "DAILY") {
        if (count) {
            return [...Array(count)].map((_, x) => addDays(startDate, (x) * interval))
        } else {
            const dates = [];
            let dateiterative = new Date(startDate);
            let i = 0;
            while (until > addDays(startDate, (i) * interval)) {
                dateiterative = addDays(startDate, (i) * interval);
                dates.push(dateiterative);
                i++;
            }
            return dates;
        }
    } else if (freq === "WEEKLY") {
        const datecurrent = startDate.getDay();
        bydays = bydays || [datecurrent]
        let countDid = count ? 0 : -1;
        const dates = [];
        let itt = 0;
        let validateUntil = true;
        while (countDid < count && validateUntil) {
            bydays.forEach(x => {
                if (!(itt === 0 && x - datecurrent < 0)) {
                    if (countDid < count) {
                        const newevent = addDays(startDate, (itt * interval * 7) + (x - datecurrent));
                        dates.push(newevent);
                        if (until) {
                            if (until < newevent)
                                validateUntil = false
                        }
                        if (count)
                            countDid++;
                    }
                }
            })
            itt++
        }
        return dates
    }
}

const getDateZyx = (date) => new Date(new Date(date).setHours(10)).toISOString().substring(0, 10)

const getStringFromDate = (date) => `${getDateZyx(date)} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;

const getFieldsFree = (setOpenSnackBack, fields, startDate, endDate, appointments, id = null) => {
    const aa = fields.map(field => {
        const appointmentsAux = id ? appointments.filter(x => x.id !== id) : appointments;
        const aux = appointmentsAux.some(x => x.id_field === field.id_field && (
            endDate >= x.startDate && endDate <= x.endDate ||
            startDate >= x.startDate && startDate < x.endDate ||
            x.startDate >= startDate && x.startDate <= endDate));
        if (aux)
            return null; // valida q haya un msimo campo en la misma hora
        const fieldstime = field.time_prices.map(x => ({
            ...x,
            start_time: new Date(getDateZyx(startDate) + " " + x.start_time),
            end_time: new Date(getDateZyx(startDate) + " " + x.end_time),
        }));
        const fieldtime = fieldstime.find(x => x.start_time <= startDate && endDate <= x.end_time);
        return fieldtime ? { ...field, price: fieldtime.price, text: field.field_name + " - S/ " + fieldtime.price } : null;
    })
    const aab = aa.filter(x => !!x)
    console.log("aab", aa)
    if (aab.length === 0)
        setOpenSnackBack(true, { success: false, message: "No existe campos para este horario" })
    return aab;
}

const validateField = (fields, id_field, startDate, endDate) => {
    const fieldselected = fields.find(x => x.id_field === id_field);

    const times = fieldselected.time_prices.sort((a, b) => a.start_time > b.start_time ? 1 : (a.start_time < b.start_time ? -1 : 0)).reduce((acc, item) => {
        const indexfound = acc.findIndex(x => x.end_time === item.start_time)
        if (indexfound >= 0) {
            const tmm = {
                ...acc[indexfound],
                end_time: item.end_time
            }
            acc[indexfound] = tmm;
            return acc
        } else {
            return [...acc, item]
        }
    }, [])

    const fieldstime = times.map(x => ({
        ...x,
        start_time: new Date(getDateZyx(startDate) + " " + x.start_time),
        end_time: new Date(getDateZyx(startDate) + " " + x.end_time),
    }));
    const timeselected = fieldstime.find(x => x.start_time <= startDate && endDate <= x.end_time);
    if (!timeselected) return null;
    return { ...fieldselected, price: timeselected.price }
}

const validateFieldV2 = (fields, id_field, startDate, endDate) => {
    const fieldselected = fields.find(x => x.id_field === id_field);

    const times = fieldselected.time_prices.sort((a, b) => a.start_time > b.start_time ? 1 : (a.start_time < b.start_time ? -1 : 0)).reduce((acc, item) => {
        const indexfound = acc.findIndex(x => x.end_time === item.start_time)
        if (indexfound >= 0) {
            const tmm = {
                ...acc[indexfound],
                end_time: item.end_time
            }
            acc[indexfound] = tmm;
            return acc
        } else {
            return [...acc, item]
        }
    }, [])

    const fieldstime = times.map(x => ({
        ...x,
        start_time: new Date(getDateZyx(startDate) + " " + x.start_time),
        end_time: new Date(getDateZyx(startDate) + " " + x.end_time),
    }));
    const timeselected = fieldstime.find(x => x.start_time <= startDate && endDate <= x.end_time);
    if (!timeselected) return null;
    return { ...fieldselected, price: timeselected.price }
}

const validatePrice = (hours, startdate, enddate, times) => {
    const fieldstime = times.map(x => ({
        ...x,
        start_time: new Date(getDateZyx(startdate) + " " + x.start_time),
        end_time: new Date(getDateZyx(startdate) + " " + x.end_time),
    }));
    
    return [...Array(hours).keys()].reduce((acc, j) => {
        const startd = new Date(startdate.getTime() + (j * 36e5));
        const endd = new Date(startdate.getTime() + ((j + 1) * 36e5));

        
        const timeselected = fieldstime.find(x => x.start_time <= startd && endd <= x.end_time);
        return acc + (timeselected?.price || 0);
    }, 0)
}

const ChangePrice = ({ setData, index, appointment, data, openModal, setOpenModal }) => {

    useEffect(() => {
        if (openModal) {
            formik.resetForm();
        }
    }, [openModal])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            price: 0,
        },
        validationSchema: Yup.object({
            price: Yup.number().min(1, 'El precio es requerido')
        }),
        onSubmit: async values => {
            const newdata = [...data];
            newdata[index].price = values.price;
            newdata[index].total = values.price * newdata[index].hours;
            setData(newdata);
            console.log(newdata)
            setOpenModal(false);
        }
    });

    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='sm'
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <form
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <DialogTitle id="alert-dialog-title">Cambiar precio de {appointment?.title}</DialogTitle>
                    <DialogContent>
                        <div>
                            Precio anterior: {(appointment?.price || 0).toFixed(2)}
                        </div>
                        <div className="row-zyx">
                            <InputFormk
                                name="price"
                                classname="col-12"
                                label="Nuevo precio"
                                type='number'
                                formik={formik}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="submit"
                            color="primary"
                        >
                            GUARDAR
                        </Button>
                        <Button
                            type="button"
                            color="secondary"
                            style={{ marginLeft: '1rem' }}
                            onClick={() => setOpenModal(false)}
                        >
                            Cerrar
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

const ItemEvent = ({ appointment, setAppontmentSelectedIndex, index, setAppontmentSelected }) => {
    const datetmp = appointment.startDate.toLocaleString().split("/");
    const hourtmp = appointment.startDate.toLocaleString().split(" ")[1].split(":");
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', marginBottom: '4px', borderBottom: '1px solid #e1e1e1' }}>
            <div style={{ width: 'calc(45% - 15px)' }}>
                <div>{`${datetmp[0].padStart(2, "0")}/${datetmp[1].padStart(2, "0")}`}</div>
                <div>{`${hourtmp[0].padStart(2, "0")}:${hourtmp[1].padStart(2, "0")} (${appointment.hours}H)`}</div>
                <div>{appointment.title}({appointment.hours})</div>
            </div>
            <div style={{ width: 'calc(45% - 15px)' }}>
                S/ {appointment.total.toFixed(2)}
            </div>
            <div style={{ width: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Tooltip title="Cambiar el precio">
                    <Fab
                        size="small"
                        style={{ width: 30, height: 30 }}
                        onClick={() => {
                            setAppontmentSelected(appointment)
                            setAppontmentSelectedIndex(index)
                        }}
                    >
                        <EditIcon style={{ fontSize: 20 }} />
                    </Fab>
                </Tooltip>
            </div>
        </div>
    )
}

const getRange = (date, view) => {
    if (view === "Día" || view === "Day") return { startDate: date, endDate: date };
    if (view === "Semana" || view === "Week") {
        return {
            startDate: addDays(date, -date.getDay()),
            endDate: addDays(date, 6 - date.getDay())
        };
    }
};

const Boooking = () => {
    const { setOpenDrawer, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { user } = useContext(authContext);

    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [range, setrange] = useState(getRange(new Date(), "Week"));
    const router = useRouter();
    const [booking, setbooking] = useState({ id_booking: 0, status: '' });
    const [clients, setclients] = useState([]);
    const [eventsBookingDeleted, setEventsBookingDeleted] = useState([]);
    const [campus, setcampus] = useState([]);
    const [fields, setfields] = useState([]);
    const [fieldshowed, setfieldshowed] = useState([]);
    const [visible, setvisible] = useState(undefined)
    const [campusSelected, setCampusSelected] = useState(null);
    const [clientselected, setclientselected] = useState(null)
    const [openModalClient, setOpenModalClient] = useState(false)
    const [openModal, setOpenModal] = useState(false);
    const [currentView, setCurrentView] = useState("Week");
    const [appointmentsShowed, setAppointmentsShowed] = useState(undefined)
    const [appointments, setappointments] = useState(undefined)
    const [showAllEvents, setShowAllEvents] = useState(true); // valor del switch
    const [readOnly, setReadOnly] = useState(false); //bloquear cuando edite un evento ya creado en otra reserva
    const [validateResources, setValidateResources] = useState(false);
    const [appontmentSelected, setAppontmentSelected] = useState(null)
    const [appontmentSelectedIndex, setAppontmentSelectedIndex] = useState(null)
    const [showChangePrice, setshowChangePrice] = useState(false);

    useEffect(() => {
        let continuezyx = true;
        if (router?.query?.id) {
            const id_booking = parseInt(router.query.id);
            setbooking({ id_booking: router.query.id, status: '' });
            if (id_booking) {
                (async () => {
                    const r = await triggeraxios('post', process.env.endpoints.selsimple, SEL_BOOKING_BY_ID(id_booking))
                    const resultbooking = validateResArray(r, true)
                    if (resultbooking.length === 0)
                        return router.push("/bookings").then(() => setOpenSnackBack(true, { success: false, message: "No existe ninguna reserva con ese ID." }))

                    const bookingselected = resultbooking[0];

                    setbooking({ ...bookingselected, pending_amount: parseFloat(bookingselected.booking_amount || "0") - parseFloat(bookingselected.paid_amount || "0") });
                    triggeraxios('post', process.env.endpoints.selsimple, SEL_EVENTS_BY_CAMPUS({ id_booking })).then(r => {
                        const appauxs = validateResArray(r, true).map(x => ({
                            ...x,
                            id: bookingselected.status === "BORRADOR" ? x.id_event_calendar * -1 : x.id_event_calendar,
                            title: (x.client_name || x.field_name) + " - " + (x.status === "PAGADO" ? "PT" : (x.status === "PAGADO PARCIAL" ? "PP" : "NP")),
                            startDate: new Date(x.start_date),
                            endDate: new Date(x.end_date),
                            allDay: false,
                            total: parseFloat(x.amount),
                            hours: x.duration || 1,
                            price: parseFloat(x.amount) / (x.duration || 1)
                        }));
                        console.log(appauxs)
                        setData(appauxs);
                    })
                })()

            }
        }

        return () => continuezyx = false;
    }, [router])

    const getClients = () => {
        triggeraxios('post', process.env.endpoints.selsimple, SELCLIENTS).then(r => {
            setclients(validateResArray(r, true).map(x => ({ ...x, description: `${x.first_name} ${x.last_name} - ${x.doc_number}` })));
        })
    }

    const getData = React.useCallback(async () => {
        Promise.all([
            await triggeraxios('post', process.env.endpoints.selsimple, SELCLIENTS),
            await triggeraxios('post', process.env.endpoints.selsimple, SELCAMPUS)]
        ).then(r => {
            setclients(validateResArray(r[0], true).map(x => ({ ...x, description: `${x.first_name} ${x.last_name} - ${x.doc_number}` })));
            setcampus(validateResArray(r[1], true));
        })
    }, []);

    useEffect(() => {
        getData();
        setOpenDrawer(false)
    }, [])

    const onChangeCampus = async ({ newValue }) => {
        if (newValue) {
            setCampusSelected(newValue)
            setOpenBackdrop(true);
            await triggeraxios('post', process.env.endpoints.selsimple, SEL_FIELDS_BY_CAMPUS(newValue.id_campus)).then(res => {
                const datafields = validateResArray(res, true).map(x => ({ ...x, id_campus: newValue.id_campus, id: x.id_field, text: x.field_name, time_prices: JSON.parse(x.time_prices) }));
                setfields(datafields);
            });
            setOpenBackdrop(false);
        } else {
            setCampusSelected(null)
            setfields([])
            setappointments([])
        }
    }

    const currentDateChange = currentDate => {
        let range = getRange(currentDate, currentView);
        setCurrentDate(currentDate);
        setrange(range);
    };

    const currentViewChange = currentView => {
        let range = getRange(currentDate, currentView);
        setCurrentView(currentView);
        setrange(range);
    };

    useEffect(() => {
        if (campusSelected) {
            if (!range)
                return;
            triggeraxios('post', process.env.endpoints.selsimple, SEL_EVENTS_BY_CAMPUS({
                id_campus: campusSelected.id_campus,
                start_date: getDateZyx(range.startDate),
                end_date: getDateZyx(range.endDate)
            })).then(res => {
                if (data.length > 0) {
                    const listIndexed = [...data, ...eventsBookingDeleted].filter(x => !!x.id_event_calendar).reduce((acc, curr) => {
                        acc[curr.id_event_calendar] = curr;
                        return acc;
                    }, {});
                    const appauxs = validateResArray(res, true).filter(x => !listIndexed[x.id_event_calendar]).map(x => ({
                        ...x,
                        id: x.id_event_calendar,
                        title: (x.client_name || x.field_name) + " - " + (x.status === "PAGADO" ? "PT" : (x.status === "PAGADO PARCIAL" ? "PP" : "NP")),
                        startDate: new Date(x.start_date),
                        endDate: new Date(x.end_date),
                        allDay: false,
                        total: parseFloat(x.amount),
                        hours: x.duration || 1,
                        price: parseFloat(x.amount) / (x.duration || 1)
                    }));
                    setappointments(appauxs);
                } else {
                    const appauxs = validateResArray(res, true).map(x => ({
                        ...x,
                        id: x.id_event_calendar,
                        title: (x.client_name || x.field_name) + " - " + (x.status === "PAGADO" ? "PT" : (x.status === "PAGADO PARCIAL" ? "PP" : "NP")),
                        startDate: new Date(x.start_date),
                        endDate: new Date(x.end_date),
                        allDay: false,
                        total: parseFloat(x.amount),
                        hours: x.duration || 1,
                        price: parseFloat(x.amount) / (x.duration || 1)
                    }));
                    setappointments(appauxs);
                }
            });
        }
    }, [range, campusSelected])


    const Appointment = ({ children, style, ...restProps }) => {
        return (
            <Appointments.Appointment
                {...restProps}
                style={{
                    ...style,
                    opacity: restProps.data.id < 0 ? 1 : 0.6,
                }}
            >
                {children}
            </Appointments.Appointment>
        )
    };


    const commitChanges = async ({ added, changed, deleted }) => {
        let datesFromRecurrence = null;
        if (added && !added.id_field) {
            setOpenSnackBack(true, { success: false, message: "Debe seleccionar el campo." });
            setvisible(true)
            return data;
        }
        if (added && added.startDate > added.endDate) {
            setOpenSnackBack(true, { success: false, message: "La fecha de inicio debe ser mayor a la fecha de fin." });
            setvisible(true)
            return data;
        }
        let newchange = null
        if (changed) {
            const [idtmp, changes] = Object.entries(changed)[0];
            if (changes.rRule) {
                newchange = { ...data.find(x => x.id == idtmp), ...changes };
            }
        }

        if ((added && added.rRule) || (newchange && newchange.rRule)) {
            setOpenBackdrop(true)
            const diffDates = added ? added.endDate - added.startDate : newchange.endDate - newchange.startDate;
            const futureDates = added ? validateRule(added.rRule, added.startDate, added.endDate) : validateRule(newchange.rRule, newchange.startDate, newchange.endDate);
            console.log(futureDates);
            datesFromRecurrence = futureDates.map(x => {
                return {
                    id_field: added ? added.id_field : newchange.id_field,
                    start_time: x,
                    end_time: new Date(x.getTime() + diffDates)
                }
            })
            const res = await triggeraxios('post', process.env.endpoints.transaction, VALIDATE_BOOKING_BY_EVENT(datesFromRecurrence.map(x => ({
                id_field: x.id_field,
                start_time: getStringFromDate(x.start_time),
                end_time: getStringFromDate(x.end_time),
                id_booking: booking.id_booking
            }))));
            setOpenBackdrop(false)
            if (!res.success) {
                setOpenSnackBack(true, { success: false, message: res.msg });
                setvisible(true)
                return;
            }
        }
        setData((data) => {
            if (added) {
                setvisible(undefined);
                const fieldselected = validateFieldV2(fields, added.id_field, added.startDate, added.endDate);

                if (!fieldselected) {
                    setOpenSnackBack(true, { success: false, message: "El campo no está disponible en ese horario" });
                    return data;
                }
                const hours = Math.ceil(Math.abs(added.endDate - added.startDate) / 36e5);
                const startingAddedId = (data.length + 1) * - 1;
                if (datesFromRecurrence) {
                    const events = datesFromRecurrence.map((x, index) => ({
                        id: startingAddedId - index,
                        startDate: x.start_time,
                        endDate: x.end_time,
                        id_field: added.id_field,
                        id_campus: fieldselected.id_campus,
                        title: `${clientselected?.first_name || fieldselected.field_name}`,
                        price: fieldselected.price,
                        hours,
                        total: validatePrice(hours, added.startDate, added.endDate, fieldselected.time_prices)
                    }))
                    data = [...data, ...events];
                } else {
                    const event = {
                        id: startingAddedId,
                        ...added,
                        id_campus: fieldselected.id_campus,
                        title: `${clientselected?.first_name || fieldselected.field_name}`,
                        price: fieldselected.price,
                        hours,
                        total: validatePrice(hours, added.startDate, added.endDate, fieldselected.time_prices)
                    }
                    data = [...data, event];
                }
            }
            if (changed) {
                try {
                    if (datesFromRecurrence) {
                        setvisible(undefined);
                        const fieldselected = validateField(fields, newchange.id_field, newchange.startDate, newchange.endDate);
                        const hours = Math.ceil(Math.abs(newchange.endDate - newchange.startDate) / 36e5);
                        const startingAddedId = (data.length + 1) * - 1;
                        const events = datesFromRecurrence.map((x, index) => ({
                            id: startingAddedId - index,
                            startDate: x.start_time,
                            endDate: x.end_time,
                            id_field: newchange.id_field,
                            id_campus: fieldselected.id_campus,
                            title: `${clientselected?.first_name || fieldselected.field_name}`,
                            price: fieldselected.price,
                            hours,
                            total: validatePrice(hours, newchange.startDate, newchange.endDate, fieldselected.time_prices)
                            // total2: validatePrice(hours, newchange.startDate, newchange.endDate, fieldselected.time_prices)
                        }))
                        setEventsBookingDeleted(e => [...e, ...data.filter(x => !!x.id_event_calendar && x.id === newchange.id)]);
                        data = data.filter(x => x.id != newchange.id);
                        data = [...data, ...events];
                    } else {
                        data = data.map(appointment => {
                            if (!changed[appointment.id])
                                return appointment;

                            const changes = { ...appointment, ...changed[appointment.id] };
                            setvisible(undefined);
                            const fieldselected = validateField(fields, changes.id_field, changes.startDate, changes.endDate);

                            if (!fieldselected) {
                                throw new Error("El campo no está disponible en ese horario");
                            }
                            const hours = Math.ceil(Math.abs(changes.endDate - changes.startDate) / 36e5);
                            return { 
                                ...changes, 
                                id_campus: fieldselected.id_campus, 
                                title: (clientselected?.first_name || fieldselected.field_name), 
                                price: fieldselected.price, 
                                hours, 
                                total: validatePrice(hours, newchange.startDate, newchange.endDate, fieldselected.time_prices)
                            }

                        });
                    }
                } catch (error) {
                    console.log(error);
                    setOpenSnackBack(true, { success: false, message: "El campo no está disponible en ese horario" });
                    return data;
                }
            }
            if (deleted !== undefined) {
                data = data.filter(appointment => appointment.id !== deleted);
            }
            return data;
        });
    }

    useEffect(() => {
        if (appointments) {
            if (showAllEvents)
                setAppointmentsShowed([...appointments, ...data])
            else
                setAppointmentsShowed(data)
        } else if (data.length > 0)
            setAppointmentsShowed(data)
    }, [data, appointments])

    const onSave = () => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const dattosend = {
                method: "fn_ins_bookings",
                header: {
                    data: {
                        id_booking: booking.id_booking,
                        id_client: clientselected.id_client,
                        description: '',
                        booking_amount: data.reduce((acc, x) => acc + x.total, 0),
                        paid_amount: 0,
                        pending_amount: 0,
                        status: booking.status === "BORRADOR" ? "CONFIRMADO" : 'BORRADOR'
                    }
                },
                details: {
                    data: data.map(x => ({
                        ...x,
                        description: '',
                        duration: x.hours,
                        full_day: false,
                        start_time: getStringFromDate(x.startDate),
                        end_time: getStringFromDate(x.endDate),
                        amount: x.total,
                        status: 'ACTIVO'
                    }))
                }
            }
            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.transaction, dattosend);
            if (res.success) {
                const { id } = validateres(res, true)[0];
                setbooking({ id_booking: id, status: dattosend.header.data.status });
                setOpenSnackBack(true, { success: true, message: 'Reserva guardada satisfactoriamente.' });
            } else {
                setOpenSnackBack(true, { success: false, message: res.msg || 'Hubo un error, vuelva a intentarlo' });
            }
            setOpenBackdrop(false);
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de guardar la reserva?`, callback })
    }

    const TimeTableCell = React.useCallback(React.memo(({ onDoubleClick, endDate, startDate, ...restProps }) => (
        <WeekView.TimeTableCell
            {...restProps}
            onDoubleClick={(e) => {
                if (endDate < new Date())
                    return null;
                if (!(booking.status === 'BORRADOR' || booking.status === '')) {
                    setOpenSnackBack(true, { success: false, message: "No puede registrar mas eventos." });
                    return null;
                }
                if (fields.length === 0) {
                    setOpenSnackBack(true, { success: false, message: "No hay campos a mostrar" });
                    return null;
                }

                setfieldshowed(getFieldsFree(setOpenSnackBack, fields, startDate, endDate, [...appointments, ...data]));
                setReadOnly(false)
                onDoubleClick(e)
            }}
        >
            <Tooltip arrow placement="top" title={`${daysd[startDate.getDay()]} ${(startDate.getMonth() + 1).toString().padStart(2, "0")}/${startDate.getDate().toString().padStart(2, "0")} ${startDate.getHours()}:00`}>
                <div style={{ height: "100%", width: "100%" }}></div>
            </Tooltip>
        </WeekView.TimeTableCell>
    )), [fields, appointments, data]);

    const onCheckedShowAllEvents = (checked) => {
        setShowAllEvents(checked)
        if (checked)
            setAppointmentsShowed([...appointments, ...data])
        else
            setAppointmentsShowed(data)
    }

    const selectAppointment = (appointment) => {
        setAppontmentSelected(appointment);
        setshowChangePrice(true);
    }

    return (
        <Layout withPadding={false}>
            <div style={{ padding: '16px', paddingBottom: '0' }}>
                <div className="row-zyx">
                    <div className="col-2" style={{ display: 'none' }}>
                        <Switch
                            title="Ver eventos"
                            valueselected={true}
                            callback={onCheckedShowAllEvents}
                        />
                    </div>
                    <SelectFunction
                        title="Clientes"
                        datatosend={clients}
                        classname="col-4"
                        optionvalue="id_client"
                        disabled={!!booking?.id_client}
                        valueselected={booking?.id_client || (clientselected ? clientselected.id_client : '')}
                        optiondesc="description"
                        callback={({ newValue }) => setclientselected(newValue)}
                        namefield="id_client"
                        descfield="description"
                        noOptions="Agregar cliente"
                        onNoOptions={() => setOpenModalClient(true)}
                    />
                    <SelectFunction
                        title="Sedes"
                        datatosend={campus}
                        classname="col-4"
                        valueselected={user?.id_campus}
                        optionvalue="id_campus"
                        optiondesc="description"
                        callback={onChangeCampus}
                        namefield="id_campus"
                        descfield="description"
                    />
                    <div className="col-4" style={{ textAlign: 'right' }}>
                        {(booking.status === 'BORRADOR' || booking.status === '') ?
                            <Button
                                variant="contained"
                                onClick={onSave}
                                color="primary"
                                disabled={data.length === 0 || !clientselected}
                            >{booking.status === '' ? 'Guardar' : 'Confirmar'}</Button> :
                            ((booking.status === 'CONFIRMADO') ?
                                <Button
                                    variant="contained"
                                    onClick={() => setOpenModal(true)}
                                    color="primary"
                                >Registrar pago
                                </Button> : null
                            )
                        }
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {fields.map(x => (
                        <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 15, height: 15, backgroundColor: x.color }}></div> {x.field_name}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ zIndex: 2 }}>
                    <Scheduler
                        locale="es-ES"
                        data={appointmentsShowed}
                        style={{ zIndex: '1000' }}
                    >
                        <ViewState
                            currentDate={currentDate}
                            onCurrentDateChange={currentDateChange}
                            currentView={currentView}
                            onCurrentViewNameChange={currentViewChange}
                        />
                        <EditingState
                            onEditingAppointmentChange={(e) => {
                                if (e) {
                                    const { startDate, endDate, id, id_field } = e;
                                    setReadOnly(id > 0 || !(booking.status === 'BORRADOR' || booking.status === ''))
                                    setfieldshowed(getFieldsFree(setOpenSnackBack, fields, startDate, endDate, [...(appointments || []), ...data], id));
                                }
                            }}
                            onCommitChanges={commitChanges}
                        />
                        <EditRecurrenceMenu />
                        <ConfirmationDialog
                            messages={{
                                discardButton: "Descartar",
                                deleteButton: "Eliminar",
                                cancelButton: "Cancelar",
                                confirmDeleteMessage: "¿Está seguro de eliminar el evento?",
                                confirmCancelMessage: "¿Está seguro de descartar los cambios?",
                            }}
                        />
                        <WeekView
                            cellDuration={60}
                            startDayHour={8}
                            endDayHour={24}
                            name="Semana"
                            timeTableCellComponent={TimeTableCell}
                        />
                        <DayView
                            name="Día"
                            startDayHour={8}
                            endDayHour={24}
                        />
                        <Toolbar />
                        <DateNavigator />
                        <Appointments
                            appointmentComponent={Appointment}
                            appointmentContentComponent={(props) => {
                                return <Appointments.AppointmentContent {...props} formatDate={() => ""} />
                            }}
                        />
                        <AppointmentTooltip
                            showOpenButton
                            showDeleteButton
                        />
                        <AppointmentForm
                            locale="es-ES"
                            style={{ zIndex: '1000' }}
                            fullSize={true}
                            readOnly={readOnly}
                            radioGroupComponent={RadioGroup}
                            visible={visible}
                            onVisibilityChange={e => {
                                setValidateResources(e)
                                setvisible(undefined)
                            }}
                            textEditorComponent={props => {
                                if (props.placeholder === "Título")
                                    return null
                                return <AppointmentForm.TextEditor {...props} />
                            }}
                            // labelComponent={props => {
                            //     if (props.text === "Título")

                            //     return <AppointmentForm.Label {...props} />
                            // }}
                            commandLayoutComponent={({ onCancelButtonClick, ...props }) => {
                                return <AppointmentForm.CommandLayout {...props} onCancelButtonClick={(e) => {
                                    setvisible(undefined)
                                    onCancelButtonClick(e)
                                }} />
                            }}
                            dateEditorComponent={props => {
                                if (props.onValueChange.toString().includes("startDate"))
                                    return <AppointmentForm.DateEditor {...props} readOnly={true} />
                                return <AppointmentForm.DateEditor {...props} />
                            }}
                            booleanEditorComponent={props => {
                                if (props.label === "Todo el día")
                                    return null
                                return <AppointmentForm.BooleanEditor {...props} />
                            }}
                            messages={{
                                moreInformationLabel: 'Mas información',
                                weekly: "Semanalmente",
                                monthly: "Mensual",
                                yearly: "Anualmente",
                                titleLabel: "Título",
                                repeatLabel: "Repetir",
                                repeatEveryLabel: "Repetir cada",
                                endRepeatLabel: "Fin de repetición",
                                occurrencesLabel: "ocurrencias",
                                afterLabel: "Hasta",
                                daysLabel: "días",
                                neverLabel: "Nunca",
                                detailsLabel: "Detalles",
                                commitCommand: "Guardar",
                                allDayLabel: "Todo el día",
                                never: "Nunca",
                                onLabel: "En",
                                daily: "Diario",
                                notesLabel: "Notas",
                                weeksOnLabel: "Semanas en",
                                monthsLabel: "Meses",
                                ofEveryMonthLabel: "de cada mes",
                                firstLabel: "Primer",
                                secondLabel: "Segundo",
                                thirdLabel: "Tercer",
                                fourthLabel: "Cuarto",
                                lastLabel: "Último",
                                discardCommand: "Cancelar",
                            }}
                        />
                        <Resources
                            data={validateResources ? resources(fieldshowed) : resources(fields)}
                            mainResourceName="id_field"
                        />
                        <CurrentTimeIndicator
                            shadePreviousCells={true}
                        />
                        <ViewSwitcher />
                        <TodayButton />
                    </Scheduler>
                </div>
                {data.length > 0 &&
                    <div style={{ width: '200px', minWidth: '200px', padding: '8px', overflowY: 'auto', height: '600px' }}>
                        <div style={{ fontWeight: 'bold', display: 'flex', paddingBottom: '4px', marginBottom: '4px', borderBottom: '1px solid #e1e1e1' }}>
                            <span style={{ flex: 1 }}>Detalle</span>
                            <span style={{ flex: 1 }}>Importe</span>
                            <span style={{ flex: '0 0 30px' }}></span>
                        </div>
                        {console.log(data)}
                        {data.map((appointment, index) => (
                            <ItemEvent
                                key={`index${index}`}
                                index={index}
                                appointment={appointment}
                                setAppontmentSelectedIndex={setAppontmentSelectedIndex}
                                setAppontmentSelected={selectAppointment}
                            />
                        ))}
                        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', marginBottom: '4px', borderBottom: '1px solid #e1e1e1' }}>
                            <span>Total reserva</span>
                            <span>S/ {data.reduce((acc, i) => acc + i.total, 0).toFixed(2)}</span>
                        </div>
                    </div>
                }
            </div>
            <Payment
                openModal={openModal}
                setOpenModal={setOpenModal}
                booking={booking}
            />
            <ClientMain
                title="Cliente"
                method_ins={METHOD_INS}
                openModal={openModalClient}
                setclientselected={setclientselected}
                setOpenModal={setOpenModalClient}
                fetchDataUser={getClients}
                rowselected={null}
            />
            <ChangePrice
                setData={setData}
                data={data}
                appointment={appontmentSelected}
                index={appontmentSelectedIndex}
                openModal={showChangePrice}
                setOpenModal={setshowChangePrice}
            />
        </Layout>
    );
}

export default Boooking;