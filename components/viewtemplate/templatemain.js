import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import InputFormk from '../system/form/inputformik';
import SelectFunction from '../system/form/select-function';
import { useFormik } from 'formik';
import authContext from '../../context/auth/authContext';
import triggeraxios from '../../config/axiosv2';
import ColumnSelect from '../viewtemplate/columnselect';
import SelectDomain from '../system/form/select-domain';
import * as Yup from 'yup';

import { getDomain, validateResArray } from '../../config/helper';

const columnsinit = [
    {
        columnbd: "product_code",
        columnbddesc: "CODIGO",
        obligatory: true,
        obligatorycolumn: true,
        selected: true,
    },
    {
        columnbd: "product_quantity",
        columnbddesc: "CANTIDAD",
        obligatory: true,
        obligatorycolumn: true,
        selected: true,
        type: 'int'
    },
    {
        columnbd: "product_description",
        columnbddesc: "DESCRIPCION",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_alt_code1",
        columnbddesc: "COD ALTERNO 1",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_alt_code2",
        columnbddesc: "COD ALTERNO 2",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_serie",
        columnbddesc: "SERIE",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_lots",
        columnbddesc: "LOTE",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_exp_date",
        columnbddesc: "FECHA DE EXPIRACION",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'date'
    },
    {
        columnbd: "product_line",
        columnbddesc: "LINEA",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_color",
        columnbddesc: "COLOR",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_size",
        columnbddesc: "TAMAÑO",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_package_number",
        columnbddesc: "N° CAJA",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_unitp_box",
        columnbddesc: "UNIDAD/CAJA",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_cmtr_pbox",
        columnbddesc: "product_cmtr_pbox",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "product_cmtr_quantity",
        columnbddesc: "product_cmtr_quantity",
        obligatory: false,
        obligatorycolumn: false,
        selected: false
    },
    {
        columnbd: "quarantine",
        columnbddesc: "EN CUARENTENA",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "shrinkage",
        columnbddesc: "EN MERMA",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "scrap",
        columnbddesc: "SCRAP",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "demo",
        columnbddesc: "DEMO",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },

    {
        columnbd: "hallway",
        columnbddesc: "PASILLO",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "column",
        columnbddesc: "COLUMNA",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "level",
        columnbddesc: "NIVEL",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "batch",
        columnbddesc: "LOTE",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "document_type",
        columnbddesc: "TIPO DOC",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "document_number",
        columnbddesc: "N° DOC",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "entry_date",
        columnbddesc: "FECHA DE INGRESO",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "observation",
        columnbddesc: "OBSERVACION",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
    {
        columnbd: "owner",
        columnbddesc: "RESPONSABLE",
        obligatory: false,
        obligatorycolumn: false,
        selected: false,
        type: 'int'
    },
]

const requestclient = {
    method: "SP_SEL_CLIENT",
    data: { status: 'ACTIVO' }
}

const TemplateModal = ({ title, openModal, setOpenModal, rowselected, fetchDataUser }) => {
    const theme = useTheme();
    const { setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [selectedcolumns, setselectedcolumns] = useState([]);
    const [dataClient, setDataClient] = useState([]);
    const [optionscolumn, setoptionscolumn] = useState([]);
    const [domains, setdomains] = useState({ type: [], status: [] });


    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            name: '',
            description: '',
            type: '',
            status: 'ACTIVO',
            id_client: 0
        },
        validationSchema: Yup.object({
            name: Yup.string().required('El nombre del cliente es obligatorio'),
            description: Yup.string().required('La descripción es obligatorio'),
            type: Yup.string().required('El tipo de documento es obligatorio'),
            status: Yup.string().required('El estado es obligatorio'),
            // id_client: Yup.string().required('El estado es obligatorio'),
        }),
        onSubmit: async values => {
            const allcompleted = selectedcolumns.some(x => !x.keyexcel);

            if (allcompleted) {
                setOpenSnackBack(true, { success: false, message: 'Debe completar todos los titulos del excel.' });
                return;
            }
            const datatosend = {
                method: "SP_INS_LOAD_TEMPLATE",
                data: {
                    ...values,
                    id_load_template: rowselected ? rowselected.id_load_template : 0,
                    json_detail: JSON.stringify(selectedcolumns)
                }
            }
            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend);
            if (res.success) {
                fetchDataUser({});
                setOpenModal(false);

                setOpenSnackBack(true, { success: true, message: 'Transacción ejecutada satisfactoriamente.' });
            } else {
                setOpenSnackBack(true, { success: false, message: !res.msg ? 'Hubo un error, vuelva a intentarlo' : res.msg });
            }
            setOpenBackdrop(false)
        }
    });

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPOPLANTILLA")).then(r => setdomains(p => ({ ...p, type: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, requestclient).then(r => setDataClient(p => (validateResArray(r, continuezyx))))
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        if (openModal) {
            formik.resetForm();
            if (rowselected) {
                try {
                    const dateedited = JSON.parse(rowselected.json_detail);
                    setselectedcolumns(dateedited);
                    setoptionscolumn(columnsinit.filter(r => !dateedited.map(x => x.columnbd).includes(r.columnbd)
                    ));
                } catch (error) {
                    console.log(rowselected);
                    setselectedcolumns(columnsinit.filter(r => r.obligatorycolumn === true));
                    setoptionscolumn(columnsinit);
                }
            } else {
                setselectedcolumns(columnsinit.filter(r => r.obligatorycolumn === true));
                setoptionscolumn(columnsinit);
            }
        }
    }, [openModal]);

    const handlerselectcolumn = useCallback(({ newValue }) => {
        if (newValue) {
            setselectedcolumns(p => [...p, newValue]);
            setoptionscolumn(p => p.map(x => {
                return {
                    ...x,
                    selected: x.columnbd === newValue.columnbd ? true : x.selected
                }
            }));
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
                                label="Plantilla"
                                formik={formik}
                            />
                            <InputFormk
                                name="description"
                                classname="col-3"
                                label="Descripcion"
                                formik={formik}
                            />
                            <SelectDomain
                                classname="col-3"
                                title="Tipo"
                                domainname={domains.type}
                                valueselected={formik.values.type}
                                namefield="type"
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
                        <div className="row-zyx">
                            <SelectFunction
                                title="Cliente"
                                datatosend={dataClient}
                                classname="col-3"
                                optionvalue="id_client"
                                optiondesc="company_name"
                                valueselected={formik.values.id_client}
                                namefield="id_client"
                                descfield="company_name"
                                formik={formik}
                            />
                        </div>
                        <div className="row-zyx">
                            <SelectFunction
                                title="Columnas Opcionales"
                                datatosend={optionscolumn.filter(r => !r.selected)}
                                optionvalue="columnbd"
                                optiondesc="columnbddesc"
                                callback={handlerselectcolumn}
                            />
                        </div>
                        <div style={{ maxWidth: '80%', marginLeft: 'auto', marginRight: 'auto', marginTop: theme.spacing(1) }}>
                            <div className="row-zyx" style={{ marginBottom: theme.spacing(1) }}>
                                <div className="col-3" style={{ fontWeight: 'bold' }}>
                                    COLUMNA BD
                                </div>
                                <div className="col-3" style={{ fontWeight: 'bold' }}>
                                    COLUMNA EXCEL
                                </div>
                                <div className="col-3" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                    OBLIGATORIO
                                </div>
                                <div className="col-3 text-center" style={{ fontWeight: 'bold' }}>
                                    ACCIONES
                                </div>
                            </div>
                            <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                                {selectedcolumns.map(r => (
                                    <ColumnSelect
                                        key={r.columnbd}
                                        r={r}
                                        setselectedcolumns={setselectedcolumns}
                                        setoptionscolumn={setoptionscolumn}
                                    />
                                ))}
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
        </>
    );
}

export default TemplateModal;