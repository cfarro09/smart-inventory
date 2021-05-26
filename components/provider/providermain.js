import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import triggeraxios from '../../config/axiosv2';
import InputFormk from '../system/form/inputformik';
import SelectDomain from '../system/form/select-domain';
import SelectFunction from '../system/form/select-function';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { validateResArray, getDomain } from '../../config/helper';


const ProviderMain = ({ title, openModal, setOpenModal, rowselected, fetchDataUser, disabled = false, method_ins }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);
    const [domains, setdomains] = useState({ status: [] })

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            address: '',
            name: '',
            responsible_email: '',
            responsible_name: '',
            responsible_phone: '',
            ruc: '',
            status: 'ACTIVO'
        },
        validationSchema: Yup.object({
            address: Yup.string().required('La dirección es obligatorio'),
            name: Yup.string().required('El nombre es obligatorio'),
            responsible_email: Yup.string().required('El correo del responsable es obligatorio').required('El user_email es obligatorio'),
            responsible_name: Yup.string().required('El nombre del responsable es obligatorio'),
            responsible_phone: Yup.string().required('El telefono del responsable es obligatorio'),
            ruc: Yup.string().required('El ruc es obligatorio'),
            status: Yup.string().required('El estado es obligatorio')
        }),
        onSubmit: async values => {
            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: method_ins,
                    data: {
                        ...values,
                        type: '',
                        id_provider: rowselected ? rowselected.id_provider : 0,
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

            setModalQuestion({ visible: true, question: `¿Está seguro de guardar el proveedor?`, callback })
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
                                name="name"
                                classname="col-3"
                                label="Proveedor"
                                formik={formik}
                            />
                            <InputFormk
                                name="responsible_name"
                                classname="col-3"
                                label="Resp. Nombre"
                                formik={formik}
                            />
                            <InputFormk
                                name="responsible_email"
                                classname="col-3"
                                label="Resp. Email"
                                formik={formik}
                            />
                            <InputFormk
                                name="responsible_phone"
                                classname="col-3"
                                label="Resp. Telefono"
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">
                            <InputFormk
                                name="description"
                                classname="col-3"
                                label="Descripción"
                                formik={formik}
                            />
                            <InputFormk
                                name="address"
                                classname="col-6"
                                label="Dirección"
                                formik={formik}
                            />
                            <InputFormk
                                name="ruc"
                                classname="col-3"
                                label="Ruc"
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">


                            <SelectDomain
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

export default ProviderMain;