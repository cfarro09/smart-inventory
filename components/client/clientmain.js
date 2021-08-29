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

const ClientMain = ({ title, openModal, setOpenModal, rowselected, fetchDataUser, disabled = false, method_ins }) => {
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
            id_client: 0,
            first_name: '',
            last_name: '',
            doc_type: '',
            doc_number: '',
            address: '',
            phone: '',
            email: '',
            bill_type: '',
            bill_number: '',
            photo: '',
            status: 'ACTIVO',
        },
        validationSchema: Yup.object({
            first_name: Yup.string().required('Elnombre es obligatorio'),
            last_name: Yup.string().required('El apellido es obligatorio'),
            doc_number: Yup.string().required('El documento es obligatorio'),
            doc_type: Yup.string().required('El tipo documento es obligatorio'),
            email: Yup.string().email('El correo no es valido'),
            status: Yup.string().required('El estado es obligatorio')
        }),
        onSubmit: async values => {
            
            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: method_ins,
                    data: values
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
            setModalQuestion({ visible: true, question: `¿Está seguro de guardar el cliente?`, callback })
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
                                name="email"
                                classname="col-3"
                                label="Correo"
                                formik={formik}
                            />
                            <InputFormk
                                name="phone"
                                classname="col-3"
                                label="Teléfono"
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
                            <InputFormk
                                name="address"
                                classname="col-6"
                                label="Dirección"
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">
                            <InputFormk
                                name="bill_type"
                                classname="col-3"
                                label="Tipo facturación"
                                formik={formik}
                            />
                            <InputFormk
                                name="bill_number"
                                classname="col-3"
                                label="N° Facturación"
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

export default ClientMain;