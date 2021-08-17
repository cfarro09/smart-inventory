import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { validateResArray } from '../config/helper';
import IconButton from '@material-ui/core/IconButton';
import authContext from '../context/auth/authContext';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const selproperty = {
    method: "SP_SEL_CLIENT",
    data: {
        name: null,
        status: 'ACTIVO'
    }
}

const Client = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    const [openModal, setOpenModal] = useState(false);
    const [datatable, setdatatable] = useState([]);
    const [rowselected, setrowselected] = useState(null);

    const columns = React.useMemo(
        () => [
           
            {
                Header: 'Nombre',
                accessor: 'first_name',
                type: 'string',
            },
            {
                Header: 'Apellido',
                accessor: 'last_name',
                type: 'string',
            },
            {
                Header: 'Usuario',
                accessor: 'username',
                type: 'string',
            },
            {
                Header: 'N° Ordenes',
                accessor: 'n_orders',
                type: 'string',
            },
            {
                Header: 'Fecha creación',
                accessor: 'date_created',
                type: 'string',
            },
        ],
        [appfound]
    );

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, selproperty)

        setdatatable(validateResArray(res, true));

        setloadingglobal(false)
    }, []);


    const deleterow = (row) => {
        const callback = async () => {
            setModalQuestion({ visible: false });
            const datatosend = {
                method: "SP_INS_PROPERTIES",
                data: {
                    ...row,
                    status: 'ELIMINADO'
                }
            }

            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend);
            if (res.success) {
                setOpenSnackBack(true, { success: true, message: 'La propiedad se eliminó satisfactoriamente.' });
                fetchData();
            } else 
                setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });

            setOpenBackdrop(false)
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de eliminar la propiedad ${row.name}?`, callback })
    }

    return (
        <Layout>
            <TableZyx
                columns={columns}
                titlemodule='Clientes'
                data={datatable}
                fetchData={fetchData}
                register={false}
            />
        </Layout>
    );
}

export default Client;