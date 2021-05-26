import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/system/layout/layout'
import TableZyx from '../../components/system/form/table-simple';
import ExampleMain from '../../components/example/examplemain';
import InputFormk from '../../components/system/form/inputformik';
import Typography from '@material-ui/core/Typography';
import triggeraxios from '../../config/axiosv2';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import { validateResArray, getDomain } from '../../config/helper';
import { useRouter } from 'next/router';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import {
    ArrowBack,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';
import { de } from 'date-fns/locale';

const datatosend = (id_purchase_order) => ({
    method: "SP_SEL_PURCHASE_ORDER_DETAILS",
    data: { id_purchase_order }
})

const Example = () => {
    const router = useRouter();

    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [datatable, setdatatable] = useState([]);
    
    const columns = React.useMemo(() => [
        {
            Header: 'CODIGO',
            accessor: 'product_code'
        },
        {
            Header: 'CANTIDAD',
            accessor: 'product_quantity'
        },
        {
            Header: 'DESCONTADO DE',
            accessor: 'discount_from'
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
    ], [])

    const fetchData = React.useCallback(async ({ id_purchase_order = 0, continuezyx = true }) => {
        setloadingglobal(true);
        const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend(id_purchase_order));
        setdatatable(validateResArray(res, continuezyx).map(x => ({
            ...x, 
            discount_from: x.discount_from.toUpperCase()
                .replace("SHRINKAGE", "MERMA")
                .replace("QUARENTINE", "CUARENTENA")
                .replace("AVAILABLE", "DISPONIBLE")
            })));
       
        setloadingglobal(false)
    }, []);

    useEffect(() => {
        setdatatable([]);
        let continuezyx = true;
        if (router?.query?.id) {
            console.log({ id_purchase_order: router.query.id, continuezyx });
            fetchData({ id_purchase_order: router.query.id, continuezyx });
        }

        return () => continuezyx = false;
    }, [router])

    const backListLoad = () => router.push('/purchase-order/list')

    return (
        <Layout>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        aria-label="add"
                        onClick={backListLoad}
                    >
                        <ArrowBack size="small" color="action" />
                    </IconButton>
                    <Typography variant="h6" id="tableTitle" component="div">
                        Detalle de la carga OC {datatable.length > 0 ? `ID ${datatable[0].id_purchase_order} - ${datatable[0].date_created}` : ""}
                    </Typography>
                </div>
            </div>
            <TableZyx
                columns={columns}
                // download={false}
                // titlemodule='Detalle de la carga'
                data={datatable}
            />
        </Layout>
    );
}

export default Example;