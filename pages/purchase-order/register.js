import React, { useState, useContext, useEffect } from 'react';
import Layout from '../../components/system/layout/layout'
import TableZyx from '../../components/system/form/table-paginated'
import triggeraxios from '../../config/axiosv2';
import Typography from '@material-ui/core/Typography';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import { getDomain, validateResArray } from '../../config/helper';
import SelectFunction from '../../components/system/form/select-function';
import InputFormk from '../../components/system/form/inputformik';
import Button from '@material-ui/core/Button';
import HistoryIcon from '@material-ui/icons/History';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SelectDomain from '../../components/system/form/select-domain';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

const REQUESTCLIENT = {
    method: "SP_SEL_CLIENT",
    data: { status: 'ACTIVO' }
}

const REQUESTPRODUCTS = (id_client_store) => ({
    method: "SP_LST_PRODUCTS",
    data: { id_client_store }
})

const dataRequestStore = (id_client) => ({
    method: "SP_SEL_CLIENT_STORE",
    data: {
        id_client,
        status: null
    }
})

const dataRequestProducts = (id_product, id_client_store) => ({
    method: "SP_SEL_PRODUCT_BY_CODE",
    data: {
        id_product,
        id_client_store
    }
})

const TYPEREPORTS = [
    { id: "DETALLADO", description: "DETALLADO" },
    { id: "CONSOLIDADO", description: "CONSOLIDADO" },
]

const Example = () => {

    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [phoneclient, setphoneclient] = useState("")
    const [nameclient, setnameclient] = useState("")
    const [dateexit, setdateexit] = useState("")
    const [documenttype, setdocumenttype] = useState("")
    const [documentnumber, setdocumentnumber] = useState("")
    const [productToAdd, setProductToAdd] = useState(null)
    const [domains, setdomains] = useState({ doc_type: [] });


    const [datafetch, setdatafetch] = useState({})
    const [dataProducts, setDataProducts] = useState([]);

    const [resultproducts, setresultproducts] = useState([]);

    const [listproducts, setlistproducts] = useState([]);

    console.log(listproducts)

    const [dataClient, setDataClient] = useState([]);
    const [dataStore, setDataStore] = useState([]);
    const [selected, setSelected] = useState({ id_client_store: 0, id_client: 0 })

    const handlerSelectClient = React.useCallback(async ({ newValue }) => {
        if (newValue) {
            setDataProducts([])

            setSelected({ ...selected, id_client: newValue.id_client });
            const res = await triggeraxios('post', process.env.endpoints.selsimple, dataRequestStore(newValue.id_client));
            setDataStore(validateResArray(res, true));
        } else {
            setDataProducts([])
            setSelected({ ...selected, id_client: 0 });
            setDataStore([]);
        }
    });

    const handlerSelectStore = React.useCallback(async ({ newValue }) => {
        setlistproducts([])
        if (newValue) {
            setSelected({ ...selected, id_client_store: newValue.id_client_store });
            triggeraxios('post', process.env.endpoints.selsimple, REQUESTPRODUCTS(newValue.id_client_store)).then(r => setDataProducts(validateResArray(r, true).map(x => ({ ...x, description: `${x.product_code} - ${x.product_description}` }))))
        }
        else {
            setDataProducts([])
            setSelected({ ...selected, id_client_store: 0 });
        }
    });

    useEffect(() => {
        let continuezyx = true;
        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, REQUESTCLIENT).then(r => setDataClient(p => (validateResArray(r, continuezyx)))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("TIPODOCUMENTOCLIENTE")).then(r => setdomains(p => ({ ...p, doc_type: validateResArray(r, continuezyx) }))),
            ]);
        })();
        return () => continuezyx = false;
    }, [])

    const searchProduct = () => {
        if (!productToAdd || !selected?.id_client_store)
            return;

        triggeraxios('post', process.env.endpoints.selsimple, dataRequestProducts(productToAdd.id_product, selected.id_client_store)).then(r => {
            const batches = validateResArray(r, true);
            setlistproducts([...listproducts, { ...batches[0], batches: batches.map(x => ({...x, description: `${x.batch} - ${x.product_exp_date}`})), product_code: productToAdd.product_code }])
        })
    }

    const sendx = () => {
        const aa = {
            ...selected,
            client_phone: phoneclient,
            exit_date: dateexit,
            document_type: documenttype,
            document_number: documentnumber,
            client_name: nameclient
        }
        const ss = listproducts.map(x => ({
            ...x,
            product_quantity: x.available,
            batches: undefined
        }))

        if (!aa.client_phone || !aa.exit_date || !aa.document_type || !aa.document_number || !aa.id_client_store) {
            setOpenSnackBack(true, { success: true, message: 'Tiene que llenar todos los campos' });
            return;
        }

        if (ss.length === 0) {
            setOpenSnackBack(true, { success: false, message: 'No tiene productos seleccionados' });
            return;
        }
        aa.data = ss;

        const callback = async () => {
            setModalQuestion({ visible: false })

            setOpenBackdrop(true);
            const res = await triggeraxios('post', "/api/web/purchase_order/register", aa);
            if (res.success) {
                setOpenSnackBack(true, { success: true, message: 'Se registró con exito' });

                setTimeout(() => {
                    location.reload()
                }, 500);
            } else {
                setOpenSnackBack(true, { success: false, message: !res.msg ? 'Hubo un error, vuelva a intentarlo' : res.msg });
            }
            setOpenBackdrop(false)
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de enviar la data?`, callback })
    }

    return (
        <Layout>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Typography variant="h6" component="div" style={{ marginBottom: '.5rem' }}>
                        Registro de venta
                    </Typography>
                    <Button
                        color="primary"
                        component="span"
                        variant="contained"
                        onClick={sendx}
                        disabled={dataProducts.length === 0}
                    >
                        ENVIAR
                    </Button>
                </div>
                <div>
                    <div className="row-zyx">
                        <InputFormk
                            label="Fecha salida"
                            type="date"
                            classname="col-6"
                            callback={setdateexit}
                        />
                        <InputFormk
                            label="Teléfono cliente"
                            classname="col-6"
                            callback={setphoneclient}
                        />
                    </div>
                    <div className="row-zyx">
                        <SelectFunction
                            title="Cliente"
                            datatosend={dataClient}
                            optionvalue="id_client"
                            optiondesc="company_name"
                            classname="col-6"

                            callback={handlerSelectClient}
                        />
                        <SelectFunction
                            title="Almacen"
                            datatosend={dataStore}
                            callback={handlerSelectStore}
                            classname="col-6"
                            optionvalue="id_client_store"
                            optiondesc="store_name"
                        />
                    </div>
                    <div className="row-zyx">
                        <SelectDomain
                            title="Tipo Doc"
                            classname="col-6"
                            domainname={domains.doc_type}
                            namefield="doc_type"
                            callback={({ newValue }) => setdocumenttype(newValue?.domain_value || "")}
                        />
                        <InputFormk
                            label="N° Documento"
                            classname="col-6"
                            callback={setdocumentnumber}
                        />
                    </div>
                    <div className="row-zyx">
                        <InputFormk
                            label="Cliente final"
                            classname="col-6"
                            callback={setnameclient}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 8, padding: 20, backgroundColor: '#e1e1e1' }}>
                        <div style={{ width: 500 }}>
                            <SelectFunction
                                title="SKU"
                                datatosend={dataProducts}
                                callback={({ newValue }) => setProductToAdd(newValue || null)}
                                optionvalue="product_code"
                                optiondesc="description"
                            />
                        </div>
                        <Button
                            color="primary"
                            component="span"
                            variant="contained"
                            onClick={searchProduct}
                            disabled={dataProducts.length === 0}
                        >
                            BUSCAR
                        </Button>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Producto</TableCell>
                                        <TableCell>Lote</TableCell>
                                        <TableCell>Salida</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {listproducts.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.product_description}</TableCell>
                                            <TableCell>
                                                <SelectFunction
                                                    datatosend={item.batches}
                                                    callback={({ newValue }) => {
                                                        setlistproducts(listproducts.map((y, index1) => index === index1 ? {
                                                            ...item,
                                                            batch: (newValue?.batch || ""),
                                                            id_inventory: (newValue?.id_inventory || 0),
                                                            product_exp_date: newValue?.product_exp_date || "",
                                                            available: (newValue?.available || 0),
                                                            availablemax: (newValue?.available || 0),
                                                        } : y))
                                                    }}
                                                    valueselected={item.batch}
                                                    classname="col-6"
                                                    optionvalue="batch"
                                                    optiondesc="description"
                                                />
                                            </TableCell>
                                            <TableCell width={150}>
                                                <InputFormk
                                                    label=""
                                                    type="number"
                                                    valuedefault={item.available || ""}
                                                    callback={(available1) => {
                                                        const available = parseInt(available1 || "0") < 0 ? item.availablemax : parseInt(available1 || "0");
                                                        setlistproducts(listproducts.map((y, index1) => (index === index1 && item.availablemax >= available) ? {
                                                            ...item,
                                                            available
                                                        } : y))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell width={30}>
                                                <div style={{ display: 'flex' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            console.log("index", index)
                                                            setlistproducts(listproducts.filter((x, index1) => index !== index1))
                                                        }}
                                                    >
                                                        <DeleteIcon style={{ color: '#777777' }} />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </div>
                </div>


            </div>

        </Layout>
    );
}

export default Example;