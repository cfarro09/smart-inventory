import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import DateRange from '../components/system/form/daterange'
import TableZyx from '../components/system/form/table-paginated';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import authContext from '../context/auth/authContext';
import IconButton from '@material-ui/core/IconButton';
import { validateResArray } from 'config/helper';
import SelectFunction from '../components/system/form/select-function';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Payment as PaymentIcon,
    ListAlt as ListAltIcon,
    Receipt as ReceiptIcon,
} from '@material-ui/icons';
import { Button } from '@material-ui/core';

const SELCAMPUS = {
    method: "fn_sel_campus",
    data: { status: 'ACTIVO' }
}


const ScheduledBooking = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    // const [openModal, setOpenModal] = useState(false);
    const [dateRange, setDateRange] = useState([{
        startDate: new Date(new Date().setHours(10)),
        endDate: new Date(new Date().setHours(10)),
        key: 'selection'
    }]);
    const [loading, setloading] = useState(false);
    const [datafetch, setdatafetch] = useState({})
    const [datatable, setdatatable] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);
    const [campus, setcampus] = useState([]);
    const [campusSelected, setCampusSelected] = useState(null)
    const [resumen, setresumen] = useState(null)

    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_property',
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Tooltip title="Descargar recibo">
                                <IconButton
                                    aria-label="delete"
                                    size="small"
                                    className="button-floating"
                                    onClick={() => {
                                        selectrow(props.cell.row.original);
                                    }}
                                >
                                    <ReceiptIcon
                                        fontSize="inherit"
                                        size="small"
                                    />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )
                }
            },
            {
                Header: 'RECIBO',
                accessor: 'recipe_number',
                type: 'string',
            },
            {
                Header: 'TIPO DOC',
                accessor: 'doc_type',
                type: 'string',
            },
            {
                Header: 'DOCUMENTO',
                accessor: 'doc_number',
                type: 'string',
            },
            {
                Header: 'CLIENTE',
                accessor: 'client_name',
                type: 'string',
            },
            {
                Header: 'FORMA PAGO',
                accessor: 'payment_type',
                type: 'string',
            },
            {
                Header: 'REFERENCIA',
                accessor: 'reference',
                type: 'string',
            },
            {
                Header: 'C/R',
                accessor: 'type',
                type: 'string',
            },
            {
                Header: 'FECHA RESERVA',
                accessor: 'booking_date',
                type: 'string',
            },

            {
                Header: 'FECHA PAGO',
                accessor: 'payment_date',
                type: 'string',
            },
            {
                Header: 'INFO',
                accessor: 'info',
                type: 'string',
            },
            {
                Header: 'TOTAL',
                accessor: 'amount',
                type: 'string',
                Cell: (props) => {
                    const { amount } = props.cell.row.original;
                    return (
                        <div style={{ textAlign: 'right' }}>
                            {parseFloat(amount || "0").toFixed(2)}
                        </div>
                    )
                }
            },
        ],
        [appfound]
    );

    const selectrow = async (row) => {
        const res = await triggeraxios('get', `/api/export/invoice/${row.id_booking}`);

        window.open(res.result.data.url, '_blank');
    }

    useEffect(() => {
        triggeraxios('post', process.env.endpoints.selsimple, SELCAMPUS).then(res => setcampus(validateResArray(res, true)))
    }, [])

    const fetchData = React.useCallback(({ pageSize, pageIndex, filters, sorts }) => {
        const daterange = {
            startDate: dateRange[0].startDate.toISOString().substring(0, 10),
            endDate: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange });

        setloadingglobal(true);

        const datatosend = {
            methodcollection: "fn_sel_cash_register",
            take: pageSize || 20,
            skip: pageIndex || 0,
            filters: {
                ...filters,
                id_campus: {
                    operator: 'equals',
                    value: campusSelected?.id_campus
                }
            },
            sorts,
            daterange,
        }
        Promise.all([
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
            }),
            triggeraxios('post', process.env.endpoints.selpaginated, { ...datatosend, methodcollection: 'fn_sel_cash_register_resume' }).then(res => {
                console.log(res.result)
                if (!res.result)
                    setresumen(null)
                else {
                    const { cash_total, non_cash_total, total_income } = res.result.data.collection[0];
                    setresumen({
                        cash_total: parseFloat(cash_total || 0).toFixed(2),
                        non_cash_total: parseFloat(non_cash_total || 0).toFixed(2),
                        total_income: parseFloat(total_income || 0).toFixed(2)
                    });
                }
            })
        ])
    }, [campusSelected, dateRange]);

    const exportData = React.useCallback(({ pageSize, pageIndex, filters, sorts }) => {
        const daterange = {
            startDate: dateRange[0].startDate.toISOString().substring(0, 10),
            endDate: dateRange[0].endDate.toISOString().substring(0, 10)
        }
        setOpenBackdrop(true)
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange });

        const datatosend = {
            methodcollection: "fn_sel_cash_register",
            take: pageSize || 20,
            skip: pageIndex || 0,
            filters: {
                ...filters,
                id_campus: {
                    operator: 'equals',
                    value: campusSelected?.id_campus
                }
            },
            sorts,
            daterange,
        }
        triggeraxios('post', "api/export/cash_report", { ...datatosend, methodcollection: 'fn_sel_cash_register_resume' }).then(r => {
            setOpenBackdrop(false)
            if (r.success) {
                window.open(r.result.data.url);
            } else
                setOpenSnackBack(true, { success: false, message: 'Hubo un error, intentelo mas tarde.' });
        })
    }, [campusSelected, dateRange]);

    return (
        <Layout>
            <div className="row-zyx">
                <span className="col-3">
                    <DateRange
                        dateRangeinit={dateRange}
                        setDateRangeExt={setDateRange}
                    />
                </span>
                <SelectFunction
                    title="Sede"
                    datatosend={campus}
                    classname="col-4"
                    optionvalue="id_campus"
                    optiondesc="description"
                    callback={({ newValue }) => {
                        setCampusSelected(newValue);
                    }}
                />
                <span className="col-4">
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={loading || !!!campusSelected}
                        onClick={() => {
                            setloadingglobal(true);
                            fetchData(datafetch);
                        }}
                    >Buscar
                    </Button>
                </span>
            </div>
            {resumen &&
                <div className="row-zyx" style={{ borderTop: '1px solid #e1e1e1', borderBottom: '1px solid #e1e1e1', paddingTop: 8, paddingLeft: 8 }}>
                    <div className="col-4">
                        <Box fontWeight={500} lineHeight="18px" fontSize={14} mb={1} color="textPrimary">Total Deposito / Transferencia / Banco </Box>
                        <Box fontWeight={500} fontSize={16} color="textPrimary">S/ {resumen.non_cash_total}</Box>
                    </div>
                    <div className="col-4">
                        <Box fontWeight={500} lineHeight="18px" fontSize={14} mb={1} color="textPrimary">Total Efectivo</Box>
                        <Box fontWeight={500} fontSize={16} color="textPrimary">S/ {resumen.cash_total}</Box>
                    </div>
                    <div className="col-4">
                        <Box fontWeight={500} lineHeight="18px" fontSize={14} mb={1} color="textPrimary">Total Ingresos</Box>
                        <Box fontWeight={500} fontSize={16} color="textPrimary">S/ {resumen.total_income}</Box>
                    </div>
                </div>
            }
            <div style={{textAlign: 'right'}}>
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={loading || !!!campusSelected}
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                        exportData(datafetch);
                    }}
                >Exportar
                </Button>
            </div>
            <TableZyx
                columns={columns}
                data={datatable}
                // titlemodule="Arqueo de caja"
                totalrow={totalrow}
                refresh={false}
                // exportPersonalized={exportList}
                // loading={loading}
                // filterrange={true}
                pageCount={pageCount}
                fetchData={fetchData}
            />
        </Layout>
    );
}

export default ScheduledBooking;