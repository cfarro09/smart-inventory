import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import triggeraxios from '../../config/axiosv2';
import InputFormk from '../system/form/inputformik';
import { useTheme } from '@material-ui/core/styles';
import CheckBox from '../system/form/checkbox';
import UseSelectDomain from '../system/form/select-domain';
import SelectFunction from '../system/form/select-function';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { validateResArray, getDomain } from '../../config/helper';

const parloadPermission = id_role => ({
    method: "SP_SEL_ROLEAPPLICATION",
    data: {
        id_role
    }
})

const RowPermission = ({ item, setRolePermission }) => {
    const handlerChange = ({ checked, metadata }) => {
        setRolePermission(init => {
            return init.map(x => x.id_roleapplication === item.id_roleapplication ? {
                ...item,
                [metadata]: checked
            } : x)
        })
    }
    const valueinsert = ["Productos", "Role-Aplicacion", "Propiedades", "Dominios", "Corporaciones", "Inventario", "Carga", "Listar"].includes(item.description) ? false : !!item.insert;
    const disabledinsert = ["Productos", "Role-Aplicacion", "Propiedades", "Dominios", "Corporaciones", "Inventario", "Carga", "Listar"].includes(item.description);

    const valuedelete = ["Productos", "Role-Aplicacion", "Propiedades", "Dominios", "Corporaciones", "Inventario", "Carga", "Listar"].includes(item.description) ? false : !!item.delete;
    const disableddelete = ["Productos", "Role-Aplicacion", "Propiedades", "Dominios", "Corporaciones", "Inventario", "Carga", "Listar"].includes(item.description);

    const valueupdate = ["Inventario", "Carga", "Listar"].includes(item.description) ? false : !!item.modify;
    const disabledupdate = ["Inventario", "Carga", "Listar"].includes(item.description);

    return (
        <div
            className="row-zyx"
            key={item.id_roleapplication}
        >
            <div className="col-3 mb-0">
                {item.tag}
            </div>
            <div className="col-2 text-center mb-0">
                <CheckBox
                    valueselected={!!item.view}
                    callback={handlerChange}
                    metadata="view"
                />
            </div>
            <div className="col-2 text-center mb-0">
                <CheckBox
                    valueselected={valueinsert}
                    callback={handlerChange}
                    disabled={disabledinsert}
                    metadata="insert"
                />
            </div>
            <div className="col-2 text-center mb-0">
                <CheckBox
                    valueselected={valueupdate}
                    callback={handlerChange}
                    disabled={disabledupdate}
                    metadata="modify"
                />
            </div>
            <div className="col-2 text-center mb-0">
                <CheckBox
                    valueselected={valuedelete}
                    disabled={disableddelete}
                    callback={handlerChange}
                    metadata="delete"
                />
            </div>
        </div>
    )
}

const ListApplications = ({ rolePermission, setRolePermission }) => {
    return (
        <>
            {rolePermission.map(x => (
                <RowPermission
                    key={x.id_roleapplication}
                    setRolePermission={setRolePermission}
                    item={x}
                />
            ))}
        </>
    )
}

const RoleMain = ({ title, openModal, setOpenModal, rowselected, fetchDataUser, disabled = false }) => {

    const theme = useTheme();
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);
    const [domains, setdomains] = useState({ status: [], type: [] })
    const [rolePermission, setRolePermission] = useState([]);

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomains(p => ({ ...p, status: validateResArray(r, continuezyx) }))),
            ]);

        })();
        return () => continuezyx = false;
    }, [])

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            setRolePermission([]);
            if (rowselected) {
                triggeraxios('post', process.env.endpoints.selsimple, parloadPermission(rowselected.id_role)).then(r => setRolePermission(validateResArray(r, continuezyx)))
            }
        })();
        return () => continuezyx = false;
    }, [rowselected])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            description: '',
            status: 'ACTIVO'
        },
        validationSchema: Yup.object({
            description: Yup.string().required('La descripción es obligatorio'),
            status: Yup.string().required('El estado es obligatorio')
        }),
        onSubmit: async values => {
            const callback = async () => {
                setModalQuestion({ visible: false });
                const dattosend = {
                    method: "SP_INS_ROLEAPPLICATION",
                    header: {
                        data: {}
                    },
                    details: {
                        data: rolePermission.map(x => ({
                            ...x,
                            view: x.view ? 1 : 0,
                            delete: x.delete ? 1 : 0,
                            modify: x.modify ? 1 : 0,
                            insert: x.insert ? 1 : 0,
                        }))
                    }
                }

                setOpenBackdrop(true);
                const res = await triggeraxios('post', process.env.endpoints.transaction, dattosend);
                if (res.success) {
                    fetchDataUser({});
                    setOpenModal(false);
                    setOpenSnackBack(true, { success: true, message: 'Transacción ejecutada satisfactoriamente.' });
                } else
                    setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });

                setOpenBackdrop(false);
            }

            setModalQuestion({ visible: true, question: `¿Está seguro de guardar los permisos?`, callback })
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
                <DialogTitle id="alert-dialog-title">{title} - {rowselected ? "Editar" : "Registrar"}</DialogTitle>
                <DialogContent>
                    <div className="row-zyx">
                        <InputFormk
                            name="description"
                            classname="col-3"
                            label="Descripción"
                            disabled={true}
                            formik={formik}
                        />
                        <UseSelectDomain
                            classname="col-3"
                            title="Estado"
                            disabled={true}
                            domainname={domains.status}
                            valueselected={formik.values.status}
                            namefield="status"
                            formik={formik}
                        />
                    </div>
                    <div style={{ marginTop: theme.spacing(2), marginLeft: theme.spacing(2) }}>
                        <div className="row-zyx" style={{ marginBottom: theme.spacing(1) }}>
                            <div className="font-weight-bold col-3">
                                APLICACION
                                </div>
                            <div className="font-weight-bold col-2 text-center">
                                VER
                                </div>
                            <div className="font-weight-bold col-2 text-center">
                                INSERTAR
                                </div>
                            <div className="font-weight-bold col-2 text-center">
                                ACTUALIZAR
                                </div>
                            <div className="font-weight-bold col-2 text-center">
                                ELIMINAR
                                </div>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                            <ListApplications
                                rolePermission={rolePermission}
                                setRolePermission={setRolePermission}
                            />
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

export default RoleMain;