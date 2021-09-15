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
import MultiSelectFunction from '../system/form/multiselect';

const REQUESTROLES = {
    method: "fn_sel_role",
    data: { status: 'ACTIVO' }
}

const SELCAMPUS = {
    method: "fn_sel_campus",
    data: { status: 'ACTIVO' }
}

const UserModal = ({ title, openModal, setOpenModal, rowselected, fetchDataUser }) => {

    const { setOpenBackdrop, setOpenSnackBack, setModalQuestion } = useContext(popupsContext);
    const [showtable, setshowtable] = useState(false);
    const [dataRoles, setDataRoles] = useState([]);
    const [domains, setdomains] = useState({ doc_type: [], status: [], type: [] });
    const [campus, setcampus] = useState([]);

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPODOCUMENTO")).then(r => setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, SELCAMPUS).then(r => setcampus(validateResArray(r, continuezyx))),
                triggeraxios('post', process.env.endpoints.selsimple, REQUESTROLES).then(r => setDataRoles(validateResArray(r, continuezyx))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])


    //    #endregion

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            id_user: 0,
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            doc_type: '',
            doc_number: '',
            status: 'ACTIVO',
            password: '',
            id_role: 0,
            id_campus: 0,
            campus_assigned: ''
        },
        validationSchema: Yup.object({
            first_name: Yup.string().required('El nombre es obligatorio'),
            id_role: Yup.number().min(1, 'El rol es obligatorio'),
            id_campus: Yup.number().min(1, 'El campo es obligatorio'),
            last_name: Yup.string().required('El apellido es obligatorio'),
            username: Yup.string().required('El usuario es obligatorio'),
            email: Yup.string().email('El correo no es valido').required('El correo es obligatorio'),
            doc_number: Yup.string().required('El n° documento es obligatorio'),
            doc_type: Yup.string().required('El tipo de documento es obligatorio'),
            campus_assigned: Yup.string().required('Debe registrar al menos una sede'),
            confirmpassword: Yup.string().oneOf([Yup.ref('password'), null], 'Las contraseñas deben ser iguales')
        }),
        onSubmit: async values => {
            if (!values.password && !rowselected) {
                setOpenSnackBack(true, { success: false, message: 'Debe ingresar una contraseña al usuario.' });
                return;
            }
            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: "fn_ins_user",
                    data: {
                        ...values,
                        user: values.username,
                        phone: '999999999',
                        password: values.password ? values.password : "",
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
                                disabled={!!rowselected}
                            />
                            <InputFormk
                                name="email"
                                classname="col-3"
                                label="Correo"
                                formik={formik}
                            />

                        </div>
                        <div className="row-zyx">
                            <SelectFunction
                                title="Sede por defecto"
                                datatosend={campus}
                                classname="col-6"
                                formik={formik}
                                valueselected={formik.values.id_campus}
                                optionvalue="id_campus"
                                optiondesc="description"
                                namefield="id_campus"
                            />
                            <MultiSelectFunction
                                title="Sedes asignadas"
                                datatosend={campus}
                                classname="col-6"
                                optionvalue="id_campus"
                                optiondesc="description"
                                namefield="campus_assigned"
                                valueselected={formik.values.campus_assigned}
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">
                            <UseSelectDomain
                                classname="col-3"
                                title="Tipo Doc"
                                domainname={domains.doc_type}
                                valueselected={formik.values.doc_type}
                                namefield="doc_type"
                                formik={formik}
                            />
                            <InputFormk
                                name="doc_number"
                                classname="col-3"
                                label="N° Doc"
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

export default UserModal;