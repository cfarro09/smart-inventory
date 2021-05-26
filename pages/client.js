import React, { useState, useContext } from 'react';
import triggeraxios from '../config/axiosv2';
import TableZyx from '../components/system/form/table-simple';
import popupsContext from '../context/pop-ups/pop-upsContext';
import Layout from '../components/system/layout/layout';
import ClientMain from '../components/client/clientmain';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import authContext from '../context/auth/authContext';

import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';
import { validateResArray } from '../config/helper';

const datatosend = {
    method: "SP_SEL_CLIENT",
    data: { status: null }
}

const Client = () => {
    const { setloadingglobal, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);

    const { appselected: appfound } = useContext(authContext);

    const [openModal, setOpenModal] = useState(false);
    const [rowselected, setrowselected] = useState(null);
    const [datatable, setdatatable] = useState([]);

    const columns = React.useMemo(
        () => [
            {
                Header: "",
                accessor: "id_client",
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Tooltip title="Editar">
                                    <IconButton
                                        aria-label="delete"
                                        disabled={ !appfound.update}
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
                            <Tooltip title="Eliminar">
                                    <IconButton
                                        disabled={ !appfound.delete}
                                        className="button-floating"
                                        aria-label="delete"
                                        size="small"
                                        onClick={() => deleterow(props.cell.row.original)}
                                    >
                                        <DeleteIcon
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
                Header: 'NOMBRE',
                accessor: 'company_name'
            },
            {
                Header: 'TIPO DOCUMENTO',
                accessor: 'doc_type'
            },
            {
                Header: 'DOCUMENTO',
                accessor: 'document'
            },
            {
                Header: 'RUBRO',
                accessor: 'category'
            },

            {
                Header: 'ESTADO',
                accessor: 'status'
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
        [appfound]
    );

    const deleterow = React.useCallback(async (row) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const datatosend = {
                method: "SP_INS_CLIENTS",
                header: {
                    data: {
                        ...row,
                        status: 'ELIMINADO',
                    }
                },
                details: {
                    data: []
                }
            }
            setloadingglobal(true)
            const res = await triggeraxios('post', process.env.endpoints.transaction, datatosend);

            if (res.success) {
                setOpenSnackBack(true, { success: true, message: 'Registro eliminado satisfactoriamente.' });
                fetchData({});
                setloadingglobal(false);
            } else {
                setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });
            }
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de eliminar el registro?`, callback })
    })

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend);
        setdatatable(validateResArray(res, true));
        setloadingglobal(false)
    }, []);

    const selectrow = React.useCallback((row) => {
        setOpenModal(true);
        setrowselected(row);
    }, [])

    return (
        <Layout>
            <TableZyx
                columns={columns}
                titlemodule='Clientes'
                data={datatable}
                fetchData={fetchData}
                register={!!appfound.insert}
                selectrow={selectrow}
            />
            <ClientMain
                title="Clientes"
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchDataUser={fetchData}
                rowselected={rowselected}
            />
        </Layout>
    );
}

export default Client;