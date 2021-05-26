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

const DATASELPROVIDERS = {
    method: "SP_SEL_PROVIDERS",
    data: { status: 'ACTIVO' }
}

const VehicleMAin = ({ title, openModal, setOpenModal, rowselected, fetchDataUser, disabled = false, method_ins }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);
    const [domains, setdomains] = useState({ status: [] })
    const [dataProvider, setDataProvider] = useState([]);

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, DATASELPROVIDERS).then(r => setDataProvider(validateResArray(r, continuezyx))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            id_provider: '',
            brand: '',
            model: '',
            plate_number: '',
            driver_license: '',
            soat: '',
            status: 'ACTIVO'
        },
        validationSchema: Yup.object({
            id_provider: Yup.number().min(1),
            brand: Yup.string().required('La marca es obligatorio'),
            model: Yup.string().required('El modelo es obligatorio'),
            plate_number: Yup.string().required('La placa es obligatorio'),
            driver_license: Yup.string().required('La licencia es obligatorio'),
            soat: Yup.string().required('El SOAT es obligatorio'),
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
                        id_vehicle: rowselected ? rowselected.id_vehicle : 0,
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
            setModalQuestion({ visible: true, question: `¿Está seguro de guardar el vehiculo?`, callback })
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
                            <SelectFunction
                                title="Proveedor"
                                datatosend={dataProvider}
                                classname="col-3"
                                optionvalue="id_provider"
                                optiondesc="name"
                                valueselected={formik.values.id_provider}
                                namefield="id_provider"
                                descfield="name"
                                formik={formik}
                            />
                            <InputFormk
                                name="brand"
                                classname="col-3"
                                label="Marca"
                                formik={formik}
                            />
                            <InputFormk
                                name="model"
                                classname="col-3"
                                label="Modelo"
                                formik={formik}
                            />
                            <InputFormk
                                name="plate_number"
                                classname="col-3"
                                label="Placa"
                                formik={formik}
                            />
                        </div>

                        <div className="row-zyx">
                            <InputFormk
                                name="driver_license"
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

export default VehicleMAin;