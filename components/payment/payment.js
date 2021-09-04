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

const Payment = ({ openModal, setOpenModal, booking, fetchData }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);
    const [paymenttype, setpaymenttype] = useState([])

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPOPAGO")).then(r => setpaymenttype(validateResArray(r, continuezyx)))
        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        if (openModal) {
            formik.resetForm();
        }
    }, [openModal]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id_booking: booking.id_booking,
            paymenttype: '',
            reference: '',
            amount: 0,
        },
        validationSchema: Yup.object({
            paymenttype: Yup.string().required('El tipo de pago es obligatorio'),
            amount: Yup.string().required('El monto es obligatorio')
        }),
        onSubmit: async values => {

            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: "fn_ins_payment",
                    data: {
                        id_payment: 0,
                        id_booking: booking.id_booking,
                        description: '',
                        payment_type: values.paymenttype,
                        reference: values.reference,
                        amount: values.amount,
                        status: 'status',
                    }
                }

                setOpenBackdrop(true);
                const res = await triggeraxios('post', process.env.endpoints.selsimple, dattosend);
                if (res.success) {
                    fetchData && fetchData();
                    setOpenModal(false);
                    setOpenSnackBack(true, { success: true, message: 'Se registró correctamente!.' });
                } else
                    setOpenSnackBack(true, { success: false, message: res.msg || 'Hubo un error, vuelva a intentarlo' });

                setOpenBackdrop(false);
            }
            setModalQuestion({ visible: true, question: `¿Está seguro de registrar el pago?`, callback })
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
                <DialogTitle id="alert-dialog-title">Pagar reserva {booking.client_name && "de " + booking.client_name}</DialogTitle>
                <DialogContent>
                    <div className="row-zyx">
                        <InputFormk
                            name="reference"
                            classname="col-6"
                            label="Referencia"
                            formik={formik}
                        />
                        <InputFormk
                            name="amount"
                            classname="col-6"
                            label="Monto a pagar"
                            type="number"
                            formik={formik}
                        />
                    </div>
                    <div className="row-zyx">
                        <UseSelectDomain
                            classname="col-6"
                            title="Tipo pago"
                            domainname={paymenttype}
                            valueselected={formik.values.paymenttype}
                            namefield="paymenttype"
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

export default Payment;