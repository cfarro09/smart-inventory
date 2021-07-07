import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-paginated'
import triggeraxios from '../config/axiosv2';
import Typography from '@material-ui/core/Typography';
import popupsContext from '../context/pop-ups/pop-upsContext';
import InventoryMain from '../components/inventory/inventorymain';
import { getDomain, validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import Button from '@material-ui/core/Button';
import HistoryIcon from '@material-ui/icons/History';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

const REQUESTCLIENT = {
    method: "SP_SEL_CLIENT",
    data: { status: 'ACTIVO' }
}
const dataRequestStore = (id_client) => ({
    method: "SP_SEL_CLIENT_STORE",
    data: {
        id_client,
        status: null
    }
})

const TYPEREPORTS = [
    { id: "DETALLADO", description: "DETALLADO" },
    { id: "CONSOLIDADO", description: "CONSOLIDADO" },
]

const Example = () => {

    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [openModal, setOpenModal] = useState(false);
    const [rowselected, setrowselected] = useState(null);

    const [loading, setloading] = useState(true);
    const [datafetch, setdatafetch] = useState({})
    const [datatable, setdatatable] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);
    const [dataClient, setDataClient] = useState([]);
    const [dataStore, setDataStore] = useState([]);
    const [selected, setSelected] = useState({ id_client_store: 0, id_client: 0, type: "DETALLADO" })

    const columns = React.useMemo(
        () => [
            {
                Header: "",
                accessor: "id_client",
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Tooltip title="Ver historial">
                                <IconButton
                                    aria-label="show_history"
                                    size="small"
                                    className="button-floating"
                                    onClick={() => {
                                        selectrow(props.cell.row.original);
                                    }}
                                >
                                    <HistoryIcon
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
                Header: 'TIENDA',
                accessor: 'store_name'
            },
            {
                Header: 'COD PRODUCTO',
                accessor: 'product_code'
            },
            {
                Header: 'DESC PROD',
                accessor: 'product_description'
            },
            ...(selected.type === "DETALLADO" ? [{
                Header: 'PASILLO',
                accessor: 'hallway'
            }] : []),
            ...(selected.type === "DETALLADO" ? [{
                Header: 'COLUMNA',
                accessor: 'column'
            }] : []),
            ...(selected.type === "DETALLADO" ? [{
                Header: 'NIVEL',
                accessor: 'level'
            }] : []),
            {
                Header: 'EN CUARENTENA',
                accessor: 'quarantine'
            },
            {
                Header: 'EN MERMA',
                accessor: 'shrinkage'
            },
            {
                Header: 'SCRAP',
                accessor: 'scrap'
            },
            {
                Header: 'DEMO',
                accessor: 'demo'
            },
            {
                Header: 'STOCK DISP',
                accessor: 'available'
            },
            {
                Header: 'STOCK',
                accessor: 'quantity'
            },
            {
                Header: 'METRO CUBICO/CAJA',
                accessor: 'product_cmtr_pbox'
            },
            {
                Header: 'CANTIDAD METROS CUBICOS',
                accessor: 'product_cmtr_quantity'
            },
            {
                Header: 'COLOR',
                accessor: 'product_color'
            },
            {
                Header: 'FECHA DE EXPIRACION',
                accessor: 'product_exp_date'
            },
            {
                Header: 'LINEA',
                accessor: 'product_line'
            },
            {
                Header: 'LOTE',
                accessor: 'product_lots'
            },
            {
                Header: 'NUM° PAQUETE',
                accessor: 'product_package_number'
            },
            {
                Header: 'SERIE',
                accessor: 'product_serie'
            },
            {
                Header: 'TAMAÑO',
                accessor: 'product_size'
            },
            {
                Header: 'UNIDAD/CAJA',
                accessor: 'product_unitp_box'
            },
        ],
        [datatable]
    );

    const handlerSelectClient = React.useCallback(async ({ newValue }) => {
        if (newValue) {
            setSelected({ ...selected, id_client: newValue.id_client });
            const res = await triggeraxios('post', process.env.endpoints.selsimple, dataRequestStore(newValue.id_client));
            setDataStore(validateResArray(res, true));
        } else {
            setSelected({ ...selected, id_client: 0 });
            setDataStore([]);
        }
    });

    const selectrow = (row) => {
        setOpenModal(true);
        setrowselected(row);
    }

    const handlerSelectStore = React.useCallback(async ({ newValue }) => {
        if (newValue)
            setSelected({ ...selected, id_client_store: newValue.id_client_store });
        else
            setSelected({ ...selected, id_client_store: 0 });
    });

    const handlerSelectTypeReport = React.useCallback(async ({ newValue }) => {
        if (newValue)
            setSelected({ ...selected, type: newValue.id });
        else
            setSelected({ ...selected, type: 0 });
    });

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, REQUESTCLIENT).then(r => setDataClient(p => (validateResArray(r, continuezyx))))
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    const fetchData = React.useCallback(({ pageSize, pageIndex, filters, sorts, daterange }) => {
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange });
        if (!selected.id_client || !selected.type) {
            setdatatable([]);
            setPageCount(0);
            settotalrow(0);
            return;
        }
        setloadingglobal(true);

        const datatosend = {
            methodcollection: selected.type === "DETALLADO" ? "SP_REPORTE_INVENTARIO" : "SP_REPORTE_INVENTARIO_PRODUCTO",
            methodcount: selected.type === "DETALLADO" ? "SP_REPORTE_INVENTARIO_COUNT" : "SP_REPORTE_INVENTARIO_PRODUCTO_COUNT",
            take: pageSize,
            skip: pageIndex,
            filters: {
                ...filters,
                id_client: {
                    operator: 'equals',
                    value: selected.id_client
                },
                ...(selected.id_client_store && {
                    id_client_store: {
                        operator: 'equals',
                        value: selected.id_client_store
                    }
                }),
            },
            sorts,
            origin: 'reporte_inventario',
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

    }, [selected]);

    const exportList = React.useCallback(async () => {
        if (!selected.id_client || !selected.type) {
            setOpenSnackBack(true, { success: false, message: 'Debe seleccionar un cliente.' })
            return;
        }
        const r = await triggeraxios('post', selected.type === "DETALLADO" ? "/api/web/reportes/inventario" : "/api/web/reportes/inventario_producto", {
            ...datafetch, filters: {
                ...datafetch.filters, id_client: {
                    operator: 'equals',
                    value: selected.id_client
                },
                ...(selected.id_client_store && {
                    id_client_store: {
                        operator: 'equals',
                        value: selected.id_client_store
                    }
                }),
            }
        });
        if (r.success) {
            window.open(r.result.data.reporte);
        } else
            setOpenSnackBack(true, { success: false, message: 'Hubo un error, intentelo mas tarde.' });
    }, [datafetch])

    return (
        <Layout>
            <div style={{ position: 'relative' }}>
                <Typography variant="h6" id="tableTitle" component="div" style={{ marginBottom: '1rem' }}>
                    Inventario
                </Typography>
                <div className="row-zyx">
                    <SelectFunction
                        title="Cliente"
                        datatosend={dataClient}
                        classname="col-3"
                        optionvalue="id_client"
                        optiondesc="company_name"
                        callback={handlerSelectClient}
                    />
                    <SelectFunction
                        classname="col-3"
                        title="Tienda"
                        datatosend={dataStore}
                        callback={handlerSelectStore}
                        optionvalue="id_client_store"
                        optiondesc="store_name"
                    />
                    <SelectFunction
                        classname="col-3"
                        title="Reporte"
                        datatosend={TYPEREPORTS}
                        valueselected="DETALLADO"
                        callback={handlerSelectTypeReport}
                        optionvalue="id"
                        optiondesc="description"
                    />
                    <div className="col-2 mb-0">
                        <Button
                            color="primary"
                            component="span"
                            variant="contained"
                            onClick={() => fetchData(datafetch)}
                            disabled={!(selected.id_client && selected.type)}
                        >
                            BUSCAR
                        </Button>
                    </div>
                </div>

                <TableZyx
                    columns={columns}
                    data={datatable}
                    totalrow={totalrow}
                    exportPersonalized={exportList}
                    loading={loading}
                    pageCount={pageCount}
                    fetchData={fetchData}
                />
                <InventoryMain
                    title="Clientes"
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    rowselected={rowselected}
                />
            </div>

        </Layout>
    );
}

export default Example;