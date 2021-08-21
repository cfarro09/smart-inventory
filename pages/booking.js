import React, { useState, useContext } from 'react';
import Layout from '../components/system/layout/layout'
import Paper from '@material-ui/core/Paper';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
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

const appointments = [
    {
        id: 20,
        title: "Watercolor Landscape",
        roomId: 1,
        members: [1],
        startDate: new Date(2021, 7, 16, 9, 0),
        endDate: new Date(2021, 7, 16, 10, 0),
    },
    {
        id: 1,
        title: "Oil Painting for Beginners",
        roomId: 2,
        members: [2],
        startDate: new Date(2017, 4, 1, 9, 30),
        endDate: new Date(2017, 4, 1, 11),
        rRule: "FREQ=WEEKLY;BYDAY=MO,TH;COUNT=10"
    },
];
const resourcesData = [
    {
        text: "Room CDFD",
        id: 1,
        color: "#8EC3E0"
    },
    {
        text: "Room 102",
        id: 2,
        color: "red"
    },
    {
        text: "Room 103",
        id: 3,
        color: "green"
    },
    {
        text: "Meeting room",
        id: 4,
        color: "black"
    },
    {
        text: "Conference hall",
        id: 5,
        color: "#e1e1e1"
    }
];

const owners = [
    {
        text: 'Carlos Farro',
        id: 1,
        color: '#FF7043',
    }, {
        text: 'Arnie Schwartz',
        id: 2,
        color: '#FF7043',
    }, {
        text: 'John Heart',
        id: 3,
        color: '#E91E63',
    }, {
        text: 'Taylor Riley',
        id: 4,
        color: '#E91E63',
    }, {
        text: 'Brad Farkus',
        id: 5,
        color: '#AB47BC',
    }, {
        text: 'Arthur Miller',
        id: 6,
        color: '#FFA726',
    },
];

const resources = [
    {
        fieldName: 'roomId',
        title: 'Room',
        instances: resourcesData,
    },
    {
        fieldName: 'members',
        title: 'Members',
        instances: owners,
        allowMultiple: true,
    },
]

const Boooking = () => {
    const [data, setData] = useState(appointments);
    const [showAppointment, setshowAppointment] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));

    console.log(data);

    const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
        const onCustomFieldChange = (nextValue) => {
            onFieldChange({ customField: nextValue });
        };

        return (
            <AppointmentForm.BasicLayout
                appointmentData={appointmentData}
                onFieldChange={onFieldChange}
                {...restProps}
            >
                <AppointmentForm.Label
                    text="Custom Field"
                    type="title"
                />
                <AppointmentForm.TextEditor
                    value={appointmentData.customField}
                    onValueChange={onCustomFieldChange}
                    placeholder="Custom field"
                />
            </AppointmentForm.BasicLayout>
        );
    };

    const commitChanges = ({ added, changed, deleted }) => {
        console.log("commited");
        setData((data) => {
            if (added) {
                const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
                data = [...data, { id: startingAddedId, ...added }];
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
        <Layout>
            <Scheduler
                locale="es-ES"
                data={data}
            >
                <ViewState
                    defaultCurrentDate={currentDate}
                />
                <EditingState
                    onAddedAppointmentChange={e => {
                        console.log('ddddddd', e);
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
                    fullSize={false}
                    // textEditorComponent={() => null}
                    BasicLayout={BasicLayout}
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

                    }}
                // readOnly={!showAppointment}
                />
                {/* <Resources
                    data={resources}
                    mainResourceName="roomId"
                /> */}
                <CurrentTimeIndicator
                    shadePreviousCells={true}
                // shadePreviousAppointments={shadePreviousAppointments}
                />
            </Scheduler>
        </Layout>
    );
}

export default Boooking;