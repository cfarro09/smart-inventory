import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import PropertyModal from '../components/property/propertymain';
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
    method: "SP_SEL_PROPERTIES",
    data: {
        name: null,
        status: 'ACTIVO'
    }
}

const Property = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const { appselected: appfound } = useContext(authContext);
    const [openModal, setOpenModal] = useState(false);
    const [datatable, setdatatable] = useState([]);
    const [rowselected, setrowselected] = useState(null);

    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_property',
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
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
                        </div>
                    )
                }
            },
            {
                Header: 'Propiedad',
                accessor: 'name',
                type: 'string',
            },
            {
                Header: 'Valor',
                accessor: 'value',
                type: 'string',
            }
        ],
        [appfound]
    );

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, selproperty)

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
                titlemodule='Propiedades'
                data={datatable}
                fetchData={fetchData}
                register={!!appfound.insert}
                selectrow={selectrow}
            />
            <PropertyModal
                title="Propiedad"
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchData={fetchData}
                rowselected={rowselected}
            />
        </Layout>
    );
}

export default Property;