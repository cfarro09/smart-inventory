import React, { useState, useContext, useEffect, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import InputFormk from '../system/form/inputformik';
import UseSelectDomain from '../system/form/select-domain';
import { useFormik } from 'formik';
import TableZyx from '../system/form/table-simple';
import triggeraxios from '../../config/axiosv2';
import UserOrganization from './userorganization';
import * as Yup from 'yup';
import { getDomain, validateResArray } from '../../config/helper';
import SelectFunction from '../system/form/select-function';

const REQUESTROLES = {
    method: "SP_SEL_ROLE",
    data: { status: 'ACTIVO' }
}

const getREQUESTORGUSER = (id_user) => ({
    method: "SP_SEL_ORGUSER",
    data: {
        id_user,
        status: null
    }
})

import IconButton from '@material-ui/core/IconButton';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const UserModal = ({ title, openModal, setOpenModal, rowselected, fetchDataUser }) => {

    const { setOpenBackdrop, setOpenSnackBack, setModalQuestion } = useContext(popupsContext);

    //#region orguser
    const [openModalOrganization, setOpenModalOrganization] = useState(false);
    const [orgrowselected, setorgrowselected] = useState(null);
    const [dataorg, setdataorg] = useState([]);
    const [showtable, setshowtable] = useState(false);
    const [dataRoles, setDataRoles] = useState([]);
    const [domains, setdomains] = useState({ doc_type: [], status: [], type: [] });



    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPODOCUMENTO")).then(r => setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPOUSUARIO")).then(r => setdomains(p => ({ ...p, type: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, REQUESTROLES).then(r => setDataRoles(validateResArray(r, continuezyx))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])


    const columnsOrganization = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_orguser',
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <IconButton
                                aria-label="delete"
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
                            <IconButton
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
                        </div>
                    )
                }
            },
            {
                Header: 'ORGANIZACION',
                accessor: 'org_name'
            },
            {
                Header: 'CLIENTES',
                accessor: 'clients'
            },
            {
                Header: 'ORG X DEFECTO',
                accessor: 'bydefault'
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
        []
    );

    useEffect(() => {
        setdataorg([]);
        let continuezyx = true;
        (async () => {
            if (rowselected) {
                await triggeraxios('post', process.env.endpoints.selsimple, getREQUESTORGUSER(rowselected.id_user)).then(r => setdataorg(validateResArray(r, continuezyx).map(x => ({ ...x, bydefault: x.bydefault === 1 ? "SI" : "NO" }))));
            }
        })();
        return () => continuezyx = false;
    }, [openModal])

    const selectrow = React.useCallback((row) => {
        setOpenModalOrganization(true);
        setorgrowselected(row);
    }, [])
    //    #endregion

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            first_name: '',
            last_name: '',
            username: '',
            user_email: '',
            doc_type: '',
            doc_number: '',
            status: 'ACTIVO',
            password: '',
            id_role: 0,
        },
        validationSchema: Yup.object({
            first_name: Yup.string().required('El mensaje es obligatorio'),
            id_role: Yup.number().min(1),
            last_name: Yup.string().required('El mensaje es obligatorio'),
            username: Yup.string().required('El mensaje es obligatorio'),
            user_email: Yup.string().email('El user_email no es valido').required('El user_email es obligatorio'),
            doc_number: Yup.string().required('El mensaje es obligatorio'),
            doc_type: Yup.string().required('El mensaje es obligatorio'),
            confirmpassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match')
        }),
        onSubmit: async values => {
            if (!values.password && !rowselected) {
                setOpenSnackBack(true, { success: false, message: 'Debe ingresar una contraseña al usuario.' });
                return;
            }
            const thereisdefault = dataorg.some(x => x.bydefault === "SI");
            if (!thereisdefault) {
                setOpenSnackBack(true, { success: false, message: 'Debe establecer una organización por defecto.' });
                return;
            }
            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: "SP_INS_USER",
                    header: {
                        data: {
                            ...values,
                            type: 'NINGUNO',
                            id_user: rowselected ? rowselected.id_user : 0,
                            password: values.password ? values.password : "",
                        }
                    },
                    details: {
                        data: dataorg.filter(x => !!x.operation).map(x => ({
                                ...x,
                                id_role: 1,
                                id_orguser: x.id_orguser < 0 ? 0 : x.id_orguser,
                                bydefault: x.bydefault === "SI" ? 1 : 0,
                            }
                        ))
                    }
                }

                setOpenBackdrop(true);
                const res = await triggeraxios('post', process.env.endpoints.transaction, dattosend);
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

    const deleterow = (row) => {
        const callback = () => {
            setdataorg(prev => [...prev.map(o => o.id_organization === row.id_organization ? { ...row, status: 'ELIMINADO', deleted: true, bydefault: "NO", operation: (row.id_organization > 0) } : o)]);
            setModalQuestion({ visible: false })
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de eliminar el registro?`, callback })
    }

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
                    <DialogTitle id="alert-dialog-title">{title} - {rowselected ? "Editar" : "Registrar"}</DialogTitle>
                    <DialogContent>
                        <div className="row-zyx">

                            <InputFormk
                                name="first_name"
                                classname="col-3"
                                label="Nombre"
                                formik={formik}
                            />
                            <InputFormk
                                name="last_name"
                                classname="col-3"
                                label="Apellido"
                                formik={formik}
                            />
                            <InputFormk
                                name="username"
                                classname="col-3"
                                label="Usuario"
                                formik={formik}
                            />
                            <InputFormk
                                name="user_email"
                                classname="col-3"
                                label="Correo"
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">
                            <InputFormk
                                name="doc_number"
                                classname="col-3"
                                label="N° Doc"
                                formik={formik}
                            />

                            <UseSelectDomain
                                classname="col-3"
                                title="Tipo Doc"
                                domainname={domains.doc_type}
                                valueselected={formik.values.doc_type}
                                namefield="doc_type"
                                formik={formik}
                            />
                            <UseSelectDomain
                                classname="col-3"
                                title="Estado"
                                domainname={domains.status}
                                valueselected={formik.values.status}
                                namefield="status"
                                formik={formik}
                            />
                            <SelectFunction
                                title="Rol"
                                datatosend={dataRoles}
                                classname="col-3"
                                optionvalue="id_role"
                                optiondesc="description"
                                valueselected={formik.values.id_role}
                                namefield="id_role"
                                descfield="role_name"
                                formik={formik}
                            />
                        </div>

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
                        <TableZyx
                            columns={columnsOrganization}
                            titlemodule='Organizaciones'
                            data={React.useMemo(() => dataorg.filter(x => !x.deleted), [dataorg])}
                            register={true}
                            selectrow={selectrow}
                        />
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
            <UserOrganization
                openModal={openModalOrganization}
                setOpenModal={setOpenModalOrganization}
                setdataorg={setdataorg}
                rowselected={orgrowselected}
                selectedorgs={dataorg}
            />
        </>
    );
}

export default UserModal;