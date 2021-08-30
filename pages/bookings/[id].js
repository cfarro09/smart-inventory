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

const SEL_FIELDS_BY_CAMPUS = (id_campus) => ({
    method: "fn_sel_field_by_campus ",
    data: { status: 'ACTIVO', id_campus }
})

const SEL_EVENTS_BY_CAMPUS = ({ id_campus = null, id_field = null, start_date, end_date, id_booking = null }) => ({
    method: "fn_sel_calendar_event",
    data: { id_campus, id_field, start_date, end_date, id_booking }
})

const METHOD_INS = "fn_ins_client";

const validateRule = (rule, startDate, endDate) => {
    const paramsSplited = rule.replace("RRULE:", "").split(";");
    const rules = paramsSplited.reduce((acc, item) => {
        const [key, value] = x.split("=");
        acc[key] = value;
        return acc;
    }, {});
}

const getDateZyx = (date) => new Date(new Date(date).setHours(10)).toISOString().substring(0, 10)

const getStringFromDate = (date) => `${getDateZyx(date)} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;

const getFieldsFree = (fields, startDate, endDate, appointments) => {
    console.log("zyxww", appointments);
    const aa = fields.map(field => {
        const aux = appointments.some(x => x.id_field === field.id_field && x.startDate >= startDate && x.endDate <= endDate);
        if (aux) 
            return null;
        const fieldstime = field.time_prices.map(x => ({
            ...x,
            start_time: new Date(getDateZyx(startDate) + " " + x.start_time),
            end_time: new Date(getDateZyx(startDate) + " " + x.end_time),
        }));
        const fieldtime = fieldstime.find(x => x.start_time <= startDate && endDate <= x.end_time);
        return fieldtime ? { ...field, price: fieldtime.price, text: field.field_name + " - S/ " + fieldtime.price } : null;
    })
    console.log("zyxww", aa);
    console.log("zyxww", aa.filter(x => !!x));
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
        let firstDay = date.getDate() - date.getDay();
        let lastDay = firstDay + 6;
        return {
            startDate: new Date(date.setDate(firstDay)),
            endDate: new Date(date.setDate(lastDay))
        };
    }
};

const Boooking = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
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
            setbooking({ id_booking: router.query.id, status: '' });
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
    console.log("dsad", appointments);
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
            });
        }
    }, [range, campusSelected])

    const commitChanges = ({ added, changed, deleted }) => {
        setData((data) => {
            if (added) {
                if (!added.id_field) {
                    setOpenSnackBack(true, { success: false, message: "Debe seleccionar el campo." });
                    setvisible(true)
                    return data;
                }
                setvisible(undefined);
                const fieldselected = validateField(fields, added.id_field, added.startDate, added.endDate);

                if (!fieldselected) {
                    setOpenSnackBack(true, { success: false, message: "El campo no está disponible en ese horario" });
                    return data;
                }
                const hours = Math.ceil(Math.abs(added.endDate - added.startDate) / 36e5);
                const startingAddedId = (data.length + 1) * - 1;
                data = [...data, { id: startingAddedId, ...added, id_campus: fieldselected.id_campus, title: `*${fieldselected.field_name}`, price: fieldselected.price, hours, total: fieldselected.price * hours }];
            }
            if (changed) {
                try {
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
                } catch (error) {
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
        }
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
                setOpenSnackBack(true, { success: false, message: !res.msg ? 'Hubo un error, vuelva a intentarlo' : res.msg });
            }
            setOpenBackdrop(false);
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de guardar la reserva?`, callback })
    }
    console.log("zyxwww", readOnly);
    const TimeTableCell = React.useCallback(React.memo(({ onDoubleClick, endDate, startDate, ...restProps }) => (
        <WeekView.TimeTableCell {...restProps} onDoubleClick={(e) => {
            if (endDate < new Date())
                return null;
            if (fields.length === 0) {
                setOpenSnackBack(true, { success: false, message: "No hay campos a mostrar" });
                return null;
            }
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
                <div className="col-2">
                    <Switch
                        title="Ver eventos"
                        valueselected={true}
                        callback={onCheckedShowAllEvents}
                    />
                </div>
                <div className="row-zyx">
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
                                    const { startDate, endDate, id } = e
                                    setReadOnly(id > 0)
                                    setfieldshowed(getFieldsFree(fields, startDate, endDate, [...appointments, ...data]));
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
                            commandLayoutComponent={({ onCancelButtonClick,  ...props }) => {
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
                    <div style={{ width: '200px', minWidth: '200px', padding: '8px' }}>
                        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', marginBottom: '4px', borderBottom: '1px solid #e1e1e1' }}>
                            <span>Detalle</span>
                            <span>Importe</span>
                        </div>
                        {data.map((appointment, index) => (
                            <ItemEvent key={`index${index}`} appointment={appointment} />
                        ))}
                        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total</span>
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
                setOpenModal={setOpenModalClient}
                fetchDataUser={getClients}
                rowselected={null}
            />
        </Layout>
    );
}

export default Boooking;