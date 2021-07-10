import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-paginated'
import triggeraxios from '../config/axiosv2';
import Typography from '@material-ui/core/Typography';
import popupsContext from '../context/pop-ups/pop-upsContext';
import Dialog from '@material-ui/core/Dialog';
import InputFormk from '../components/system/form/inputformik';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { getDomain, validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import Button from '@material-ui/core/Button';
import HistoryIcon from '@material-ui/icons/History';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import AssignmentIcon from '@material-ui/icons/Assignment';

const SEL_DRIVER = {
    method: "SP_SEL_DRIVER",
    data: { status: 'ACTIVO', type: 'DRIVER' }
}

const AssignmentModal = ({ openModal, setOpenModal, rowselected, fetchDataUser }) => {
    const [drivers, setdrivers] = useState([]);
    const [driverSelected, setDriverSelected] = useState(null)

    useEffect(() => {
        let continuezyx = true;

        (async () => {
            await triggeraxios('post', process.env.endpoints.selsimple, SEL_DRIVER).then(r => setdrivers(validateResArray(r, continuezyx).map(x => ({
                ...x,
                description: `${x.first_name} ${x.last_name} - ${x.plate_number}`
            }))))
        })()

        return () => continuezyx = false;

    }, [])
    const { setOpenBackdrop, setOpenSnackBack, setModalQuestion } = useContext(popupsContext);

    const callback = ({ newValue }) => {
        console.log(newValue);
        setDriverSelected(newValue)
    }

    const assignorder = async () => {
        if (driverSelected) {
            const dattosend = {
                method: "SP_ASSIGN_ORDER_WEB",
                data: {
                    id_order: rowselected.id_order,
                    id_driver: driverSelected.id_driver
                }
            }
            setOpenBackdrop(true);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, dattosend);
            if (res.success) {
                fetchDataUser({});
                setOpenModal(false);
    
                setOpenSnackBack(true, { success: true, message: 'Se asignó correctamente.' });
            } else {
                setOpenSnackBack(true, { success: false, message: res.msg });
            }
    
            setOpenBackdrop(false);
        }
    }

    const handleClick = () => setOpenModal(false);

    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='sm'
                onClose={handleClick}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Asignar chofer a {rowselected?.guide_number}</DialogTitle>
                <DialogContent>
                    <div className="row-zyx">
                        <SelectFunction
                            title="CONDUCTOR"
                            datatosend={drivers}
                            classname="col-12"
                            optionvalue="id_user"
                            callback={callback}
                            optiondesc="description"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="button"
                        color="primary"
                        onClick={assignorder}
                    >
                        ASIGNAR
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
            </Dialog>
        </>
    );
}

const Home = () => {
    const { setloadingglobal, setOpenBackdrop, setModalQuestion, setOpenSnackBack, setLightBox } = useContext(popupsContext);

    const [openModalChangeStatus, setOpenModalChangeStatus] = useState(false);

    const [rowselected, setrowselected] = useState(null);
    const [loading, setloading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [datafetch, setdatafetch] = useState({})
    const [datatable, setdatatable] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);

    const changestatus = (r) => {
        setrowselected(r);
        setOpenModalChangeStatus(true);
    }

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
                                onClick={() => {
                                    selectrow(props.cell.row.original);
                                }}
                            >
                                <AssignmentIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                        </div>
                    )
                }
            },
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
            {
                Header: "IMÁGENES CHOFER",
                accessor: "images_order",
                isComponent: true,
                Cell: (props) => {
                    const { images_order } = props.cell.row.original;
                    if (!images_order)
                        return null;
                    return (
                        <AvatarGroup max={3} onClick={() => setLightBox({ open: true, index: 0, images: images_order.split(",") })}>
                            {images_order.split(",").map(image => (
                                <Avatar
                                    key={image}
                                    src={image}
                                    onClick={() => 'hola ' + image}
                                />
                            ))}
                        </AvatarGroup>
                    )
                }
            },
            {
                Header: "IMÁGENES CLIENTE",
                accessor: "images_product",
                isComponent: true,
                Cell: (props) => {
                    const { images_product } = props.cell.row.original;
                    if (!images_product)
                        return null;
                    return (
                        <AvatarGroup max={3} onClick={() => setLightBox({ open: true, index: 0, images: images_product.split(",") })}>
                            {images_product.split(",").map((image, i) => (
                                <Avatar
                                    key={image + i}
                                    src={image}
                                    onClick={() => 'hola ' + image}
                                />
                            ))}
                        </AvatarGroup>
                    )
                }

            }
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
            methodcollection: "SP_SEL_ORDER_USER",
            methodcount: "SP_SEL_ORDER_USER_COUNT",
            take: pageSize,
            skip: pageIndex,
            filters,
            sorts,
            origin: 'SP_SEL_ORDER_USER',
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
            <AssignmentModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                rowselected={rowselected}
                fetchDataUser={updateFetchData}
            />
            {/* <ChangeStatusMain
                title="Cambiar estado"
                openModal={openModalChangeStatus}
                setOpenModal={setOpenModalChangeStatus}
                rowselected={rowselected}
                fetchData={updateData}
            /> */}
        </Layout>
    );
}

export default Home;