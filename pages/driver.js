import React, { useState, useContext } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import VehicleMain from '../components/vehicle/vehiclemain';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { validateResArray, getDomain } from '../config/helper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import authContext from '../context/auth/authContext';
import db from '../config/firebase';

import { getDatabase, ref, onValue, get } from "firebase/database";


import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const DATASEL = {
    method: "SP_SEL_DRIVER",
    data: { status: null, type: 'DRIVER' }
}

const METHOD_INS = "SP_INS_DRIVER";

const Vehicle = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    const [openModal, setOpenModal] = useState(false);
    const [datatable, setdatatable] = useState([]);
    const [rowselected, setrowselected] = useState(null);

    const columns = React.useMemo(
        () => [
            {
                Header: "",
                accessor: "id_vehicle",
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Tooltip title="Editar">
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
                            </Tooltip>
                            <Tooltip title="Eliminar">
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
                            </Tooltip>
                        </div>
                    )
                }
            },
            {
                Header: "NOMBRE",
                accessor: "first_name"
            },
            {
                Header: "APELLIDO",
                accessor: "last_name"
            },
            {
                Header: "TIPO DOC",
                accessor: "doc_type"
            },
            {
                Header: "N° DOC",
                accessor: "doc_number"
            },
            {
                Header: "CORREO",
                accessor: "user_email"
            },
            {
                Header: "USUARIO",
                accessor: "username"
            },
            {
                Header: "LICENCIA",
                accessor: "license"
            },
            {
                Header: "LINCECIA EXPIRACIon",
                accessor: "license_expire_date"
            },
            {
                Header: "PLACA",
                accessor: "plate_number"
            },
            {
                Header: "SOAT",
                accessor: "soat"
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

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, DATASEL)
        setdatatable(validateResArray(res, true));
        setloadingglobal(false);

        const db = getDatabase();

        onValue(ref(db, '/locations/'), (snapshot) => {
            console.log(snapshot.val())
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
                    type: "",
                    id_new_user: row ? row.id_user : 0,
                    status: 'ELIMINADO',
                    new_username: row.username,
                    phone: '999999999',
                    password: ''
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
                titlemodule='Conductores'
                data={datatable}
                fetchData={fetchData}
                register={!!appfound.insert}
                selectrow={selectrow}
            />
            <VehicleMain
                title="Conductor"
                method_ins={METHOD_INS}
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchDataUser={fetchData}
                rowselected={rowselected}
            />
        </Layout>
    );
}

export default Vehicle;