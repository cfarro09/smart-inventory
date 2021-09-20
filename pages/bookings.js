import React, { useState, useContext } from 'react';
import Layout from 'components/system/layout/layout'
import TableZyx from 'components/system/form/table-simple';
import ClientMain from 'components/client/clientmain';
import triggeraxios from 'config/axiosv2';
import popupsContext from 'context/pop-ups/pop-upsContext';
import { validateResArray, getDomain } from 'config/helper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import authContext from 'context/auth/authContext';
import Payment from 'components/payment/payment'
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Payment as PaymentIcon
} from '@material-ui/icons';
import { useRouter } from 'next/router';

const DATASEL = {
    method: "fn_sel_booking",
    data: { status: null, id_booking: null }
}

const METHOD_INS = "fn_ins_client";

const Bookings = () => {
    const router = useRouter();
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    const [datatable, setdatatable] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [booking, setbooking] = useState({id_booking: 0, status: ''});

    const columns = React.useMemo(
        () => [
            {
                Header: "",
                accessor: "id_booking",
                activeOnHover: true,
                Cell: props => {
                    const { status, id_booking } = props.cell.row.original
                    return (
                        <div className="container-button-floating">
                            <Tooltip title="Editar">
                                <IconButton
                                    aria-label="delete"
                                    size="small"
                                    className="button-floating"
                                    disabled={!appfound.update}
                                    onClick={() => {
                                        router.push(`/bookings/${id_booking}`)
                                    }}
                                >
                                    <EditIcon
                                        fontSize="inherit"
                                        size="small"
                                    />
                                </IconButton>
                            </Tooltip>
                            {status === "BORRADOR" &&
                                (<Tooltip title="Eliminar">
                                    <IconButton
                                        className="button-floating"
                                        aria-label="delete"
                                        size="small"
                                        disabled={!appfound.delete}
                                        onClick={() => deleterow(props.cell.row.original)}
                                    >
                                        <DeleteIcon
                                            fontSize="inherit"
                                            size="small"
                                        />
                                    </IconButton>
                                </Tooltip>)}
                            {status === "CONFIRMADO" &&
                                (<Tooltip title="Pagar">
                                    <IconButton
                                        className="button-floating"
                                        aria-label="delete"
                                        size="small"
                                        disabled={!appfound.delete}
                                        onClick={() => payBooking(props.cell.row.original)}
                                    >
                                        <PaymentIcon
                                            fontSize="inherit"
                                            size="small"
                                        />
                                    </IconButton>
                                </Tooltip>)}
                        </div>
                    )
                }
            },
            {
                Header: "CLIENTE",
                accessor: "client_name"
            },
            {
                Header: 'FECHA CREACIÓN',
                accessor: 'date_created'
            },
            {
                Header: 'IMPORTE TOTAL',
                accessor: 'booking_amount',
                Cell: (props) => {
                    const { booking_amount } = props.cell.row.original;
                    return (
                        <div style={{textAlign: 'right'}}>
                            {parseFloat(booking_amount || "0").toFixed(2)}
                        </div>
                    )
                }
            },
            {
                Header: 'IMPORTE PAGADO',
                accessor: 'paid_amount',
                Cell: (props) => {
                    const { paid_amount } = props.cell.row.original;
                    return (
                        <div style={{textAlign: 'right'}}>
                            {parseFloat(paid_amount || "0").toFixed(2)}
                        </div>
                    )
                }
            },
            {
                Header: 'IMPORTE PENDIENTE',
                accessor: 'pending_amount',
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
                Header: 'ESTADO',
                accessor: 'status'
            },
            {
                Header: 'CREADO POR',
                accessor: 'created_by'
            },
        ],
        [appfound]
    );

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, DATASEL)
        setdatatable(validateResArray(res, true));
        setloadingglobal(false)
    }, []);

    const payBooking = (row) => {
        setOpenModal(true)
        setbooking(row)
    }

    const selectrow = (row) => {
        if (!row) {
            router.push('/bookings/0')
        }
    }
    const deleterow = (row) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const DATASEL = {
                method: METHOD_INS,
                data: {
                    ...row,
                    id_client: row ? row.id_client : 0,
                    status: 'ELIMINADO',
                }
            }

            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, DATASEL);
            if (res.success) {
                setOpenSnackBack(true, { success: true, message: 'Registro eliminado satisfactoriamente.' });
                fetchData();
            } else {
                setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });
            }
            setOpenBackdrop(false)
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de de borrar el comprador?`, callback })
    }
    return (
        <Layout>
            <TableZyx
                columns={columns}
                titlemodule='Reservas'
                data={datatable}
                fetchData={fetchData}
                register={!!appfound.insert}
                selectrow={selectrow}
            />
            <Payment
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchData={fetchData}
                booking={booking}
            />
        </Layout>
    );
}

export default Bookings;