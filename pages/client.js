import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { validateResArray } from '../config/helper';
import IconButton from '@material-ui/core/IconButton';
import authContext from '../context/auth/authContext';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import InputFormk from '../components/system/form/inputformik';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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

const UserModal = ({ title, openModal, setOpenModal, rowselected, fetchDataUser }) => {

    const { setOpenBackdrop, setOpenSnackBack, setModalQuestion } = useContext(popupsContext);


    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            first_name: '',
            last_name: '',
            password: '',
        },
        validationSchema: Yup.object({
            confirmpassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match')
        }),
        onSubmit: async values => {
            if (!values.password && !rowselected) {
                setOpenSnackBack(true, { success: false, message: 'Debe ingresar una contraseña al usuario.' });
                return;
            }
            // const thereisdefault = dataorg.some(x => x.bydefault === "SI");
            // if (!thereisdefault) {
            //     setOpenSnackBack(true, { success: false, message: 'Debe establecer una organización por defecto.' });
            //     return;
            // }
            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: "SP_INS_CLIENT",
                    data: {
                        id_user: rowselected?.id_user,
                        username: rowselected?.username || '',
                        first_name: rowselected?.first_name || '',
                        last_name: rowselected?.last_name || '',
                        doc_type: rowselected?.doc_type || '',
                        doc_number: rowselected?.doc_number || '',
                        user_email: rowselected?.user_email || '',
                        phone: rowselected?.phone || '',
                        status: rowselected?.status || '',
                        type: rowselected?.type || 'CLIENTE',
                        password: values.password ? values.password : "",
                        createdby: 'admin'
                    }
                }

                setOpenBackdrop(true);
                const res = await triggeraxios('post', process.env.endpoints.selsimple, dattosend);
                if (res.success) {
                    fetchDataUser({});
                    setOpenModal(false);

                    setOpenSnackBack(true, { success: true, message: 'Transacción ejecutada satisfactoriamente.' });
                } else {
                    setOpenSnackBack(true, { success: false, message: res.msg });
                }

                setOpenBackdrop(false);
            }

            setModalQuestion({ visible: true, question: `¿Está seguro de guardar el usuario?`, callback })
        }
    });

    const handleClick = () => setOpenModal(false);

    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='md'
                onClose={handleClick}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <form
                    noValidate
                    onSubmit={formik.handleSubmit}
                >
                    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                    <DialogContent>
                        <div className="row-zyx">
                            <InputFormk
                                classname="col-6"
                                name="password"
                                label="Contraseña"
                                type="password"
                                formik={formik}
                            />
                            <InputFormk
                                classname="col-6"
                                name="confirmpassword"
                                label="Confirmar Contraseña"
                                type="password"
                                formik={formik}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="submit"
                            color="primary"
                        >
                            GUARDAR
                        </Button>
                        <Button
                            type="button"
                            color="secondary"
                            style={{ marginLeft: '1rem' }}
                            onClick={() => setOpenModal(false)}
                        >
                            Cerrar
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
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
                        </div>
                    )
                }
            },
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

    const selectrow = (row) => {
        setOpenModal(true);
        setrowselected(row);
    }

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, selproperty)

        setdatatable(validateResArray(res, true));

        setloadingglobal(false)
    }, []);

    return (
        <Layout>
            <TableZyx
                columns={columns}
                titlemodule='Clientes'
                data={datatable}
                fetchData={fetchData}
                register={false}
            />
            <UserModal 
                title="Cambiar contraseña"
                openModal={openModal}
                setOpenModal={setOpenModal}
                rowselected={rowselected}
                fetchDataUser={fetchData}
            />
        </Layout>
    );
}

export default Client;