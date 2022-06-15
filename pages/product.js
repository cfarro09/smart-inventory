import React, { useState, useContext } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-paginated'
import ProductMain from '../components/product/productmain';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { validateResArray, getDomain } from '../config/helper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import authContext from '../context/auth/authContext';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const DATASEL = {
    method: "SP_SEL_BUYER",
    data: { status: null }
}
const METHOD_INS = "SP_INS_PRODUCTO";

const Buyer = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    const [openModal, setOpenModal] = useState(false);
    const [rowselected, setrowselected] = useState(null);

    const [loading, setloading] = useState(true);
    const [datafetch, setdatafetch] = useState({})
    const [datatable, setdatatable] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);

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
                                    <EditIcon
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
                Header: 'CLIENTE',
                accessor: 'client_name'
            },
            {
                Header: 'ALMACEN',
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
            {
                Header: 'ESTADO',
                accessor: 'status',
                type: 'string',
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
        [datatable]
    );

    const fetchData = React.useCallback(({ pageSize, pageIndex, filters, sorts, daterange }) => {
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange });
        setloadingglobal(true);

        const datatosend = {
            methodcollection: "SP_REPORTE_INVENTARIO_PRODUCTO",
            methodcount: "SP_REPORTE_INVENTARIO_PRODUCTO_COUNT",
            take: pageSize,
            skip: pageIndex,
            filters,
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
    }, []);

    const selectrow = (row) => {
        setOpenModal(true);
        setrowselected(row);
    }
    const deleterow = (row) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const DATASEL = {
                method: METHOD_INS,
                data: {
                    ...row,
                    status: 'ELIMINADO'
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
                data={datatable}
                totalrow={totalrow}
                // exportPersonalized={exportList}
                loading={loading}
                pageCount={pageCount}
                fetchData={fetchData}
            />
            <ProductMain
                title="Producto"
                method_ins={METHOD_INS}
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchDataUser={fetchData}
                rowselected={rowselected}
            />
        </Layout>
    );
}

export default Buyer;