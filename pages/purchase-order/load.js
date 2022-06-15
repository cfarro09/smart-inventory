import React, { useState, useContext, useCallback, useEffect } from 'react';
import Layout from '../../components/system/layout/layout'
import TableZyx from '../../components/system/form/table-simple';
import SelectFunction from '../../components/system/form/select-function';
import SelectDomain from '../../components/system/form/select-domain';
import BuyerMain from '../../components/buyer/buyermain';
import triggeraxios from '../../config/axiosv2';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import InputFormk from '../../components/system/form/inputformik';
import { validateResArray, getDomain, validateFile } from '../../config/helper';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import * as XLSX from 'xlsx';
import AddIcon from '@material-ui/icons/Add';

const METHOD_INS = "SP_INS_BUYER";

const datatosend = {
    method: "SP_SEL_LOAD_TEMPLATE",
    data: { status: 'ACTIVO', type: 'ORDEN COMPRA' }
}

const dataBUYER = {
    method: "SP_SEL_BUYER",
    data: { status: 'ACTIVO', doc_number: null }
}

const dataRequestVehicle = (id_provider) => ({
    method: "SP_SEL_VEHICLE",
    data: { status: 'ACTIVO', id_provider }
})

const dataRequestProvider = {
    method: "SP_SEL_PROVIDERS",
    data: { status: 'ACTIVO' }
}

const dataRequestStore = (id_client) => ({
    method: "SP_SEL_CLIENT_STORE",
    data: {
        id_client,
        status: 'ACTIVO'
    }
})

const BulkLoad = () => {

    const { setOpenSnackBack, setOpenBackdrop } = useContext(popupsContext);
    const [valuefile, setvaluefile] = useState('')
    const [isload, setisload] = useState(false);
    const [templates, settemplates] = useState([]);
    const [templateselected, settemplateselected] = useState(null);
    const [template, settemplate] = useState(null);
    const [selectStore, setSelectStore] = useState(null);
    const [selectBuyer, setSelectBuyer] = useState(null);
    const [dataStore, setDataStore] = useState([]);
    const [dataBuyer, setDataBuyer] = useState([]);
    const [datatmp, setdatatmp] = useState([]);

    const [dataProvider, setDataProvider] = useState([]);
    const [dataVehicle, setDataVehicle] = useState([]);

    const [numberPurcharse, setNumberPurcharse] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const [idProvider, setIdProvider] = useState(0);
    const [idVehicle, setIdVehicle] = useState(0);
    const [documentType, setDocumentType] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [driverLicense, setDriverLicense] = useState('');
    const [dataStatusProduct, setDataStatusProduct] = useState([])

    const [datatable, setdatatable] = useState({
        columns: [],
        rows: []
    })

    const handlerselecttemplate = useCallback(async ({ newValue }) => {
        if (newValue) {
            settemplate(newValue);
            settemplateselected(JSON.parse(newValue.json_detail));

            const res = await triggeraxios('post', process.env.endpoints.selsimple, dataRequestStore(newValue.id_client));
            setDataStore(validateResArray(res, true));
        } else {
            setDataStore([]);
            settemplateselected(null);
        }
    }, []);

    const handlerSelectStore = useCallback(async ({ newValue }) => {
        if (newValue) {
            setSelectStore(newValue)
        } else {
            setSelectStore(null)
        }
    }, []);

    const handlerSelectBuyer = useCallback(async ({ newValue }) => {
        if (newValue) {
            setSelectBuyer(newValue);
        } else {
            setIdProvider(0);
            setSelectBuyer(null)
        }
    }, []);

    const handlerSelectProvider = useCallback(async ({ newValue }) => {
        if (newValue) {
            setIdProvider(newValue.id_provider);
            const res = await triggeraxios('post', process.env.endpoints.selsimple, dataRequestVehicle(newValue.id_provider));
            setDataVehicle(validateResArray(res, true));
        } else {
            setIdProvider(0);
            setDataVehicle([]);
        }
    }, []);

    const handlerSelectVehicle = useCallback(({ newValue }) => {
        if (newValue) {
            setIdVehicle(newValue.id_vehicle);
            setDriverLicense(newValue.driver_license)
        } else {
            setDriverLicense('');
            setIdVehicle(0);
        }
    }, []);

    const handlerinsertload = async () => {
        
        if (!selectStore) {
            setOpenSnackBack(true, { success: false, message: 'Tiene que seleccionar un almacen.' });
            return;
        }

        if (!idProvider || !idVehicle || !driverLicense) {
            setOpenSnackBack(true, { success: false, message: 'Tiene que llenar todos los campos de la orden de compra.' });
            return;
        }

        setOpenBackdrop(true);

        const datafiltred = datatmp.reduce((t, x) => {
            const indexfind = t.findIndex(y => y.product_code === x.product_code && y.discount_from === x.discount_from);
            if (indexfind >= 0) {
                t[indexfind].product_quantity += x.product_quantity;
            } else {
                t.push(x)
            }
            return t;
        }, []);
        const res = await triggeraxios('post', '/api/web/purchase_order', {
            id_client: template.id_client,
            purchase_order_number: numberPurcharse,
            id_buyer: selectBuyer.id_buyer,
            id_client_store: selectStore.id_client_store,
            id_load_template: template.id_load_template,
            id_provider: idProvider,
            id_vehicle: idVehicle,
            document_type: documentType,
            document_number: documentNumber,
            driver_license: driverLicense,
            data: datafiltred
        })
        setOpenBackdrop(false);
        if (res.success) {
            setOpenSnackBack(true, { success: true, message: 'La carga fue insertada satisfactoriamente.' });
            setisload(false);
            setdatatable({
                columns: [],
                rows: {}
            });
            settemplateselected(null);
            setSelectStore(null);
            setSelectBuyer(null);
        } else {
            setOpenSnackBack(true, { success: false, message: res.msg });
        }
    }

    const handleChange = (files) => {
        const selectedFile = files[0];

        var reader = new FileReader();

        reader.onload = (e) => {
            const resprocess = validateFile({ fileValue: e.target.result, templateSelected: templateselected })
            console.log(resprocess.result.columns);
            setdatatmp(resprocess.result.rows.map(x => ({ ...x, discount_from: 'available' })))
            resprocess.result.columns.push({
                Header: "Descontar de",
                accessor: "id_bill_load_detail",
                isComponent: true,
                Cell: (props) => {
                    const { index } = props.cell.row;
                    return (
                        <SelectDomain
                            title="Descontar de"
                            domainname={dataStatusProduct}
                            valueselected="available"
                            callback={React.useCallback(({ newValue }) => {
                                setdatatmp(datatmp => {
                                    const aux1 = datatmp;
                                    aux1[index] = { ...aux1[index], "discount_from": newValue.domain_value }
                                    return aux1;
                                });
                            }, [datatmp])}
                        />
                    )
                }
            });
            setdatatable(resprocess.result);
            if (resprocess && resprocess.success) {
                setisload(true);
            } else {
                setOpenSnackBack(true, { success: false, message: resprocess.msg });
                setisload(false);
            }
            setvaluefile('');
        };
        reader.readAsBinaryString(selectedFile)
    }

    const fechtDataBuyer = React.useCallback(() => {
        triggeraxios('post', process.env.endpoints.selsimple, dataBUYER).then(r => setDataBuyer(validateResArray(r, true)))
    }, []);

    useEffect(() => {
        let continuezyx = true;

        (async () => {
            await Promise.all([
                triggeraxios('post', process.env.endpoints.selsimple, datatosend).then(r => settemplates(validateResArray(r, continuezyx))),
                triggeraxios('post', process.env.endpoints.selsimple, dataBUYER).then(r => setDataBuyer(validateResArray(r, continuezyx))),
                triggeraxios('post', process.env.endpoints.selsimple, dataRequestProvider).then(r => setDataProvider(validateResArray(r, continuezyx))),
                triggeraxios('post', process.env.endpoints.selsimple, getDomain("ESTADOPRODUCTO")).then(r => setDataStatusProduct(validateResArray(r, continuezyx))),
                // triggeraxios('post', process.env.endpoints.selsimple, dataRequestVehicle).then(r => setDataVehicle(validateResArray(r, continuezyx))),
            ]);

        })();

        return () => continuezyx = false;
    }, [])

    return (
        <Layout>
            <Box component={Paper} pt={3} pb={2} pl={3}>
                <div className="row-zyx">
                    <SelectFunction
                        title="Plantilla"
                        datatosend={templates}
                        classname="col-2"
                        optionvalue="json_detail"
                        optiondesc="name"
                        callback={handlerselecttemplate}
                    />
                    {templateselected &&
                        <>
                            <InputFormk
                                classname="col-2"
                                label="Cliente"
                                disabled={true}
                                valuedefault={template ? template.client_name : ""}
                            />
                            <SelectFunction
                                classname="col-2"
                                title="Almacen"
                                datatosend={dataStore}
                                callback={handlerSelectStore}
                                optionvalue="id_client_store"
                                optiondesc="store_name"
                            />
                        </>
                    }
                    {templateselected &&
                        <div className="col-2 text-center">
                            <input
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                id="raised-button-file"
                                type="file"
                                value={valuefile}
                                style={{ display: 'none' }}
                                onChange={(e) => handleChange(e.target.files)}
                            />
                            <label htmlFor="raised-button-file">
                                <Button
                                    fullWidth
                                    color="secondary"
                                    component="span"
                                    variant="contained">
                                    SUBIR EXCEL
                            </Button>
                            </label>
                        </div>
                    }

                    {isload &&
                        <div className="col-2">
                            <Button
                                fullWidth
                                color="primary"
                                component="span"
                                variant="contained"
                                style={{ marginLeft: '1rem' }}
                                disabled={!selectStore || !selectBuyer || !numberPurcharse}
                                onClick={handlerinsertload}
                            >
                                PROCESAR
                        </Button>
                        </div>
                    }
                </div>

            </Box>
            {isload &&
                <Box component={Paper} pt={3} pb={2} pl={3} mt={3}>
                    <Typography variant="h6" id="tableTitle" component="div">
                        Detalle de la orden de compra
                    </Typography>
                    <div className="row-zyx" style={{ marginTop: '1rem' }}>
                        <InputFormk
                            classname="col-3"
                            label="N° Orden Compra"
                            valuedefault={numberPurcharse}
                            callback={setNumberPurcharse}
                        />
                        <SelectFunction
                            title="Comprador"
                            datatosend={dataBuyer}
                            classname="col-4"
                            optionvalue="id_buyer"
                            callback={handlerSelectBuyer}
                            optiondesc="full_name"
                        />
                        <div className="col-3">
                            <Button
                                color="secondary"
                                component="span"
                                onClick={() => setOpenModal(true)}
                                startIcon={<AddIcon />}
                                variant="contained">
                                COMPRADOR
                        </Button>
                        </div>
                    </div>
                    <div className="row-zyx" style={{ marginTop: '1rem' }}>
                        <SelectFunction
                            classname="col-3"
                            title="Transportista"
                            datatosend={dataProvider}
                            callback={handlerSelectProvider}
                            optionvalue="id_provider"
                            optiondesc="name"
                        />
                        <SelectFunction
                            classname="col-3"
                            title="Placas"
                            datatosend={dataVehicle}
                            callback={handlerSelectVehicle}
                            optionvalue="id_vehicle"
                            optiondesc="plate_number"
                        />
                        <InputFormk
                            classname="col-3"
                            label="Licencia"
                            valuedefault={driverLicense}
                            callback={setDriverLicense}
                        />
                    </div>
                    <div className="row-zyx" style={{ marginTop: '1rem' }}>
                        <InputFormk
                            classname="col-3"
                            label="TIPO DOCUMENTO"
                            valuedefault={documentType}
                            callback={setDocumentType}
                        />
                        <InputFormk
                            classname="col-3"
                            label="N° DOCUMENTO"
                            valuedefault={documentNumber}
                            callback={setDocumentNumber}
                        />
                    </div>
                </Box>
            }

            {isload && (
                <div style={{ marginTop: '1rem' }}>
                    <TableZyx
                        download={false}
                        columns={datatable.columns}
                        data={datatable.rows}
                    />
                </div>
            )}
            <BuyerMain
                title="Comprador"
                method_ins={METHOD_INS}
                openModal={openModal}
                setOpenModal={setOpenModal}
                fetchDataUser={fechtDataBuyer}
            />
        </Layout>
    );
}

export default BulkLoad;