import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import UserModal from '../components/user/usermain';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { validateResArray } from '../config/helper';
import IconButton from '@material-ui/core/IconButton';
import authContext from '../context/auth/authContext';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const REQUESTUSER = {
    method: "SP_SEL_USER",
    data: {
        status: null,
        type: 'USER'
    }
}

const User = () => {

    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    const [openModal, setOpenModal] = useState(false);
    const [datatable, setdatatable] = useState([]);
    const [rowselected, setrowselected] = useState(null);

    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_user',
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <IconButton
                                aria-label="delete"
                                size="small"
                                className="button-floating"
                                disabled={!appfound.update}
                                onClick={() => {
                                    selectrow(props.cell.row.original);
                                }}
                            >
                                <EditIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                            <IconButton
                                className="button-floating"
                                aria-label="delete"
                                size="small"
                                disabled={!appfound.delete}
                                onClick={() => deleteuser(props.cell.row.original)}
                            >
                                <DeleteIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                        </div>
                    )
                }
            },
            {
                Header: 'NOMBRE',
                accessor: 'first_name',
                type: 'string',
            },
            {
                Header: 'APELLIDO',
                accessor: 'last_name',
                type: 'string',
            },
            {
                Header: 'USUARIO',
                accessor: 'username',
                type: 'string',
            },
            {
                Header: 'CORREO ELECTRONICO',
                accessor: 'user_email',
                type: 'string',
            },
            {
                Header: 'TIPO DOC',
                accessor: 'doc_type',
                type: 'string',
            },
            {
                Header: 'ROL',
                accessor: 'role_name',
                type: 'string',
            },
            {
                Header: 'N° DOC',
                accessor: 'doc_number',
                type: 'string',
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
        [appfound]
    );

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);
        const res = await triggeraxios('post', process.env.endpoints.selsimple, REQUESTUSER);
        setdatatable(validateResArray(res, true));
        setloadingglobal(false)
    }, []);

    const selectrow = (row) => {
        setOpenModal(true);
        setrowselected(row);
    }

    const deleteuser = (row) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const dattosend = {
                method: "SP_INS_USER",
                data: {
                    ...row,
                    id: row.id_user,
                    password: '',
                    type: 'USER',
                    phone: '999999999',
                    user: row.username,
                    status: 'ELIMINADO'
                }
            }

            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, dattosend);
            if (res.success) {
                setOpenSnackBack(true, { success: true, message: 'Transacción ejecutada satisfactoriamente.' });
                fetchData();
            } else {
                setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });
            }

            setOpenBackdrop(false)
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de de borrar al usuario ${row.user_email}?`, callback })
    }

    return (
        <Layout>
            <TableZyx
                columns={columns}
                titlemodule='Usuarios'
                data={datatable}
                fetchData={fetchData}
                register={!!appfound.insert}
                selectrow={selectrow}
            />
            <UserModal
                title="Usuario"
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchDataUser={fetchData}
                rowselected={rowselected}
            />
        </Layout>
    );
}

export default User;