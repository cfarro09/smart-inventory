import React, { useEffect, useCallback, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import SelectFunction from '../system/form/select-function';
import MultiSelectFunction from '../system/form/multiselect';
import SwitchZyx from '../system/form/switch'
import Button from '@material-ui/core/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import triggeraxios from '../../config/axiosv2';
import { validateResArray, getDomain } from '../../config/helper';

const REQUESTCLIENT = {
    method: "SP_SEL_CLIENT",
    data: { status: 'ACTIVO' }
}
const REQUESTORGANIZATION = {
    method: "SP_SEL_ORGANIZATIONS",
    data: { 
        corpid: null,
        status: null
     }
}
const UserOrganization = ({ openModal, setOpenModal, setdataorg, rowselected, selectedorgs }) => {
    const [dataOrganizationsShowed, setDataOrganizationsShowed] = useState([]);
    // const [dataRoles, setDataRoles] = useState([]);
    const [domainstatus, setdomainstatus] = useState([]);
    const [dataOrganization, setDataOrganization] = useState([]);
    const [dataClient, setDataClient] = useState([]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: rowselected || {
            id_organization: 0,
            clients: '',
            // role_name: '',
            status: 'ACTIVO'
        },
        validationSchema: Yup.object({
            id_organization: Yup.number().min(1),
            // id_role: Yup.number().min(1),
            status: Yup.string().required('La organización es obligatorio'),
        }),
        onSubmit: async values => {
            const bydefault = !values.bydefault || values.bydefault === "NO" ? "NO" : "SI";
            if (!rowselected) {
                setdataorg(prev => [...prev, { ...values, bydefault, id_orguser: prev.length * -1, operation: true }]);
            } else {
                setdataorg(prev => [...prev.map(o => o.id_orguser === values.id_orguser ? { ...values, bydefault, operation: true } : o)]);
            }
            setOpenModal(false);
        }
    });

    useEffect(() => {
        let continuezyx = true;
        if (openModal) {
            formik.resetForm();
            // setDataOrganizationsShowed(dataOrganization);
            // if (rowselected) {
                // debugger
            setDataOrganizationsShowed(dataOrganization.filter(x => (rowselected && x.id_organization === rowselected.id_organization) || !selectedorgs.some(y => y.id_organization === x.id_organization && !x.deleted)))
            // }
        }
        return () => continuezyx = false;
    }, [openModal])

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADO")).then(r => setdomainstatus(validateResArray(r, continuezyx))),
                triggeraxios('post', process.env.endpoints.selsimple, REQUESTCLIENT).then(r => setDataClient(validateResArray(r, continuezyx))),
                triggeraxios('post', process.env.endpoints.selsimple, REQUESTORGANIZATION).then(r => setDataOrganization(validateResArray(r, continuezyx))),
            ]);
        })();
        return () => continuezyx = false;
    }, [])


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
                <DialogTitle id="alert-dialog-title">Usuario - Organización</DialogTitle>
                <DialogContent>
                    <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                        <SwitchZyx
                            title="Org x Defecto"
                            namefield="bydefault"
                            formik={formik}
                            valueselected={formik.values.bydefault === "SI" ? true : false}
                        />
                    </div>
                    <div className="row-zyx">
                        <SelectFunction
                            title="Organizacion"
                            datatosend={dataOrganizationsShowed}
                            classname="col-3"
                            optionvalue="id_organization"
                            optiondesc="name"
                            valueselected={formik.values.id_organization}
                            namefield="id_organization"
                            descfield="org_name"
                            formik={formik}
                        />
                        <MultiSelectFunction
                            title="Cliente"
                            datatosend={dataClient}
                            classname="col-3"
                            optionvalue="id_client"
                            optiondesc="company_name"
                            namefield="clients"
                            valueselected={formik.values.clients}
                            formik={formik}
                        />
                        <SelectFunction
                            title="Estado"
                            datatosend={domainstatus}
                            classname="col-3"
                            optionvalue="domain_value"
                            optiondesc="domain_description"
                            valueselected={formik.values.status}
                            namefield="domain_value"
                            descfield="name"
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

export default UserOrganization;