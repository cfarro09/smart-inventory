import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-paginated';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import Payment from 'components/payment/payment'
import authContext from '../context/auth/authContext';
import IconButton from '@material-ui/core/IconButton';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Payment as PaymentIcon
} from '@material-ui/icons';

const selproperty = {
    method: "SP_SEL_PROPERTIES",
    data: {
        name: null,
        status: 'ACTIVO'
    }
}

const ScheduledBooking = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    const [openModal, setOpenModal] = useState(false);

    const [loading, setloading] = useState(true);
    const [datafetch, setdatafetch] = useState({})
    const [datatable, setdatatable] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);
    const [rowselected, setrowselected] = useState({ id_booking: 0 });

    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_property',
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <IconButton
                                aria-label="delete"
                                size="small"
                                className="button-floating"
                                onClick={() => {
                                    selectrow(props.cell.row.original);
                                }}
                            >
                                <PaymentIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                        </div>
                    )
                }
            },
            {
                Header: 'Cliente',
                accessor: 'client_name',
                type: 'string',
            },
            {
                Header: 'Tipo documento',
                accessor: 'doc_type',
                type: 'string',
            },
            {
                Header: 'N° documento',
                accessor: 'doc_number',
                type: 'string',
            },
            {
                Header: 'Sede',
                accessor: 'campus_name',
                type: 'string',
            },
            {
                Header: 'Cancha',
                accessor: 'field_name',
                type: 'string',
            },
            {
                Header: 'Fecha inicio',
                accessor: 'start_date',
                type: 'string',
            },
            {
                Header: 'Fecha fin',
                accessor: 'end_date',
                type: 'string',
            },
            {
                Header: 'Importe',
                accessor: 'amount',
                type: 'string',
                Cell: (props) => {
                    const { amout } = props.cell.row.original;
                    return (
                        <div style={{textAlign: 'right'}}>
                            {parseFloat(amout || "0").toFixed(2)}
                        </div>
                    )
                }
            },
            {
                Header: 'Importe pendiente',
                accessor: 'pending_amount',
                type: 'string',
                Cell: (props) => {
                    const { pending_amount } = props.cell.row.original;
                    return (
                        <div style={{textAlign: 'right'}}>
                            {parseFloat(pending_amount || "0").toFixed(2)}
                        </div>
                    )
                }
            },
            {
                Header: 'Estado',
                accessor: 'status',
                type: 'string',
            },
        ],
        [appfound]
    );

    const fetchData = ({ pageSize, pageIndex, filters, sorts, daterange }) => {
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange });
        // if (!selected.id_client || !selected.type) {
        // setdatatable([]);
        // setPageCount(0);
        // settotalrow(0);
        // return;
        // }
        setloadingglobal(true);

        const datatosend = {
            methodcollection: "fn_sel_event_by_date",
            take: pageSize,
            skip: pageIndex,
            filters,
            sorts,
            // origin: 'reporte_inventario',
            daterange,
            // offset: (new Date().getTimezoneOffset() / 60) * -1
        }

        triggeraxios('post', process.env.endpoints.selpaginated, datatosend).then(res => {
            if (res.success) {
                if (res.result.data.collection instanceof Array) {
                    setdatatable(res.result.data.collection);
                    setPageCount(Math.ceil(res.result.data.count / pageSize));
                    settotalrow(res.result.data.count);
                }
                else
                    console.error("Result is not array");
            }
            setloading(false);
            setloadingglobal(false)
        });

    }

    const selectrow = (row) => {
        setOpenModal(true);
        setrowselected(row);
    }

    return (
        <Layout>
            <TableZyx
                columns={columns}
                data={datatable}
                titlemodule="Eventos programados"
                totalrow={totalrow}
                // exportPersonalized={exportList}
                // loading={loading}
                filterrange={true}
                pageCount={pageCount}
                fetchData={fetchData}
            />
            <Payment
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchData={fetchData}
                booking={rowselected}
            />
        </Layout>
    );
}

export default ScheduledBooking;