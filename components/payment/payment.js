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
    const [valuefile, setvaluefile] = useState('')
    const [imageurl, setimageurl] = useState("")

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPOPAGO")).then(r => setpaymenttype(validateResArray(r, continuezyx)))
        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        if (openModal) {
            setimageurl("")
            formik.resetForm();
        }
    }, [openModal]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id_booking: booking.id_booking,
            paymenttype: '',
            reference: '',
            amount: booking?.pending_amount || 0,
        },
        validationSchema: Yup.object({
            paymenttype: Yup.string().required('El tipo de pago es obligatorio'),
            amount: Yup.number().min(1, "El monto debe ser mayor que 1").required('El monto es obligatorio')
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
                        evidence: imageurl || ""
                    }
                }

                setOpenBackdrop(true);
                const res = await triggeraxios('post', process.env.endpoints.selsimple, dattosend);
                if (res.success) {
                    fetchData && fetchData();
                    setOpenModal(false);
                    setOpenSnackBack(true, { success: true, message: 'Se registró correctamente!.' });

                    const res = await triggeraxios('get', `/api/export/invoice/${booking.id_booking}`);

                    window.open(res.result.data.url, '_blank');
                } else {
                    setOpenSnackBack(true, { success: false, message: res.msg || 'Hubo un error, vuelva a intentarlo' });
                }

                setOpenBackdrop(false);
            }
            setModalQuestion({ visible: true, question: `¿Está seguro de registrar el pago?`, callback })
        }
    });

    const handleChange = async (files) => {
        const imagefile = files[0];

        setOpenBackdrop(true);
        const formData = new FormData();
        formData.append("imagen", imagefile);
        formData.append("name", imagefile.name);

        const res = await triggeraxios('post', '/api/main/imageupload', formData);

        if (res.success && res.result.success) {
            setOpenSnackBack(true, { success: true, message: 'Imagen guardada satisfactoriamente.' });
            setimageurl(res.result.url)
        } else {
            setOpenSnackBack(true, { success: true, message: 'Hubo un error, vuelva a intentarlo mas tarde.' });
            setimageurl("https://staticfileszyxme.s3.us-east.cloud-object-storage.appdomain.cloud/logoqapla.png")
        }

        setOpenBackdrop(false);

        setvaluefile('');
    }

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
                        <UseSelectDomain
                            classname="col-6"
                            title="Tipo pago"
                            domainname={paymenttype}
                            valueselected={formik.values.paymenttype}
                            namefield="paymenttype"
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
                        <InputFormk
                            name="reference"
                            classname="col-6"
                            label="Referencia"
                            formik={formik}
                        />
                        <div className='col-6'>
                            <div>
                                <input
                                    accept="image/*"
                                    id={`inputfile-x`}
                                    type="file"
                                    value={valuefile}
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleChange(e.target.files)}
                                />
                                <label htmlFor={`inputfile-x`}>
                                    <Button
                                        component="span"
                                        color="primary"
                                        variant="outlined"
                                        onClick={() => null}
                                    >
                                        Subir evidencia
                                    </Button>
                                </label>
                            </div>
                            {imageurl && (
                                <div style={{ border: '1px solid #e1e1e1', marginTop: 10 }}>
                                    <img style={{objectFit: 'contain'}} width={"100%"} height="200" src={imageurl} />
                                </div>
                            )}
                        </div>
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