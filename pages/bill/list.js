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
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';

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
                accessor: "id_bill_load_tmp",
                isComponent: true,
                Cell: props => {
                    const { id_bill_load } = props.cell.row.original;

                    return (
                        <Tooltip title="Procesar">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    selectrow(id_bill_load);
                                }}
                            >
                                <PlayArrowIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                        </Tooltip>
                    )
                }
            },
            {
                Header: "",
                accessor: "id_bill_load_tmp1",
                isComponent: true,
                Cell: props => {
                    const { id_bill_load, status } = props.cell.row.original;
                    if (status === "PENDIENTE")
                        return (
                            <Tooltip title="Eliminar nota de ingreso">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        deleteni(id_bill_load, datafetch);
                                    }}
                                >
                                    <DeleteIcon
                                        fontSize="inherit"
                                        size="small"
                                    />
                                </IconButton>
                            </Tooltip>
                        )
                    else
                        return null;
                }
            },
            {
                Header: 'ID',
                accessor: 'id_bill_load'
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
                Header: 'N° PRODUCTOS',
                accessor: 'number_records'
            },
            {
                Header: 'ESTADO',
                isMixedComponent: true,
                accessor: 'status',
                Cell: (props) => (
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <span className={classes.circuler} style={{backgroundColor: props.cell.row.original.status === "PROCESADO" ? "green" : "yellow"}}></span>
                        {props.cell.row.original.status}
                    </div>
                )
            },
            {
                Header: 'N° GUIA INGRESO',
                accessor: 'entrance_guide'
            },
            {
                Header: 'OC INGRESO',
                accessor: 'entry_purchase_order'
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

    const deleteni = React.useCallback(async (id, datafetchtmp) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const dattosend = {
                method: 'SP_ELIMINAR_CARGA',
                data: {
                    id_document: id,
                    type: 'NOTA INGRESO'
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

        setModalQuestion({ visible: true, question: `¿Está seguro de eliminar esta nota de ingreso?`, callback })
    }, [])

    const selectrow = (id_bill_load) => {
        router.push('/bill/[id]', `/bill/${id_bill_load}`)
    }

    const fetchData = React.useCallback(({ pageSize, pageIndex, filters, sorts, daterange }) => {
        setloadingglobal(true);
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange })
        const datatosend = {
            methodcollection: "SP_SEL_BILL_LOADS",
            methodcount: "SP_SEL_BILL_LOADS_COUNT",
            take: pageSize,
            skip: pageIndex,
            filters,
            sorts,
            origin: 'bill_load',
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
                titlemodule='Cargas de notas de ingreso'
            />
        </Layout>
    );
}

export default Example;