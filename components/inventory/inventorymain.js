import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import popupsContext from '../../context/pop-ups/pop-upsContext';
import triggeraxios from '../../config/axiosv2';
import InputFormk from '../system/form/inputformik';
import SelectDomain from '../system/form/select-domain';
import SelectFunction from '../system/form/select-function';
import TableZyx from '../system/form/table-simple';
import DateRange from '../system/form/daterange';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { validateResArray, getDomain } from '../../config/helper';

const dataRequestKardex = (id_product, id_inventory, desde, hasta) => ({
    method: "SP_SEL_KARDEX",
    data: {
        id_product,
        id_inventory: id_inventory ? id_inventory : null,
        desde,
        hasta
    }
})

const InventaryMain = ({ title, openModal, setOpenModal, rowselected }) => {
    const { setOpenBackdrop, setModalQuestion, setOpenSnackBack } = useContext(popupsContext);
    const [kardex, setKardex] = useState([]);
    const [dateRange, setdateRange] = useState([
        {
            startDate: new Date(new Date().setDate(0)),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            key: 'selection'
        }
    ]);
    const columns = React.useMemo(
        () => [
            {
                Header: 'FECHA',
                accessor: 'date_created'
            },
            {
                Header: 'ENTRADA',
                accessor: 'entrada'
            },
            {
                Header: 'SALIDA',
                accessor: 'salida'
            },
            // {
            //     Header: 'MERMA',
            //     accessor: 'shrinkage'
            // },
            // {
            //     Header: 'CUARENTENA',
            //     accessor: 'quarantine'
            // },
            // {
            //     Header: 'SCRAP',
            //     accessor: 'scrap'
            // },
            // {
            //     Header: 'DEMO',
            //     accessor: 'demo'
            // },
            {
                Header: 'STOCK DISP',
                accessor: 'balance_available'
            },
            {
                Header: 'STOCK',
                accessor: 'balance'
            },
            {
                Header: 'LOTE',
                accessor: 'batch'
            },
            {
                Header: 'DETALLE',
                accessor: 'detalle'
            },
            {
                Header: 'REG POR',
                accessor: 'created_by'
            }
        ],
        []
    );
    const datafetch = React.useCallback(async (continuezyx = true) => {
        if (rowselected) {
            setOpenBackdrop(true)
            const res = await triggeraxios('post', process.env.endpoints.selsimple, dataRequestKardex(rowselected.id_product, rowselected.id_inventory, dateRange[0].startDate.toISOString().substring(0, 10), dateRange[0].endDate.toISOString().substring(0, 10)));
            let balance = 0;
            let balance_available = 0;
            setKardex(validateResArray(res, continuezyx).map(x => {
                balance += balance ? x.entrada - x.salida : x.balance;
                balance_available += (balance_available ? ((x.shrinkage !== 0 || x.quarantine !== 0 || x.demo !== 0 || x.scrap !== 0) ? 0 : x.entrada - x.salida) : x.balance_available);
                return {
                    ...x,
                    balance,
                    balance_available
                }
            }));
            setOpenBackdrop(false)
        }
    }, [dateRange, rowselected]);

    useEffect(() => {
        let continuezyx = true;
        if (openModal) {
            setKardex([]);
            (() => datafetch(continuezyx))();
        }
        return () => continuezyx = false;
    }, [openModal, dateRange]);

    return (
        <>
            <Dialog
                open={openModal}
                fullWidth={true}
                maxWidth='md'
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">KARDEX: {rowselected && rowselected.product_description} ({rowselected && rowselected.product_code})</DialogTitle>
                <DialogContent>
                    <div>
                        <DateRange
                            label="Filtrar rango de fecha"
                            dateRangeinit={dateRange}
                            setDateRangeExt={setdateRange}
                        />
                    </div>
                    <TableZyx
                        columns={columns}
                        // fetchData={datafetch}
                        data={kardex}
                    />
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
        </>
    );
}

export default InventaryMain; 