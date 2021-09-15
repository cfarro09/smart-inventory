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

const CampusMain = ({ title, openModal, setOpenModal, rowselected, fetchDataUser, disabled = false, method_ins }) => {
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
            id_campus: 0,
            description: '',
            status: 'ACTIVO',
        },
        validationSchema: Yup.object({
            description: Yup.string().required('La descripción es obligatorio'),
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
            setModalQuestion({ visible: true, question: `¿Está seguro de guardar la sede?`, callback })
        }
    });

    useEffect(() => {
        if (openModal) {
            formik.resetForm();
        }
    }, [openModal])
    
    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='sm'
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
                                name="description"
                                classname="col-6"
                                label="Nombre sede"
                                formik={formik}
                            />
                            <UseSelectDomain
                                classname="col-6"
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

export default CampusMain;