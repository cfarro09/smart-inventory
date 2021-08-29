import React, { useState, useContext, useEffect } from 'react';
import Layout from 'components/system/layout/layout'
import TableZyx from 'components/system/form/table-simple';
import triggeraxios from 'config/axiosv2';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import { validateResArray } from '../../config/helper';
import IconButton from '@material-ui/core/IconButton';
import authContext from '../../context/auth/authContext';
import { useRouter } from 'next/router'

const selproperty = {
    method: "SP_SEL_PROPERTIES",
    data: {
        name: null,
        status: 'ACTIVO'
    }
}

const ListLoads = () => {
    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const router = useRouter();

    const { appselected: appfound } = useContext(authContext);
    const [datatable, setdatatable] = useState([]);
    const [datadetail, setdatadetail] = useState([]);

    const columns = React.useMemo(
        () => [
            {
                Header: "N° GUIA",
                accessor: "guide_number"
            },
            {
                Header: "ESTADO",
                accessor: "status"
            },
            {
                Header: "PRODUCTO",
                accessor: "products"
            },
            {
                Header: "F. CREADO",
                accessor: "date_created"
            },
            {
                Header: "ULTIMA F.",
                accessor: "date_updated"
            },
            {
                Header: "E. DIRECCION",
                accessor: "delivery_address"
            },
            {
                Header: "E. DIRECCION REF.",
                accessor: "delivery_reference"
            },
            {
                Header: "E. CONTACTO",
                accessor: "delivery_contact_name"
            },
            {
                Header: "E. CONTACTO TEL",
                accessor: "delivery_phone"
            },
            {
                Header: "E. UBIGEO",
                accessor: "delivery_ubigeo"
            },

            // {
            //     Header: "n_products",
            //     accessor: "n_products"
            // },
            {
                Header: "R. DIRECCIÓN",
                accessor: "pickup_address"
            },
            {
                Header: "pickup_reference",
                accessor: "R. REFERENCIA"
            },
            {
                Header: "R. CONTACTO",
                accessor: "pickup_contact_name"
            },
            {
                Header: "R. CONTACTO TEL",
                accessor: "pickup_phone"
            },

            {
                Header: "R. UBIGEO",
                accessor: "pickup_ubigeo"
            },
            {
                Header: "CONDUCTOR",
                accessor: "driver_name"
            },
            {
                Header: "PLACA",
                accessor: "plate_number"
            },
        ],
        [appfound]
    );

    const loaddetail = React.useCallback(async ({id_massive_load, continuezyx = true}) => {
        const datatosend = {
            method: "SP_MASSIVE_LOAD_DETAILS",
            data: {
                id_massive_load
            }
        }
        setloadingglobal(true)
        const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend)
        setloadingglobal(false)
        if (res.success && continuezyx) {
            setdatadetail(res.result.data);
        }
    }, [])


    useEffect(() => {
        setdatadetail([]);
        let continuezyx = true;
        if (router?.query?.id) {
            loaddetail({id_massive_load: router.query.id, continuezyx})
        }

        return () => continuezyx = false;
    }, [router])

    const fetchData = React.useCallback(async () => {
        setloadingglobal(true);

        const res = await triggeraxios('post', process.env.endpoints.selsimple, selproperty)

        setdatatable(validateResArray(res, true));

        setloadingglobal(false)
    }, []);


    return (
        <Layout>
            <TableZyx
                columns={columns}
                titlemodule='Detalle de carga'
                data={datadetail}
                // fetchData={fetchData}
                // register={!!appfound.insert}
                // selectrow={selectrow}
            />
        </Layout>
    );
}

export default ListLoads;