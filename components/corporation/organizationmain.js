import React, { useEffect, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputFormk from '../system/form/inputformik';
import Button from '@material-ui/core/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SelectDomain from '../system/form/select-domain';
import triggeraxios from '../../config/axiosv2';
import { validateres, getDomain } from '../../config/helper';

const StoreMain = ({ openModal, setOpenModal, setData, rowselected }) => {

    const [domains, setdomains] = useState({ status: [] })

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', '/api/web/main/', getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateres(r, continuezyx) }))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        if (openModal) {
            formik.resetForm();
        }
    }, [openModal])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            name: '',
            description: '',
            address: '',
            status: 'ACTIVO'
        },
        validationSchema: Yup.object({
            name: Yup.string().required('El name es obligatorio'),
            description: Yup.string().required('El name es obligatorio'),
            address: Yup.string().required('La dirección es obligatorio'),
            status: Yup.string().required('La dirección es obligatorio'),
        }),

        onSubmit: async values => {
            setData(values, rowselected)
            setOpenModal(false);
        }
    });
    return (
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
                <DialogTitle id="alert-dialog-title">Organización</DialogTitle>
                <DialogContent>
                    <div className="row-zyx">
                    <InputFormk
                            name="name"
                            classname="col-6"
                            label="Organización"
                            formik={formik}
                        />
                        <InputFormk
                            name="description"
                            classname="col-3"
                            label="Descripción"
                            formik={formik}
                        />
                        
                        <SelectDomain
                            classname="col-3"
                            title="Estado"
                            domainname={domains.status}
                            valueselected={formik.values.status}
                            namefield="status"
                            formik={formik}
                        />
                        <InputFormk
                            name="address"
                            classname="col-6"
                            label="Dirección"
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
    );
}

export default StoreMain;