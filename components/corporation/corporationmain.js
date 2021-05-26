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
import TableZyx from '../system/form/table-simple';
import * as Yup from 'yup';
import OrganizationMain from './organizationmain';
import { getDomain, validateResArray } from '../../config/helper';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const dataRequestOrganization = (corpid) => ({
    method: "SP_SEL_ORGANIZATIONS",
    data: {
        corpid,
        status: null
    }
})

const TemplateModal = React.memo(({ title, openModal, setOpenModal, rowselected, fetchDataUser, method_ins }) => {
    const { setOpenBackdrop, setOpenSnackBack, setModalQuestion } = useContext(popupsContext);

    const [openModalStore, setOpenModalStore] = useState(false);
    const [storeRowSelected, setStoreRowSelected] = useState(null);
    const [dataOrganization, setDataOrganization] = useState([]);

    console.log(dataOrganization);

    const [domains, setdomains] = useState({ doc_type: [], status: [], rubro: [] });

    const formik = useFormik({
        enableReinitialize: true,
        validateOnChange: false,
        initialValues: rowselected || {
            name: '',
            doc_type: '',
            description: '',
            document: '',
            status: 'ACTIVO'
        },
        validationSchema: Yup.object({
            name: Yup.string().required('El nombre del cliente es obligatorio'),
            doc_type: Yup.string().required('El tipo de documento es obligatorio'),
            document: Yup.string().required('El documento es obligatorio'),
            status: Yup.string().required('El estado es obligatorio'),
        }),
        onSubmit: async values => {
            if (!dataOrganization.length) {
                setOpenSnackBack(true, { success: false, message: "Tiene que asignar al menos una organización." });
                return;
            }
            const datatosend = {
                method: method_ins,
                header: {
                    data: {
                        ...values,
                        type: '',
                        id_corporation: rowselected ? rowselected.id_corporation : 0
                    }
                },
                details: {
                    data: dataOrganization.filter(x => !!x.operation).map(x => ({
                        ...x,
                        type: '',
                        id_organization: x.id_organization < 0 ? 0 : x.id_organization,
                    }))
                }
            }
            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.transaction, datatosend);
            if (res.success) {
                fetchDataUser({});
                setOpenModal(false);
            } else {
                setOpenSnackBack(true, { success: false, message: !res.msg ? 'Hubo un error, vuelva a intentarlo' : res.msg });
            }
            setOpenBackdrop(false)
        }
    });

    const columns = React.useMemo(
        () => [
            {
                Header: "",
                accessor: "id_client",
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <Tooltip title="Editar">
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
                            </Tooltip>
                            <Tooltip title="Eliminar">
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
                            </Tooltip>
                        </div>
                    )
                }
            },
            {
                Header: 'ORGANIZATION',
                accessor: 'name'
            },
            {
                Header: 'DESCRIPCIÓN',
                accessor: 'description'
            },
            {
                Header: 'DIRECCIÓN',
                accessor: 'address'
            },
            {
                Header: 'ESTADO',
                accessor: 'status'
            },
            {
                Header: 'F. REGISTRO',
                accessor: 'date_created'
            },
            {
                Header: 'F. MODIFICADO',
                accessor: 'date_updated'
            },
            {
                Header: 'CREADO POR',
                accessor: 'created_by'
            },
            {
                Header: 'MODIFICADO POR',
                accessor: 'modified_by'
            },
        ],
        []
    );

    const selectrow = React.useCallback((row) => {
        setOpenModalStore(true);
        setStoreRowSelected(row);
    }, []);

    const deleterow = (row) => {
        const callback = () => {
            setDataOrganization(prev => [...prev.map(o => o.id_organization === row.id_organization ? { ...row, status: 'ELIMINADO', deleted: true, operation: (row.id_organization > 0) } : o)]);
            setModalQuestion({ visible: false })
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de eliminar el registro?`, callback })
    }

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPODOCUMENTO")).then(r => setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        let continuezyx = true;
        if (openModal) {
            formik.resetForm();
            setDataOrganization([]);
            (async () => {
                if (rowselected) {
                    const res = await triggeraxios('post', process.env.endpoints.selsimple, dataRequestOrganization(rowselected.id_corporation));
                    setDataOrganization(validateResArray(res, continuezyx));
                }
            })();
        }
        return () => continuezyx = false;
    }, [openModal]);

    const setDataOrganizationcallback = React.useCallback((values, type) => {
        console.log(type);
        if (!storeRowSelected) {
            setDataOrganization([...dataOrganization, { ...values, id_organization: dataOrganization.length * -1, operation: true }]);
        } else
            setDataOrganization([...dataOrganization.map(o => o.id_organization === values.id_organization ? { ...values, operation: true } : o)]);
    }, [dataOrganization, storeRowSelected])
    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='md'
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <>
                    <DialogTitle id="alert-dialog-title">{title} - {rowselected ? "Editar" : "Registrar"}</DialogTitle>
                    <DialogContent>
                        <form
                            id="form-aux-tmp-zyx"
                            noValidate
                            onSubmit={formik.handleSubmit}
                        >
                            <div className="row-zyx">
                                <InputFormk
                                    classname="col-3"
                                    name="name"
                                    label="Corporación"
                                    formik={formik}
                                />
                                <InputFormk
                                    classname="col-3"
                                    name="description"
                                    label="Descripción"
                                    formik={formik}
                                />
                                <SelectDomain
                                    classname="col-3"
                                    title="Tipo Doc"
                                    domainname={domains.doc_type}
                                    valueselected={formik.values.doc_type}
                                    namefield="doc_type"
                                    formik={formik}
                                />
                                <InputFormk
                                    classname="col-3"
                                    name="document"
                                    label="Documento"
                                    formik={formik}
                                />

                            </div>
                            <div className="row-zyx">
                                <SelectDomain
                                    classname="col-3"
                                    title="Estado"
                                    domainname={domains.status}
                                    valueselected={formik.values.status}
                                    namefield="status"
                                    formik={formik}
                                />
                            </div>
                        </form>
                        <TableZyx
                            columns={columns}
                            titlemodule='Organizaciones'
                            data={React.useMemo(() => dataOrganization.filter(x => !x.deleted), [dataOrganization])}
                            register={true}
                            selectrow={selectrow}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            type="submit"
                            form="form-aux-tmp-zyx"
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
                </>
            </Dialog>

            <OrganizationMain
                openModal={openModalStore}
                setOpenModal={setOpenModalStore}
                setData={setDataOrganizationcallback}
                rowselected={storeRowSelected}
            />
        </>
    );
})

export default TemplateModal;