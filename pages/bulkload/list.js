import React, { useState, useContext, useEffect } from 'react';
import Layout from '../../components/system/layout/layout'
import TableZyx from '../../components/system/form/table-paginated'
import triggeraxios from '../../config/axiosv2';
import Typography from '@material-ui/core/Typography';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import IconButton from '@material-ui/core/IconButton';
import { useRouter } from 'next/router'

import ListIcon from '@material-ui/icons/List';


const Home = () => {
    const { setloadingglobal, setOpenBackdrop, setModalQuestion, setOpenSnackBack, setLightBox } = useContext(popupsContext);
    const router = useRouter();

    const [loading, setloading] = useState(true);
    const [datafetch, setdatafetch] = useState({})
    const [datatable, setdatatable] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);

    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id_oder',
                activeOnHover: true,
                Cell: props => {
                    return (
                        <div className="container-button-floating">
                            <IconButton
                                size="small"
                                className="button-floating"
                                onClick={() => router.push('/bulkload/[id]', `/bulkload/${props.cell.row.original.id_massive_load}`)}
                            >
                                <ListIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                        </div>
                    )
                }
            },
            
            {
                Header: "ID CARGA",
                accessor: "id_massive_load"
            },
            {
                Header: "N° REGISTROS",
                accessor: "number_records"
            },
            {
                Header: "CARGADO POR",
                accessor: "created_by"
            },
            {
                Header: "FECHA CARGA",
                accessor: "date_created"
            },
        ],
        []
    );


    const selectrow = (row) => {
        setOpenModal(true);
        setrowselected(row);
    }

    const updateFetchData = () => fetchData(datafetch)

    const fetchData = React.useCallback(({ pageSize, pageIndex, filters, sorts, daterange }) => {
        setloadingglobal(true);
        setdatafetch({ pageSize, pageIndex, filters, sorts, daterange })
        const datatosend = {
            methodcollection: "SP_SEL_MASSIVE_LOAD",
            methodcount: "SP_SEL_MASSIVE_LOAD_COUNT",
            take: pageSize,
            skip: pageIndex,
            filters,
            sorts,
            origin: 'SP_SEL_MASSIVE_LOAD',
            daterange,
            offset: (new Date().getTimezoneOffset() / 60) * -1
        }

        triggeraxios('post', process.env.endpoints.selpaginated, datatosend).then(res => {
            if (res.success) {
                if (res.result.data.collection instanceof Array) {
                    setdatatable(res.result.data.collection);
                    setPageCount(Math.ceil(res.result.data.count / pageSize));
                    settotalrow(res.result.data.count);
                }
                else
                    console.error("Result is not array");
            }
            setloading(false);
            setloadingglobal(false)
        });
    }, []);

    return (
        <Layout>
            <TableZyx
                columns={columns}
                data={datatable}
                totalrow={totalrow}
                filterrange={true}
                loading={loading}
                pageCount={pageCount}
                fetchData={fetchData}
                titlemodule='Pedidos'
            />
        </Layout>
    );
}

export default Home;