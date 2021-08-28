import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import InputFormk from '../system/form/inputformik';
import { useFormik } from 'formik';
import TableZyx from '../system/form/table-simple';
import triggeraxios from '../../config/axiosv2';
import FieldHour from './fieldhour';
import * as Yup from 'yup';
import { validateResArray, getDomain } from '../../config/helper';
import SelectFunction from '../system/form/select-function';
import IconButton from '@material-ui/core/IconButton';
import UseSelectDomain from '../system/form/select-domain';

import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const SET_CAMPUS = {
    method: "fn_sel_campus",
    data: { status: 'ACTIVO' }
}

const DomainModal = ({ title, openModal, setOpenModal, rowselected, fetchDataUser }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack, disabled = false } = useContext(popupsContext);
    const [domains, setdomains] = useState({ status: [] })

    const [openModalHour, setOpenModalHour] = useState(false);
    const [fieldHourSelected, setFieldHourSelected] = useState(null);
    const [dataFieldHour, setDataFieldHour] = useState([]);
    const [dataCampus, setDataCampus] = useState([])

    const columnsDomainValues = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_time_field',
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <IconButton
                                aria-label="delete"
                                size="small"
                                className="button-floating"
                                onClick={() => {
                                    selectrow(props.cell.row.original);
                                }}
                            >
                                <EditIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                            <IconButton
                                className="button-floating"
                                aria-label="delete"
                                size="small"
                                onClick={() => deleterow(props.cell.row.original)}
                            >
                                <DeleteIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                        </div>
                    )
                }
            },
            {
                Header: 'HORA INICIO',
                accessor: 'start_time'
            },
            {
                Header: 'HORA FIN',
                accessor: 'end_time'
            },
            {
                Header: 'PRECIO',
                accessor: 'price'
            },
            {
                Header: 'ESTADO',
                accessor: 'status'
            },
            {
                Header: 'F. REGISTRO',
                accessor: 'date_created'
            },
        ],
        []
    );

    useEffect(() => {
        let continuezyx = true;

        if (openModal) {
            formik.resetForm();
            setDataFieldHour([]);
            (async () => {
                if (rowselected) {
                    const datatlistorg = {
                        method: "fn_sel_time_field",
                        data: {
                            id_field: rowselected.id_field,
                            status: null
                        }
                    }
                    const res = await triggeraxios('post', process.env.endpoints.selsimple, datatlistorg);
                    setDataFieldHour(validateResArray(res, continuezyx));
                }
            })();

        }
        return () => continuezyx = false;
    }, [openModal])

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, SET_CAMPUS).then(r => setDataCampus(validateResArray(r, continuezyx)))
            ]);

        })();
        return () => continuezyx = false;
    }, [])


    const selectrow = React.useCallback((row) => {
        setOpenModalHour(true);
        setFieldHourSelected(row);
    }, [])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            id_field: 0,
            id_campus: 0,
            description: '',
            status: 'ACTIVO',
            color: '#e1e1e1'
        },
        validationSchema: Yup.object({
            description: Yup.string().required('El nombre de dominio es obligatorio'),
            status: Yup.string().required('El estado de dominio es obligatorio'),
            id_campus: Yup.number().min(1, 'La sede es obligatorio')
        }),
        onSubmit: async values => {
            if (dataFieldHour.length !== 0) {
                const callback = async () => {
                    setModalQuestion({ visible: false });
                    const dattosend = {
                        method: "fn_ins_field",
                        header: {
                            data: values
                        },
                        details: {
                            data: dataFieldHour.filter(x => !!x.operation).map(x => ({
                                ...x,
                                id_time_field: x.id_time_field < 0 ? 0 : x.id_time_field,
                            }))
                        }
                    }
                    console.log(JSON.stringify(dattosend));
                    setOpenBackdrop(true);
                    const res = await triggeraxios('post', process.env.endpoints.transaction, dattosend);
                    if (res.success) {
                        fetchDataUser({});
                        setOpenModal(false);

                        setOpenSnackBack(true, { success: true, message: 'Campo guardado satisfactoriamente.' });
                    } else {
                        setOpenSnackBack(true, { success: false, message: !res.msg ? 'Hubo un error, vuelva a intentarlo' : res.msg });
                    }

                    setOpenBackdrop(false);
                }

                setModalQuestion({ visible: true, question: `¿Está seguro de guardar el campo?`, callback })
            } else {
                setOpenSnackBack(true, { success: false, message: 'Necesita insertar regitros al campo.' });
            }
        }
    });
    const handleClick = () => setOpenModal(false);

    const deleterow = (row) => {
        const callback = () => {
            setDataFieldHour(prev => [...prev.map(o => o.id_time_field === row.id_time_field ? { ...row, status: 'ELIMINADO', deleted: true, operation: (row.id_time_field > 0) } : o)]);
            setModalQuestion({ visible: false })
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de eliminar el registro?`, callback })
    }
    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='md'
                onClose={handleClick}
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
                                classname="col-3"
                                label="Nombre"
                                formik={formik}
                                disabled={disabled}
                            />
                            <InputFormk
                                name="color"
                                classname="col-3"
                                label="Color"
                                type="color"
                                formik={formik}
                                disabled={disabled}
                            />
                            <SelectFunction
                                title="Sede"
                                datatosend={dataCampus}
                                classname="col-3"
                                optionvalue="id_campus"
                                optiondesc="description"
                                valueselected={formik.values.id_campus}
                                namefield="id_campus"
                                descfield="role_name"
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
                        <TableZyx
                            columns={columnsDomainValues}
                            titlemodule='Horarios'
                            data={dataFieldHour.filter(x => !x.deleted)}
                            register={true}
                            selectrow={selectrow}
                        />
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
            <FieldHour
                openModal={openModalHour}
                setOpenModal={setOpenModalHour}
                setDataFieldHour={setDataFieldHour}
                rowselected={fieldHourSelected}
            />
        </>
    );
}

export default DomainModal;