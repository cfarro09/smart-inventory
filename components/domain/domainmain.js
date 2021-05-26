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
import DomainValue from './domainvalue';
import * as Yup from 'yup';
import { validateResArray } from '../../config/helper';

import IconButton from '@material-ui/core/IconButton';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const DomainModal = ({ title, openModal, setOpenModal, rowselected, fetchDataUser }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack, disabled = false } = useContext(popupsContext);

    const [openModalDomainV, setOpenModalDomainV] = useState(false);
    const [orgrowselected, setorgrowselected] = useState(null);
    const [datadomainvalues, setdatadomainvalues] = useState([]);

    const columnsDomainValues = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_domain',
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
                Header: 'VALOR',
                accessor: 'domain_value'
            },
            {
                Header: 'DESCRIPCION',
                accessor: 'domain_description'
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
            setdatadomainvalues([]);
            (async () => {
                if (rowselected) {
                    const datatlistorg = {
                        method: "SP_SEL_DOMAIN",
                        data: {
                            domain_name: rowselected.domain_name,
                            status: null
                        }
                    }
                    const res = await triggeraxios('post', process.env.endpoints.selsimple, datatlistorg);
                    setdatadomainvalues(validateResArray(res, continuezyx));
                }
            })();

        }
        return () => continuezyx = false;
    }, [openModal])

    const selectrow = (row) => {
        setOpenModalDomainV(true);
        setorgrowselected(row);
    }
    // #endregion

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            domain_name: '',
        },
        validationSchema: Yup.object({
            domain_name: Yup.string().required('El nombre de dominio es obligatorio'),
        }),
        onSubmit: async values => {
            if (datadomainvalues.length !== 0) {
                const callback = async () => {
                    setModalQuestion({ visible: false });
                    const dattosend = {
                        method: "SP_INS_DOMAIN",
                        header: {
                            data: {}
                        },
                        details: {
                            data: datadomainvalues.filter(x => !!x.operation).map(x => {
                                return {
                                    id_domain: x.id_domain < 0 ? 0 : x.id_domain,
                                    domain_name: values.domain_name,
                                    domain_value: x.domain_value,
                                    domain_description: x.domain_description,
                                    status: x.status,
                                }
                            })
                        }
                    }

                    setOpenBackdrop(true);
                    const res = await triggeraxios('post', process.env.endpoints.transaction, dattosend);
                    if (res.success) {
                        fetchDataUser({});
                        setOpenModal(false);

                        setOpenSnackBack(true, { success: true, message: 'Transacción ejecutada satisfactoriamente.' });
                    } else {
                        setOpenSnackBack(true, { success: false, message: !res.msg ? 'Hubo un error, vuelva a intentarlo' : res.msg });
                    }

                    setOpenBackdrop(false);
                }

                setModalQuestion({ visible: true, question: `¿Está seguro de guardar el dominio?`, callback })
            } else {
                setOpenSnackBack(true, { success: false, message: 'Necesita insertar regitros al dominio.' });
            }
        }
    });
    const handleClick = () => setOpenModal(false);

    const deleterow = (row) => {
        const callback = () => {
            setdatadomainvalues(prev => [...prev.map(o => o.domain_value === row.domain_value ? { ...row, status: 'ELIMINADO', deleted: true, operation: (row.id_domain > 0) } : o)]);
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
                                name="domain_name"
                                classname="col-3"
                                label="Nombre"
                                formik={formik}
                                disabled={disabled}
                            />
                        </div>
                        <TableZyx
                            columns={columnsDomainValues}
                            titlemodule='Valores'
                            data={datadomainvalues.filter(x => x.deleted !== true)}
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
            <DomainValue
                openModal={openModalDomainV}
                setOpenModal={setOpenModalDomainV}
                setdatadomainvalues={setdatadomainvalues}
                rowselected={orgrowselected}
            />
        </>
    );
}

export default DomainModal;