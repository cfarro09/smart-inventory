import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-paginated'
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { getDomain, validateResArray } from '../config/helper';
import SelectFunction from '../components/system/form/select-function';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import AssignmentIcon from '@material-ui/icons/Assignment';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputFormk from '../components/system/form/inputformik';

const SEL_DRIVER = {
    method: "SP_SEL_DRIVER",
    data: { status: 'ACTIVO', type: 'DRIVER' }
}


const InfoModal = ({ openModal, setOpenModal, rowselected }) => {

    return (
        <Dialog
            open={openModal}
            fullWidth={true}
            maxWidth='lg'
            onClose={() => setOpenModal(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Datos del pedido {rowselected?.guide_number || ""}</DialogTitle>
            <DialogContent>
                <div className="row-zyx">
                    <InputFormk
                        valuedefault={rowselected?.guide_number || ""}
                        classname="col-3"
                        label="Nª orden"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.products || ""}
                        classname="col-3"
                        label="Producto"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.client_name || ""}
                        classname="col-3"
                        label="Cliente"
                        disabled={true}
                    />

                </div>
                <div className="row-zyx">
                    <InputFormk
                        valuedefault={rowselected?.plate_number || ""}
                        classname="col-3"
                        label="Placa"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.driver_name || ""}
                        classname="col-3"
                        label="Chofer"
                        disabled={true}
                    />
                </div>
                <div className="row-zyx">
                    <InputFormk
                        valuedefault={rowselected?.delivery_address || ""}
                        classname="col-3"
                        label="Dirección entrega"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.delivery_reference || ""}
                        classname="col-3"
                        label="Referencia entrega"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.delivery_contact_name || ""}
                        classname="col-3"
                        label="Contacto entrega"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.delivery_phone || ""}
                        classname="col-3"
                        label="Teléfono entrega"
                        disabled={true}
                    />
                </div>
                <div className="row-zyx">
                    <InputFormk
                        valuedefault={rowselected?.delivery_ubigeo || ""}
                        classname="col-3"
                        style={{paddingRight: '16px'}}
                        label="Ubigeo entrega"
                        disabled={true}
                    />
                </div>
                <div className="row-zyx">
                    <InputFormk
                        valuedefault={rowselected?.pickup_address || ""}
                        classname="col-3"
                        label="Dirección recojo"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.pickup_reference || ""}
                        classname="col-3"
                        label="Referencia recojo"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.pickup_contact_name || ""}
                        classname="col-3"
                        label="Contacto recojo"
                        disabled={true}
                    />
                    <InputFormk
                        valuedefault={rowselected?.pickup_phone || ""}
                        classname="col-3"
                        label="Teléfono recojo"
                        disabled={true}
                    />
                </div>
                <div className="row-zyx" >
                    <InputFormk
                        style={{paddingRight: '16px'}}
                        valuedefault={rowselected?.pickup_ubigeo || ""}
                        classname="col-3"
                        label="Ubigeo recojo"
                        disabled={true}
                    />
                </div>
            </DialogContent>
            <DialogActions>
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
    )
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
                method: rowselected.status === "PENDIENTE" ? "SP_ASSIGN_ORDER_WEB" : "SP_REASIGN_ORDER",
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
    const [openmodalinfo, setopenmodalinfo] = useState(false)

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
                                    selectrow2(props.cell.row.original);
                                }}
                            >
                                <VisibilityIcon
                                    fontSize="inherit"
                                    size="small"
                                />
                            </IconButton>
                            {true &&
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
                            }
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
                Header: "F. REGISTRO",
                accessor: "date_created"
            },
            {
                Header: "CONDUCTOR",
                accessor: "driver_name"
            },
            {
                Header: "CLIENTE",
                accessor: "client_name"
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
    const selectrow2 = (row) => {
        setopenmodalinfo(true);
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
            <InfoModal
                openModal={openmodalinfo}
                setOpenModal={setopenmodalinfo}
                rowselected={rowselected}
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