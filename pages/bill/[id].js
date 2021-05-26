import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/system/layout/layout'
import TableZyx from '../../components/system/form/table-simple';
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

const datatosend = (id_bill_load) => ({
    method: "SP_SEL_BILL_LOAD_DETAILS",
    data: { id_bill_load }
})

const Example = () => {
    const router = useRouter();

    const { setloadingglobal, setModalQuestion, setOpenBackdrop, setOpenSnackBack } = useContext(popupsContext);
    const [datatable, setdatatable] = useState([]);
    const [datatmp, setdatatmp] = useState([]);
    const [billLoad, setBillLoad] = useState({ date_created: null, status: '' })

    console.log(datatmp);

    const processdata = React.useCallback(() => {
        const isokaylocation = datatmp.every(x => x.hallway && x.level && x.column);
        const isokayarea = datatmp.every(x => x.shrinkage !== "" && x.quarantine !== "");

        console.log({
            id_bill_load: billLoad.id_bill_load,
            data: datatmp
        });
        if (!isokayarea) {
            setOpenSnackBack(true, { success: false, message: 'Hay campos de merma y cuarentena vacios.' });
            return;
        }

        if (!isokaylocation) {
            setOpenSnackBack(true, { success: false, message: 'Hay campos de ubicación vacios.' });
            return;
        }

        const callback = async () => {
            setModalQuestion({ visible: false });
            const dattosend = {
                id_bill_load: billLoad.id_bill_load,
                data: datatmp
            }

            setOpenBackdrop(true);
            const res = await triggeraxios('post', "/api/web/bill_load/process", dattosend);
            if (res.success) {
                fetchData({ id_bill_load: billLoad.id_bill_load, continuezyx: true });
                setOpenSnackBack(true, { success: true, message: 'Carga procesada correctamente.' });
            } else
                setOpenSnackBack(true, { success: false, message: 'Hubo un error, vuelva a intentarlo' });

            setOpenBackdrop(false);
        }

        setModalQuestion({ visible: true, question: `¿Está seguro de procesar esta carga?`, callback })
    }, [datatmp]);

    const TextFieldAux = React.useCallback(({ label, column, id_bill_load_detail, index, type, quantity }) => {
        if (!datatmp.length > 0)
            return null;
        const [value, setvalue] = useState(datatmp[index][column] === null ? "" : datatmp[index][column]);
        // const [value, setvalue] = useState(0);
        return (
            <TextField
                key={`${id_bill_load_detail}-${column}`}
                disabled={billLoad.status === "PROCESADO"}
                label={label}
                autoComplete="off"
                style={{ width: '120px', marginRight: '10px' }}
                fullWidth
                type={type}
                variant="outlined"
                size="small"
                value={value}
                onChange={e => {
                    if (e.target.value !== "" && ["shrinkage", "quarantine", "scrap", "demo"].includes(column)) {
                        const numbercurrent = parseInt(e.target.value);
                        if (numbercurrent < 0) {
                            return;
                        }
                        const row = datatmp[index];
                        const numberaux = column === "shrinkage" ? (row.quarantine + row.scrap + row.demo) : (column === "demo" ? (row.quarantine + row.scrap + row.shrinkage) : (column === "scrap" ? (row.quarantine + row.demo + row.shrinkage) : (row.scrap + row.demo + row.shrinkage )));
                        if ((numberaux + numbercurrent) <= quantity) {
                            setvalue(e.target.value);
                            setdatatmp(datatmp => {
                                const aux1 = datatmp;
                                aux1[index] = { ...aux1[index], [column]: e.target.value ? parseInt(e.target.value) : 0 }
                                return aux1;
                            });
                        }
                    } else {
                        setvalue(e.target.value);
                        setdatatmp(datatmp => {
                            const aux1 = datatmp;
                            aux1[index] = { ...aux1[index], [column]: e.target.value ? parseInt(e.target.value) : 0 }
                            return aux1;
                        });
                    }
                }}
            />
        )
    }, [datatmp])

    const columns = [
        {
            Header: "COLUMNAS OBLIGATORIAS",
            accessor: "id_bill_load_detail",
            isComponent: true,
            Cell: (props) => {
                const { index, original: { id_bill_load_detail, product_quantity } } = props.cell.row;
                return (
                    <>
                        <TextFieldAux
                            id_bill_load_detail={id_bill_load_detail}
                            column="hallway"
                            label="Pasillo"
                            index={index}
                            quantity={product_quantity}
                            type="number"
                        />
                        <TextFieldAux
                            id_bill_load_detail={id_bill_load_detail}
                            column="column"
                            label="Columna"
                            index={index}
                            quantity={product_quantity}
                            type="number"
                        />
                        <TextFieldAux
                            id_bill_load_detail={id_bill_load_detail}
                            column="level"
                            label="Nivel"
                            index={index}
                            quantity={product_quantity}
                            type="number"
                        />
                        <TextFieldAux
                            id_bill_load_detail={id_bill_load_detail}
                            column="shrinkage"
                            label="Merma"
                            index={index}
                            quantity={product_quantity}
                            type="number"
                        />
                        <TextFieldAux
                            id_bill_load_detail={id_bill_load_detail}
                            column="quarantine"
                            label="Cuarentena"
                            index={index}
                            quantity={product_quantity}
                            type="number"
                        />

                        <TextFieldAux
                            id_bill_load_detail={id_bill_load_detail}
                            column="scrap"
                            label="Scrap"
                            index={index}
                            quantity={product_quantity}
                            type="number"
                        />
                        <TextFieldAux
                            id_bill_load_detail={id_bill_load_detail}
                            column="demo"
                            label="Demo"
                            index={index}
                            quantity={product_quantity}
                            type="number"
                        />
                    </>
                )
            }
        },
        {
            Header: 'CODIGO',
            accessor: 'product_code'
        },
        {
            Header: 'CANTIDAD',
            accessor: 'product_quantity'
        },
        {
            Header: 'DESCRIPCION',
            accessor: 'product_description'
        },
        {
            Header: 'COLOR',
            accessor: 'product_color'
        },

        {
            Header: 'CODIGO ALTER 1',
            accessor: 'product_alt_code1'
        },
        {
            Header: 'CODIGO ALTER 2',
            accessor: 'product_alt_code2'
        },
        {
            Header: 'METRO CUBICO/CAJA',
            accessor: 'product_cmtr_pbox'
        },
        {
            Header: 'CANTIDAD METROS CUBICOS',
            accessor: 'product_cmtr_quantity'
        },
        {
            Header: 'FECHA DE EXPIRACION',
            accessor: 'product_exp_date'
        },
        {
            Header: 'LINEA',
            accessor: 'product_line'
        },
        {
            Header: 'LOTE',
            accessor: 'product_lots'
        },
        {
            Header: 'NUM° PAQUETE',
            accessor: 'product_package_number'
        },

        {
            Header: 'SERIE',
            accessor: 'product_serie'
        },
        {
            Header: 'TAMAÑO',
            accessor: 'product_size'
        },
        {
            Header: 'UNIDAD/CAJA',
            accessor: 'product_unitp_box'
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
    ]

    const fetchData = React.useCallback(async ({ id_bill_load = 0, continuezyx = true }) => {
        setloadingglobal(true);
        const res = await triggeraxios('post', process.env.endpoints.selsimple, datatosend(id_bill_load));
        const dataarray = validateResArray(res, continuezyx);
        setdatatable(dataarray);
        if (dataarray.length > 0) {
            setBillLoad({
                id_bill_load,
                date_created: dataarray[0].date_created,
                status: dataarray[0].status,
            })
        }
        setdatatmp(dataarray.map(x => ({
            id_bill_load_detail: x.id_bill_load_detail,
            hallway: x.hallway,
            level: x.level,
            column: x.column,
            shrinkage: x.shrinkage ? x.shrinkage : 0,
            quarantine: x.quarantine ? x.quarantine : 0,
            scrap: x.scrap ? x.scrap : 0,
            demo: x.demo ? x.demo : 0,
        })))
        setloadingglobal(false)
    }, []);

    useEffect(() => {
        setdatatable([]);
        let continuezyx = true;
        if (router?.query?.id) {
            console.log({ id_bill_load: router.query.id, continuezyx });
            fetchData({ id_bill_load: router.query.id, continuezyx });
        }

        return () => continuezyx = false;
    }, [router])

    const backListLoad = () => router.push('/bill/list')

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
                        Detalle de la carga NI ID {billLoad.id_bill_load} - {billLoad.date_created}
                    </Typography>
                </div>
                {billLoad.status === "PENDIENTE" &&
                    <Button
                        color="secondary"
                        component="span"
                        variant="contained"
                        type="button"
                        onClick={processdata}
                    >
                        PROCESAR
                </Button>
                }
            </div>
            {datatmp.length > 0 &&
                <TableZyx
                    columns={columns}
                    // download={false}
                    // titlemodule='Detalle de la carga'
                    data={datatable}
                />
            }
        </Layout>
    );
}

export default Example;