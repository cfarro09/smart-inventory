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
import SelectFunction from 'components/system/form/select-function';
import ClientMain from 'components/client/clientmain';

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
    method: "fn_sel_campus",
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
    const paramsSplited = rule.replace("RRULE:", "").split(";");
    const rules = paramsSplited.reduce((acc, item) => {
        const [key, value] = item.split("=");
        acc[key] = value;
        return acc;
    }, {});
    console.log("resultarray3", rule, startDate, endDate);
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
                itt++
            })
        }
        console.log(dates);
        return dates
    }
}

const getDateZyx = (date) => new Date(new Date(date).setHours(10)).toISOString().substring(0, 10)

const getStringFromDate = (date) => `${getDateZyx(date)} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;

const getFieldsFree = (fields, startDate, endDate, appointments, id = null) => {

    const aa = fields.map(field => {
        const appointmentsAux = id ? appointments.filter(x => x.id !== id) : appointments;
        const aux = appointmentsAux.some(x => x.id_field === field.id_field && x.startDate >= startDate && x.endDate <= endDate);
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
    return aa.filter(x => !!x)
}

const validateField = (fields, id_field, startDate, endDate) => {
    const fieldselected = fields.find(x => x.id_field === id_field);

    const fieldstime = fieldselected.time_prices.map(x => ({
        ...x,
        start_time: new Date(getDateZyx(startDate) + " " + x.start_time),
        end_time: new Date(getDateZyx(startDate) + " " + x.end_time),
    }));
    const timeselected = fieldstime.find(x => x.start_time <= startDate && endDate <= x.end_time);
    if (!timeselected) return null;
    return { ...fieldselected, price: timeselected.price }
}

const ItemEvent = ({ appointment }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', marginBottom: '4px', borderBottom: '1px solid #e1e1e1' }}>
            <div style={{ width: '50%' }}>
                <div>{appointment.startDate.toLocaleString()}</div>
                <div>{appointment.title}({appointment.hours})</div>
            </div>
            <div style={{ width: '50%', textAlign: 'right' }}>
                S/ {appointment.total.toFixed(2)}
            </div>
        </div>
    )
}

const getRange = (date, view) => {
    if (view === "Day") return { startDate: date, endDate: date };
    if (view === "Week") {
        return {
            startDate: addDays(date, -date.getDay()),
            endDate: addDays(date, 6 - date.getDay())
        };
    }
};

const Boooking = () => {
    const { setOpenDrawer, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [range, setrange] = useState(getRange(new Date(), "Week"));
    const router = useRouter();
    const [booking, setbooking] = useState({ id_booking: 0, status: '' });
    const [clients, setclients] = useState([]);
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
                    console.log("dasdsa", bookingselected);
                    setbooking(bookingselected);
                    triggeraxios('post', process.env.endpoints.selsimple, SEL_EVENTS_BY_CAMPUS({ id_booking })).then(r => {
                        const appauxs = validateResArray(r, true).map(x => ({
                            ...x,
                            id: bookingselected.status === "BORRADOR" ? x.id_event_calendar * -1 : x.id_event_calendar,
                            title: x.field_name,
                            startDate: new Date(x.start_date),
                            endDate: new Date(x.end_date),
                            allDay: false,
                            total: parseFloat(x.amount),
                            hours: x.duration || 1,
                            price: parseFloat(x.amount) / (x.duration || 1)
                        }));
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
            triggeraxios('post', process.env.endpoints.selsimple, SEL_EVENTS_BY_CAMPUS({
                id_campus: campusSelected.id_campus,
                start_date: getDateZyx(range.startDate),
                end_date: getDateZyx(range.endDate)
            })).then(res => {
                if (data.length > 0) {
                    console.log("listIndexed", data);
                    const listIndexed = data.filter(x => !!x.id_event_calendar).reduce((acc, curr) => {
                        acc[curr.id_event_calendar] = curr;
                        return acc;
                    }, {});
                    console.log("listIndexed", listIndexed);
                    const appauxs = validateResArray(res, true).filter(x => !listIndexed[x.id_event_calendar]).map(x => ({
                        ...x,
                        id: x.id_event_calendar,
                        title: x.field_name,
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
                        title: x.field_name,
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

    const commitChanges = async ({ added, changed, deleted }) => {
        let datesFromRecurrence = null;
        if (added && !added.id_field) {
            setOpenSnackBack(true, { success: false, message: "Debe seleccionar el campo." });
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
            // console.log(futureDates);
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
                end_time: getStringFromDate(x.end_time)
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
                const fieldselected = validateField(fields, added.id_field, added.startDate, added.endDate);
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
                        title: `*${fieldselected.field_name}`,
                        price: fieldselected.price,
                        hours,
                        total: fieldselected.price * hours

                    }))
                    data = [...data, ...events];
                } else {
                    data = [...data, { id: startingAddedId, ...added, id_campus: fieldselected.id_campus, title: `*${fieldselected.field_name}`, price: fieldselected.price, hours, total: fieldselected.price * hours }];
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
                            title: `*${fieldselected.field_name}`,
                            price: fieldselected.price,
                            hours,
                            total: fieldselected.price * hours
                        }))
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
                            return { ...changes, id_campus: fieldselected.id_campus, title: fieldselected.field_name, price: fieldselected.price, hours, total: fieldselected.price * hours }

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
        <WeekView.TimeTableCell {...restProps} onDoubleClick={(e) => {
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
            console.log(appointments);
            setfieldshowed(getFieldsFree(fields, startDate, endDate, [...appointments, ...data]));
            setReadOnly(false)
            onDoubleClick(e)
        }}
        />
    )), [fields, appointments, data]);

    const onCheckedShowAllEvents = (checked) => {
        setShowAllEvents(checked)
        if (checked)
            setAppointmentsShowed([...appointments, ...data])
        else
            setAppointmentsShowed(data)
    }

    return (
        <Layout withPadding={false}>
            <div style={{ padding: '16px', paddingBottom: '0' }}>

                <div className="row-zyx">
                    <div className="col-2">
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
                        optionvalue="id_campus"
                        optiondesc="description"
                        callback={onChangeCampus}
                        namefield="id_campus"
                        descfield="description"
                    />
                    <div className="col-2" style={{ textAlign: 'right' }}>
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
                                    
                                    setReadOnly(id > 0 && !(booking.status === 'BORRADOR' || booking.status === ''))

                                    setfieldshowed(getFieldsFree(fields, startDate, endDate, [...(appointments || []), ...data], id));
                                }
                            }}
                            onCommitChanges={commitChanges}
                        />
                        <EditRecurrenceMenu />
                        <ConfirmationDialog />
                        <WeekView
                            cellDuration={60}
                            startDayHour={8}
                            endDayHour={23}
                            timeTableCellComponent={TimeTableCell}
                        />
                        <DayView
                            startDayHour={8}
                            endDayHour={23}
                        />
                        <Toolbar />
                        <DateNavigator />
                        <Appointments />
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
                        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', marginBottom: '4px', borderBottom: '1px solid #e1e1e1' }}>
                            <span>Detalle</span>
                            <span>Importe</span>
                        </div>
                        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', marginBottom: '4px', borderBottom: '1px solid #e1e1e1' }}>
                            <span>Total</span>
                            <span>S/ {data.reduce((acc, i) => acc + i.total, 0).toFixed(2)}</span>
                        </div>
                        {data.map((appointment, index) => (
                            <ItemEvent key={`index${index}`} appointment={appointment} />
                        ))}
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
                setOpenModal={setOpenModalClient}
                fetchDataUser={getClients}
                rowselected={null}
            />
        </Layout>
    );
}

export default Boooking;