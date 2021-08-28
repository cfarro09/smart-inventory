import React, { useState, useContext, useEffect } from 'react';
import Layout from 'components/system/layout/layout'
import Checkbox from '@material-ui/core/Checkbox';

import Paper from '@material-ui/core/Paper';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import { useRouter } from 'next/router'
import triggeraxios from 'config/axiosv2';
import { validateResArray, getDomain } from 'config/helper';
import RadioGroup from 'components/system/form/RadioGroup';

import SelectFunction from 'components/system/form/select-function';
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
    AllDayPanel
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

const Boooking = () => {
    const [data, setData] = useState([]);
    const [showAppointment, setshowAppointment] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const router = useRouter();
    const [bookingid, setbookingid] = useState(0);
    const [clients, setclients] = useState([]);
    const [campus, setcampus] = useState([]);
    const [fields, setfields] = useState([]);

    useEffect(() => {
        let continuezyx = true;
        if (router?.query?.id) {
            setbookingid(router.query.id);
        }

        return () => continuezyx = false;
    }, [router])

    const getClients = React.useCallback(async () => {
        Promise.all([
            await triggeraxios('post', process.env.endpoints.selsimple, SELCLIENTS),
            await triggeraxios('post', process.env.endpoints.selsimple, SELCAMPUS)]
        ).then(r => {
            setclients(validateResArray(r[0], true).map(x => ({ ...x, description: `${x.first_name} ${x.last_name} - ${x.doc_number}` })));
            setcampus(validateResArray(r[1], true));
        })
    }, []);

    useEffect(() => {
        getClients();
    }, [])

    const onChangeCampus = async ({ newValue }) => {
        if (newValue) {
            const res = await triggeraxios('post', process.env.endpoints.selsimple, SEL_FIELDS_BY_CAMPUS(newValue.id_campus));
            const datafields = validateResArray(res, true).map(x => ({ ...x, id: x.id_field, text: x.field_name, time_prices: JSON.parse(x.time_prices) }));

            setfields(datafields);
        } else
            setfields([])
    }

    const commitChanges = ({ added, changed, deleted }) => {
        console.log(added);
        setData((data) => {
            if (added) {
                if (added.id_field) {
                    const fieldselected = fields.find(x => x.id_field === added.id_field);
                    console.log(fieldselected);
                    const fieldstime = fieldselected.time_prices.map(x => ({
                        ...x,
                        start_time: new Date(new Date(added.startDate).toISOString().substring(0, 10) + " " + x.start_time),
                        end_time: new Date(new Date(added.startDate).toISOString().substring(0, 10) + " " + x.end_time),
                    }));
                    const price = fieldstime.find(x => x.start_time >= added.startDate  && x.end_time <= added.endDate).price;
                    if (!price) {
                        return data;
                        console.log("no price");
                    }
                    const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
                    data = [...data, { id: startingAddedId, ...added, title: fieldselected.field_name, price }];
                }
            }
            if (changed) {
                data = data.map(appointment => (
                    changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
            }
            if (deleted !== undefined) {
                data = data.filter(appointment => appointment.id !== deleted);
            }
            return data;
        });
    }

    const TimeTableCell = React.useCallback(React.memo(({ onDoubleClick, endDate, ...restProps }) => (
        <WeekView.TimeTableCell
            {...restProps}
            onDoubleClick={endDate < new Date() ? null : onDoubleClick}
        />
    )), [showAppointment]);

    return (
        <Layout withPadding={false}>
            <div style={{ padding: '16px', paddingBottom: '0' }}>
                <div className="row-zyx">
                    <SelectFunction
                        title="Clientes"
                        datatosend={clients}
                        classname="col-4"
                        optionvalue="id_client"
                        optiondesc="description"
                        namefield="id_client"
                        descfield="description"
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
                </div>
            </div>
            <div style={{ zIndex: 2 }}>
                <Scheduler
                    locale="es-ES"
                    data={data}
                    style={{ zIndex: '1000' }}
                >
                    <ViewState
                        defaultCurrentDate={currentDate}
                    />
                    <EditingState
                        onAddedAppointmentChange={e => {
                            return null;
                        }}
                        onCommitChanges={commitChanges}
                    />
                    <IntegratedEditing />
                    <WeekView
                        cellDuration={60}
                        startDayHour={8}
                        endDayHour={23}
                        timeTableCellComponent={TimeTableCell}
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
                        fullSize={false}
                        radioGroupComponent={RadioGroup}
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
                        }}
                    />
                    <Resources
                        data={resources(fields)}
                        mainResourceName="id_field"
                    />
                    <CurrentTimeIndicator
                        shadePreviousCells={true}
                    />
                </Scheduler>
            </div>
        </Layout>
    );
}

export default Boooking;