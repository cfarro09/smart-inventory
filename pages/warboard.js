import React, { useState, useContext, useEffect, useCallback } from 'react';
import Layout from '../components/system/layout/layout';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import SelectFunction from '../components/system/form/select-function';
import triggeraxios from '../config/axiosv2';
import { validateResArray } from '../config/helper';
import * as XLSX from 'xlsx';
import TableZyx from '../components/system/form/table-simple';
import popupsContext from '../context/pop-ups/pop-upsContext';

const paramTemplate = {
    method: "SP_SEL_TEMPLATE",
    data: { id_corporation: null, id_organization: null, status: 'ACTIVO' }
}

const templateselected = [
    {
        "columnbd": "guide_number",
        "columnbddesc": "numero_guia",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "numero_guia",
        "type": "int"
    },
    {
        "columnbd": "seg_code",
        "columnbddesc": "codigo_seguimiento",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "codigo_seguimiento",
        "type": "int"
    },
    {
        "columnbd": "pickup_contact_name",
        "columnbddesc": "recojo_contacto",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_contacto",
        "type": "int"
    },
    {
        "columnbd": "pickup_document_type",
        "columnbddesc": "recojo_tipo_documento",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_tipo_documento",
        "type": "int"
    },
    {
        "columnbd": "pickup_document",
        "columnbddesc": "recojo_documento",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_documento",
        "type": "int"
    },
    {
        "columnbd": "pickup_phone",
        "columnbddesc": "recojo_telefono",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_telefono",
        "type": "int"
    },
    {
        "columnbd": "pickup_address",
        "columnbddesc": "recojo_direccion",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_direccion",
        "type": "int"
    },
    {
        "columnbd": "pickup_reference",
        "columnbddesc": "recojo_referencia",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_referencia",
        "type": "int"
    },
    {
        "columnbd": "pickup_district",
        "columnbddesc": "recojo_distrito",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_distrito",
        "type": "int"
    },
    {
        "columnbd": "pickup_department",
        "columnbddesc": "recojo_departamento",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_departamento",
        "type": "int"
    },
    {
        "columnbd": "pickup_province",
        "columnbddesc": "recojo_provincia",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "recojo_provincia",
        "type": "int"
    },
    {
        "columnbd": "delivery_contact_name",
        "columnbddesc": "entrega_contacto",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_contacto",
        "type": "int"
    },
    {
        "columnbd": "delivery_document_type",
        "columnbddesc": "entrega_tipo_documento",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_tipo_documento",
        "type": "int"
    },
    {
        "columnbd": "delivery_document",
        "columnbddesc": "entrega_documento",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_documento",
        "type": "int"
    },
    {
        "columnbd": "delivery_phone",
        "columnbddesc": "entrega_telefono",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_telefono",
        "type": "int"
    },
    {
        "columnbd": "delivery_address",
        "columnbddesc": "entrega_direccion",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_direccion",
        "type": "int"
    },
    {
        "columnbd": "delivery_reference",
        "columnbddesc": "entrega_referencia",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_referencia",
        "type": "int"
    },
    {
        "columnbd": "delivery_district",
        "columnbddesc": "entrega_distrito",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_distrito",
        "type": "int"
    },
    {
        "columnbd": "delivery_department",
        "columnbddesc": "entrega_departamento",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_departamento",
        "type": "int"
    },
    {
        "columnbd": "delivery_province",
        "columnbddesc": "entrega_provincia",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "entrega_provincia",
        "type": "int"
    },
    {
        "columnbd": "product_name",
        "columnbddesc": "producto_nombre",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "producto_nombre",
        "type": "int"
    },
    {
        "columnbd": "product_description",
        "columnbddesc": "producto_descripcion",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "producto_descripcion",
        "type": "int"
    },
    {
        "columnbd": "product_size",
        "columnbddesc": "producto_tamaño",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "producto_tamaño",
        "type": "int"
    },
    {
        "columnbd": "product_quantity",
        "columnbddesc": "producto_cantidad",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "producto_cantidad",
        "type": "int"
    },
    {
        "columnbd": "product_weight",
        "columnbddesc": "producto_peso",
        "obligatory": true,
        "obligatorycolumn": true,
        "selected": true,
        "keyexcel": "producto_peso",
        "type": "int"
    }
]

const BulkLoad = () => {

    const { setOpenSnackBack, setOpenBackdrop } = useContext(popupsContext);

    const [valuefile, setvaluefile] = useState('')
    const [isload, setisload] = useState(false);
    // const [templates, settemplates] = useState([]);

    // const [templateselected, settemplateselected] = useState(templatedefault);

    const [template, settemplate] = useState(null);

    const [datatable, setdatatable] = useState({
        columns: [],
        rows: []
    })


    const handlerinsertload = async () => {
        setOpenBackdrop(true);
        const res = await triggeraxios('post', '/api/order/massive_load', { data: datatable.rows })
        setOpenBackdrop(false);
        if (res.success) {
            setOpenSnackBack(true, { success: true, message: 'La carga fue insertada satisfactoriamente.' });
            setisload(false);
            setdatatable({
                columns: [],
                rows: {}
            });
        } else {
            setOpenSnackBack(true, { success: false, message: res.msg });
        }
    }

    const handleChange = (files) => {
        const selectedFile = files[0];

        var reader = new FileReader();

        reader.onload = (e) => {
            console.time("aux1");
            var data = e.target.result;
            let workbook = XLSX.read(data, { type: 'binary' });
            const wsname = workbook.SheetNames[0];
            const ws = workbook.Sheets[wsname];

            let rowsx = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[wsname]
            );
            console.timeEnd("aux1");
            const listtransaction = [];

            try {
                console.time("aux2");
                if (rowsx instanceof Array) {
                    for (let i = 0; i < rowsx.length; i++) {
                        const r = rowsx[i];

                        const datarow = {};

                        for (const [key, value] of Object.entries(r)) {
                            const keycleaned = key;

                            const dictionarykey = templateselected.find(k => RegExp(keycleaned, 'gi').test(k.keyexcel));

                            if (dictionarykey) {
                                if (dictionarykey.obligatory && !value) {
                                    throw `La fila ${i}, columna ${key} está vacia.`;
                                }

                                datarow[dictionarykey.columnbd] = value;
                            }
                        }
                        let columnerror = "";
                        const completed = templateselected.filter(x => x.obligatory === true).every(j => {
                            if (datarow[j.columnbd])
                                return true
                            columnerror = j.keyexcel;
                            return false
                        });

                        if (!completed)
                            throw `La fila ${i + 1}, no tiene las columnas obligatorias(${columnerror}).`;

                        listtransaction.push(datarow);
                    }
                }
                console.timeEnd("aux2");
                console.time("aux3");
                let columnstoload = [];
                templateselected.forEach(k => columnstoload.push({ Header: k.keyexcel.toLocaleUpperCase(), accessor: k.columnbd }));
                setdatatable({
                    columns: columnstoload,
                    rows: listtransaction
                })
                console.timeEnd("aux3");
                setisload(true);
            } catch (e) {
                setOpenSnackBack(true, { success: false, message: e });
                setdatatable({
                    columns: [],
                    rows: []
                })
                setisload(false);
            }
            setvaluefile('');
        };
        reader.readAsBinaryString(selectedFile)
    }

    // useEffect(() => {
    //     (async () => {
    //         const res = await triggeraxios('post', process.env.endpoints.selsimple, paramTemplate)
    //         settemplates(validateResArray(res, true));
    //     })();
    // }, [])

    return (
        <Layout>

            <Box display="flex" ml={1} mb={1}>
                <div style={{ display: 'flex' }}>
                    {templateselected && (
                        <>
                            <input
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                id="raised-button-file"
                                type="file"
                                value={valuefile}
                                style={{ display: 'none' }}
                                onChange={(e) => handleChange(e.target.files)}
                            />
                            <label htmlFor="raised-button-file">
                                <Button color="secondary" component="span" variant="contained">
                                    SUBIR EXCEL
                                </Button>
                            </label>
                        </>
                    )}

                    {isload &&
                        <Button
                            color="primary"
                            component="span"
                            variant="contained"
                            style={{ marginLeft: '1rem' }}
                            onClick={handlerinsertload}
                        >
                            PROCESAR
                        </Button>
                    }
                </div>
            </Box>
            {isload && (
                <TableZyx
                    columns={datatable.columns}
                    data={datatable.rows}
                />
            )}

        </Layout>
    );
}

export default BulkLoad;