import React, { useState, useContext } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import TemplateMain from '../components/viewtemplate/templatemain';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { validateResArray, getDomain } from '../config/helper';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import authContext from '../context/auth/authContext';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const datatosend = {
    method: "SP_SEL_LOAD_TEMPLATE",
    data: { status: null, type: null }
}

const Template = () => {
    const { appselected: appfound } = useContext(authContext);
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [openModal, setOpenModal] = useState(false);
    const [datatable, setdatatable] = useState([]);
    const [rowselected, setrowselected] = useState(null);

    const columns = React.useMemo(
        () => [
            {
                Header: "",
                accessor: "id_template",
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Tooltip title="Editar">
                                <IconButton
                                    aria-label="delete"
                                    size="small"
                                    className="button-floating"
                                    disabled={ !appfound.update}
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
                                    className="button-floating"
                                    aria-label="delete"
                                    size="small"
                                    disabled={ !appfound.delete}
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
                Header: 'PLANTILLA',
                accessor: 'name'
            },
            {
                Header: 'DESCRIPCION',
                accessor: 'description'
            },
            {
                Header: 'CLIENTE',
                accessor: 'client_name'
            },
            {
                Header: 'TIPO',
                accessor: 'type'
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
            }
        ],
        [appfound]
    );

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);
        const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend)
        setdatatable(validateResArray(res, true));
        setloadingglobal(false)
    }, []);

    const selectrow = (row) => {
        setOpenModal(true);
        setrowselected(row);
    }
    const deleterow = (row) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const datatosend = {
                method: "SP_INS_LOAD_TEMPLATE",
                data: {
                    ...row,
                    status: 'ELIMINADO'
                }
            }

            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend);
            if (res.success) {
                setOpenSnackBack(true, { success: true, message: 'Transacción ejecutada satisfactoriamente.' });
                fetchData();
            } else {
                setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });
            }

            setOpenBackdrop(false)
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de de borrar la plantilla?`, callback })
    }
    return (
        <Layout>
            <TableZyx
                columns={columns}
                titlemodule='Template'
                data={datatable}
                fetchData={fetchData}
                register={!!appfound.insert}
                selectrow={selectrow}
            />
            <TemplateMain
                title="Template"
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchDataUser={fetchData}
                rowselected={rowselected}
            />
        </Layout>
    );
}

export default Template;