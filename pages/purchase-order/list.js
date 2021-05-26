import React, { useState, useContext } from 'react';
import Layout from '../../components/system/layout/layout'
import TableZyx from '../../components/system/form/table-paginated'
import ExampleMain from '../../components/example/examplemain';
import triggeraxios from '../../config/axiosv2';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import { useRouter } from 'next/router'
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    PlayArrow as PlayArrowIcon,
    List as ListIcon,
    Description as DescriptionIcon,
    Clear as ClearIcon
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    circuler: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        marginRight: '5px'
    }
}));

const Example = () => {
    const router = useRouter();
    const classes = useStyles();

    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [loading, setloading] = useState(true);
    const [datafetch, setdatafetch] = useState({})
    const [datatable, setdatatable] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);

    const columns = React.useMemo(
        () => [
            {
                Header: "",
                accessor: "id_detail",
                activeOnHover: true,
                Cell: props => {
                    const { status, id_purchase_order } = props.cell.row.original;
                    return (
                        <div className="container-button-floating">
                            {status === "PENDIENTE" &&
                                <Tooltip title="Procesar OC">
                                    <IconButton
                                        aria-label="process"
                                        size="small"
                                        className="button-floating"
                                        onClick={() => {
                                            processPurchaseOrder(id_purchase_order, datafetch);
                                        }}
                                    >
                                        <PlayArrowIcon
                                            fontSize="inherit"
                                            size="small"
                                        />
                                    </IconButton>
                                </Tooltip>
                            }
                            {status === "PROCESADO" &&
                                <Tooltip title="Anular OC">
                                    <IconButton
                                        aria-label="cancel"
                                        size="small"
                                        className="button-floating"
                                        onClick={() => {
                                            cancelPurchase(id_purchase_order, datafetch);
                                        }}
                                    >
                                        <ClearIcon
                                            fontSize="inherit"
                                            size="small"
                                        />
                                    </IconButton>
                                </Tooltip>
                            }
                            <Tooltip title="Ver detalle">
                                <IconButton
                                    className="button-floating"
                                    aria-label="showdetail"
                                    size="small"
                                    onClick={() => detailPurchaseOrder(id_purchase_order)}
                                >
                                    <ListIcon
                                        fontSize="inherit"
                                        size="small"
                                    />
                                </IconButton>
                            </Tooltip>
                            {status === "PROCESADO" &&
                                <Tooltip title="Exportar guia interna">
                                    <IconButton
                                        className="button-floating"
                                        aria-label="export"
                                        size="small"
                                        onClick={() => reportdetail(id_purchase_order)}
                                    >
                                        <DescriptionIcon
                                            fontSize="inherit"
                                            size="small"
                                        />
                                    </IconButton>
                                </Tooltip>
                            }
                            {status === "PENDIENTE" &&
                                <Tooltip title="Eliminar orden de compra">
                                    <IconButton
                                        className="button-floating"
                                        aria-label="export"
                                        size="small"
                                        onClick={() => deleteoc(id_purchase_order, datafetch)}
                                    >
                                        <DeleteIcon
                                            fontSize="inherit"
                                            size="small"
                                        />
                                    </IconButton>
                                </Tooltip>
                            }
                        </div>
                    )
                }
            },
            {
                Header: 'ID',
                accessor: 'id_purchase_order'
            },
            {
                Header: 'PLANTILLA',
                accessor: 'template_name'
            },
            {
                Header: 'CLIENTE',
                accessor: 'company_name'
            },
            {
                Header: 'TIENDA',
                accessor: 'store_name'
            },
            {
                Header: 'N° OC',
                accessor: 'purchase_order_number'
            },
            {
                Header: 'N° PRODUCTOS',
                accessor: 'number_records'
            },
            {
                Header: 'ESTADO',
                isMixedComponent: true,
                accessor: 'status',
                Cell: (props) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={classes.circuler} style={{ backgroundColor: props.cell.row.original.status === "PROCESADO" ? "green" : (props.cell.row.original.status === "ANULADO" ? "red" : "yellow") }}></span>
                        {props.cell.row.original.status}
                    </div>
                )
            },
            {
                Header: 'F. REGISTRO',
                accessor: 'date_created'
            },
            {
                Header: 'F. MODIFICADO',
                accessor: 'date_updated'
            },
            {
                Header: 'CREADO POR',
                accessor: 'created_by'
            },
            {
                Header: 'MODIFICADO POR',
                accessor: 'modified_by'
            },
        ],
        [datafetch]
    );

    const deleteoc = React.useCallback(async (id_purchase_order, datafetchtmp) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const dattosend = {
                method: 'SP_ELIMINAR_CARGA',
                data: {
                    id_document: id_purchase_order,
                    type: 'ORDEN COMPRA'
                }
            }
            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, dattosend);
            if (res.success) {
                fetchData(datafetchtmp);
                setOpenSnackBack(true, { success: true, message: 'Carga eliminada correctamente.' });
            } else
                setOpenSnackBack(true, { success: false, message: res.msg ? res.msg : 'Hubo un error, vuelva a intentarlo' });

            setOpenBackdrop(false);
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de eliminar esta orden de compra?`, callback })
    }, [])

    const reportdetail = React.useCallback(async (id_purchase_order) => {
        setOpenBackdrop(true);
        const r = await triggeraxios('post', "/api/web/purchase_order/print/detail", { id_purchase_order });
        if (r.success) {
            window.open(r.result.data.document);
        } else
            setOpenSnackBack(true, { success: false, message: 'Hubo un error, intentelo mas tarde.' });
        setOpenBackdrop(false);
    }, [])

    const detailPurchaseOrder = React.useCallback((id_purchase_order) => {
        router.push('/purchase-order/[id]', `/purchase-order/${id_purchase_order}`)
    }, []);

    const processPurchaseOrder = React.useCallback((id_purchase_order, datafetchtmp) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const dattosend = {
                id_purchase_order,
                flag: 0
            }
            setOpenBackdrop(true);
            const res = await triggeraxios('post', "/api/web/purchase_order/process", dattosend);
            if (res.success) {
                fetchData(datafetchtmp);
                setOpenSnackBack(true, { success: true, message: 'Carga procesada correctamente.' });
            } else
                setOpenSnackBack(true, { success: false, message: res.msg ? res.msg : 'Hubo un error, vuelva a intentarlo' });

            setOpenBackdrop(false);
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de procesar esta orden de compra?`, callback })
    }, [datafetch])

    const cancelPurchase = React.useCallback((id_purchase_order, datafetchtmp) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const dattosend = {
                id_purchase_order,
                flag: 0
            }
            // setOpenSnackBack(true, { success: false, message: 'En desarrollo...' });
            // return;
            setOpenBackdrop(true);
            const res = await triggeraxios('post', "/api/web/purchase_order/cancel", dattosend);
            if (res.success) {
                fetchData(datafetchtmp);
                setOpenSnackBack(true, { success: true, message: 'Carga cancelada correctamente.' });
            } else
                setOpenSnackBack(true, { success: false, message: res.msg ? res.msg : 'Hubo un error, vuelva a intentarlo' });

            setOpenBackdrop(false);
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de anular esta orden de compra?`, callback })
    }, [datafetch])

    const fetchData = React.useCallback(({ pageSize, pageIndex, filters, sorts, daterange }) => {
        setloadingglobal(true);
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange })
        const datatosend = {
            methodcollection: "SP_SEL_PURCHASE_ORDER",
            methodcount: "SP_SEL_PURCHASE_ORDER_COUNT",
            take: pageSize,
            skip: pageIndex,
            filters,
            sorts,
            origin: 'purchase_order',
            daterange,
            offset: (new Date().getTimezoneOffset() / 60) * -1
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
    }, [datafetch]);

    return (
        <Layout>
            <TableZyx
                columns={columns}
                data={datatable}
                totalrow={totalrow}
                filterrange={true}
                loading={loading}
                pageCount={pageCount}
                fetchData={fetchData}
                titlemodule='Ordenes de compra'
            />
        </Layout>
    );
}

export default Example;