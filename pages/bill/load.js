import React, { useState, useContext, useCallback, useEffect } from 'react';
import Layout from '../../components/system/layout/layout'
import TableZyx from '../../components/system/form/table-simple';
import SelectFunction from '../../components/system/form/select-function';
import ExampleMain from '../../components/example/examplemain';
import triggeraxios from '../../config/axiosv2';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import InputFormk from '../../components/system/form/inputformik';
import { validateResArray, getDomain, validateFile } from '../../config/helper';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

const datatosend = {
    method: "SP_SEL_LOAD_TEMPLATE",
    data: { status: 'ACTIVO', type: 'NOTA INGRESO' }
}

const dataRequestStore = (id_client) => ({
    method: "SP_SEL_CLIENT_STORE",
    data: {
        id_client,
        status: null
    }
})

const BulkLoad = () => {

    const { setOpenSnackBack, setOpenBackdrop } = useContext(popupsContext);

    const [valuefile, setvaluefile] = useState('')
    const [isload, setisload] = useState(false);
    const [templates, settemplates] = useState([]);
    const [templateSelected, settemplateSelected] = useState(null);
    const [template, settemplate] = useState(null);
    const [selectStore, setSelectStore] = useState(null);
    const [dataStore, setDataStore] = useState([]);

    const [entranceGuide, setEntranceGuide] = useState('');
    const [entryPurchaseOrder, setEntryPurchaseOrder] = useState('');

    const [datatable, setdatatable] = useState({
        columns: [],
        rows: []
    })

    const handlerselecttemplate = useCallback(async ({ newValue }) => {
        if (newValue) {
            settemplate(newValue);
            settemplateSelected(JSON.parse(newValue.json_detail));

            const res = await triggeraxios('post', process.env.endpoints.selsimple, dataRequestStore(newValue.id_client));
            setDataStore(validateResArray(res, true));
        } else {
            setDataStore([]);
            settemplateSelected(null);
        }
    });

    const handlerSelectStore = useCallback(async ({ newValue }) => {
        if (newValue) {
            setSelectStore(newValue)
        } else {
            setSelectStore(null)
        }
    });

    const handlerinsertload = async () => {
        if (!selectStore) {
            setOpenSnackBack(true, { success: false, message: 'Tiene que seleccionar un almacen.' });
            return;
        }

        if (!entranceGuide || !entryPurchaseOrder) {
            setOpenSnackBack(true, { success: false, message: 'Tiene que llenar los campos faltantes.' });
            return;
        }

        const datafiltred = datatable.rows.reduce((t, x) => {
            const indexfind = t.findIndex(y => y.product_code === x.product_code && y.hallway === x.hallway && y.level === x.level && y.column === x.column);
            if (indexfind >= 0) {
                t[indexfind].product_quantity += x.product_quantity;
            } else {
                t.push(x)
            }
            return t;
        }, []);

        setOpenBackdrop(true);
        const res = await triggeraxios('post', '/api/web/bill_load', {
            id_client: template.id_client,
            id_client_store: selectStore.id_client_store,
            id_load_template: template.id_load_template,
            entrance_guide: entranceGuide,
            entry_purchase_order: entryPurchaseOrder,
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
            settemplateSelected(null);
            setSelectStore(null);
        } else {
            setOpenSnackBack(true, { success: false, message: res.msg });
        }
    }

    const handleChange = (files) => {
        const selectedFile = files[0];
        var reader = new FileReader();
        reader.onload = (e) => {
            const resprocess = validateFile({ fileValue: e.target.result, templateSelected })
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

    useEffect(() => {
        let continuezyx = true;

        (async () => {
            const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend);
            settemplates(validateResArray(res, continuezyx));
        })();
        return () => continuezyx = false;

    }, [])

    return (
        <Layout>
            <div className="row-zyx" ml={1}>
                <SelectFunction
                    title="Plantilla"
                    datatosend={templates}
                    classname="col-2"
                    optionvalue="json_detail"
                    optiondesc="name"
                    callback={handlerselecttemplate}
                />
                {templateSelected &&
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
                {templateSelected &&
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
                            color="primary"
                            component="span"
                            variant="contained"
                            disabled={!selectStore}
                            style={{ marginLeft: '1rem' }}
                            onClick={handlerinsertload}
                        >
                            PROCESAR
                    </Button>
                    </div>
                }
            </div>
            {isload &&
                <div className="row-zyx" ml={1}>
                    <InputFormk
                        classname="col-2"
                        label="N° Guia ingreso"
                        valuedefault={entranceGuide}
                        callback={setEntranceGuide}
                    />
                    <InputFormk
                        classname="col-2"
                        label="OC de ingreso"
                        valuedefault={entryPurchaseOrder}
                        callback={setEntryPurchaseOrder}
                    />
                </div>
            }
            {isload && (
                <TableZyx
                    download={false}
                    columns={datatable.columns}
                    data={datatable.rows}
                />
            )}

        </Layout>
    );
}

export default BulkLoad;