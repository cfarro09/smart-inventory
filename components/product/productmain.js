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


const ProductMain = ({ title, openModal, setOpenModal, rowselected, fetchDataUser, disabled = false, method_ins }) => {
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
            company_name: '',
            doc_type: '',
            doc_number: '',
            buyer_email: '',
            type: '',
            status: 'ACTIVO'
        },
        onSubmit: async values => {
            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: method_ins,
                    data: {
                        ...values,
                        product_quantity: 0,
                        product_shrinkage_total: 0,
                        product_quarantine_total: 0,
                        product_available_total: 0,
                        id_product: rowselected ? rowselected.id_product : 0,
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

            setModalQuestion({ visible: true, question: `¿Está seguro de guardar el producto?`, callback })
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
                                name="product_code"
                                classname="col-3"
                                label="Codigo"
                                disabled={true}
                                formik={formik}
                            />
                            <InputFormk
                                name="product_alt_code1"
                                classname="col-3"
                                label="Codigo alt 1"
                                formik={formik}
                            />
                            <InputFormk
                                name="product_alt_code2"
                                classname="col-3"
                                label="Codigo alt 2"
                                formik={formik}
                            />
                            <InputFormk
                                name="product_description"
                                classname="col-3"
                                label="Descripción"
                                formik={formik}
                            />

                        </div>
                        <div className="row-zyx">
                            <InputFormk
                                name="product_serie"
                                classname="col-3"
                                label="Sirie"
                                formik={formik}
                            />
                            <InputFormk
                                name="product_lots"
                                classname="col-3"
                                label="Lote"
                                formik={formik}
                            />
                            <InputFormk
                                name="product_exp_date"
                                classname="col-3"
                                label="Fecha de expiración"
                                formik={formik}
                                type="date"
                            />
                            <InputFormk
                                name="product_color"
                                classname="col-3"
                                label="Color"
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">

                            
                            <InputFormk
                                name="product_size"
                                classname="col-3"
                                label="Tamaño"
                                formik={formik}
                            />
                            <InputFormk
                                name="product_package_number"
                                classname="col-3"
                                label="N° Caja"
                                type="number"
                                formik={formik}
                            />
                            <InputFormk
                                name="product_unitp_box"
                                classname="col-3"
                                label="Unidad/Caja"
                                type="number"
                                formik={formik}
                            />
                            <InputFormk
                                name="product_cmtr_pbox"
                                classname="col-3"
                                label="Centimetro cubico/caja"
                                type="number"
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">
                            
                            <InputFormk
                                name="product_cmtr_quantity"
                                classname="col-3"
                                type="number"
                                label="Centimetro cubico cantidad"
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

export default ProductMain;