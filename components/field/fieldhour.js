import React, { useEffect, useCallback, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputFormk from '../system/form/inputformik';
import Button from '@material-ui/core/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import triggeraxios from '../../config/axiosv2';
import { validateResArray, getDomain } from '../../config/helper';

import SelectDomain from '../system/form/select-domain';

const Organization = ({ openModal, setOpenModal, setDataFieldHour, rowselected }) => {
    useEffect(() => {
        if (openModal) {
            formik.resetForm();
        }
    }, [openModal])


    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            start_time: '00:00',
            end_time: '00:00',
            price: 0,
            status: 'ACTIVO',
            shift: 'DAY'
        },
        validationSchema: Yup.object({
            start_time: Yup.string().required('La hora de inicio es obligatorio'),
            end_time: Yup.string().required('La hora de fin es obligatorio'),
            price: Yup.string().required('El precio es obligatorio'),
        }),
        onSubmit: async values => {
            if (!rowselected) {
                setDataFieldHour(prev => [...prev, { ...values, id_time_field: prev.length * -1, operation: true }]);
            } else {
                setDataFieldHour(prev => [...prev.map(o => o.id_time_field === values.id_time_field ? { ...values, operation: true } : o)]);
            }
            setOpenModal(false);
        }
    });
    return (
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
                <DialogTitle id="alert-dialog-title">Dominio Valor</DialogTitle>
                <DialogContent>
                    <div className="row-zyx">
                        <InputFormk
                            name="start_time"
                            classname="col-6"
                            label="Hora inicio"
                            type="time"
                            formik={formik}
                        />
                        <InputFormk
                            name="end_time"
                            classname="col-6"
                            label="Hora Fin"
                            type="time"
                            formik={formik}
                        />
                    </div>
                    <div className="row-zyx">
                        <InputFormk
                            name="price"
                            classname="col-6"
                            label="Precio"
                            type="number"
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

export default Organization;