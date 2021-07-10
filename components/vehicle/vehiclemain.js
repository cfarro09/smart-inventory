import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import triggeraxios from '../../config/axiosv2';
import InputFormk from '../system/form/inputformik';
import SelectFunction from '../system/form/select-function';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import UseSelectDomain from '../system/form/select-domain';

import { validateResArray, getDomain } from '../../config/helper';

const VehicleMAin = ({ title, openModal, setOpenModal, rowselected, fetchDataUser, disabled = false, method_ins }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);
    const [domains, setdomains] = useState({ status: [] })

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPODOCUMENTO")).then(r => setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            first_name: '',
            last_name: '',
            username: '',
            user_email: '',
            doc_type: '',
            doc_number: '',
            password: '',

            plate_number: '',
            license: '',
            license_expire_date: '',
            soat: '',
            status: 'ACTIVO'
        },
        validationSchema: Yup.object({
            first_name: Yup.string().required('Elnombre es obligatorio'),
            last_name: Yup.string().required('El apellido es obligatorio'),
            username: Yup.string().required('El usuario es obligatorio'),
            user_email: Yup.string().email('El user_email no es valido').required('El user_email es obligatorio'),
            doc_number: Yup.string().required('El documento es obligatorio'),
            doc_type: Yup.string().required('El tipo documento es obligatorio'),
            confirmpassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
            
            plate_number: Yup.string().required('La placa es obligatorio'),
            license: Yup.string().required('La licencia es obligatorio'),
            license_expire_date: Yup.string().required('La licencia es obligatorio'),
            soat: Yup.string().required('El SOAT es obligatorio'),
            status: Yup.string().required('El estado es obligatorio')
        }),
        onSubmit: async values => {
            if (!values.password && !rowselected) {
                setOpenSnackBack(true, { success: false, message: 'Debe ingresar una contraseña al usuario.' });
                return;
            }

            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: method_ins,
                    data: {
                        ...values,
                        type: '',
                        id_new_user: rowselected ? rowselected.id_user : 0,
                        new_username: values.username,
                        phone: '999999999',
                        type: "DRIVER",
                        password: values.password ? values.password : "",
                    }
                }

                setOpenBackdrop(true);
                const res = await triggeraxios('post', process.env.endpoints.selsimple, dattosend);
                if (res.success) {
                    fetchDataUser({});
                    setOpenModal(false);
                    setOpenSnackBack(true, { success: true, message: 'Se registró correctamente!.' });
                } else
                    setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });

                setOpenBackdrop(false);
            }
            setModalQuestion({ visible: true, question: `¿Está seguro de guardar el conductor?`, callback })
        }
    });
    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='md'
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
                        </div>

                        
                        <div className="row-zyx">
                            <InputFormk
                                name="plate_number"
                                classname="col-3"
                                label="Placa"
                                formik={formik}
                            />
                            <InputFormk
                                name="license_expire_date"
                                classname="col-3"
                                label="Expiración licencia"
                                type="date"
                                formik={formik}
                            />
                              <InputFormk
                                name="license"
                                classname="col-3"
                                label="Licencia"
                                formik={formik}
                            />
                            <InputFormk
                                name="soat"
                                classname="col-3"
                                label="SOAT"
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

export default VehicleMAin;