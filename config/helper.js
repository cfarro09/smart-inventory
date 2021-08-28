import * as XLSX from 'xlsx';

export const validateres = (res, continuezyx) => {
    if (res.success && continuezyx)
        return res.result.data
    return [];
}

export const validateResArray = (res, continuezyx) => {
    if (res.success && res.result.data instanceof Array && continuezyx)
        return res.result.data;
    else
        console.error("Result is not array");
    return [];
}

export const getDomain = domain_name => {
    return {
        method: "fn_sel_domain",
        data: {
            domain_name,
            status: 'ACTIVO'
        }
    }
}


export const validateFile = ({ fileValue, templateSelected }) => {
    console.time("aux1");
    const data = fileValue;
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
            console.log(templateSelected);
            for (let i = 0; i < rowsx.length; i++) {
                const r = rowsx[i];

                const datarow = {};

                for (const [key, value] of Object.entries(r)) {
                    const keycleaned = key;

                    const dictionarykey = templateSelected.find(k => RegExp(keycleaned, 'gi').test(k.keyexcel));

                    if (dictionarykey) {
                        const { obligatory, columnbd, type = "string" } = dictionarykey;

                        if (obligatory && !value)
                            throw `La fila ${i}, columna ${key} está vacia y es obligatoria.`;

                        if (value) {
                            if (type === "date") {
                                if (typeof value === "number") {
                                    const posibledate = new Date((value - (25567 + 1)) * 86400 * 1000 - 1000 * 60 * 60 * 5);
                                    if (posibledate == "Invalid Date") {
                                        throw `La fila ${i + 1}, tiene la fecha mal formada "${value}" de la columna ${dictionarykey.columnbddesc}.`
                                    } else {
                                        const datecleaned = new Date(posibledate.setHours(10))
                                        datarow[columnbd] = datecleaned.toISOString().substring(0, 10);
                                    }
                                } else if (value.includes("/")){
                                    const daux = value.includes(" ") ? value.split(" ")[0].split("/") : value.split("/");
                                    const posibledate = `${daux[2]}-${daux[1]}-${daux[0]}`;
                                    if ((new Date(posibledate)) == "Invalid Date") 
                                        throw `La fila ${i + 1}, tiene la fecha mal formada "${value}" de la columna ${dictionarykey.columnbddesc}.`
                                    
                                    datarow[columnbd] = posibledate;
                                } else if (value.includes("-")) {
                                    if ((new Date(value)) == "Invalid Date") 
                                        throw `La fila ${i + 1}, tiene la fecha mal formada "${value}" de la columna ${dictionarykey.columnbddesc}.`;
                                    datarow[columnbd] = value;
                                } else {
                                    throw `La fila ${i + 1}, tiene la fecha mal formada "${value}" de la columna ${dictionarykey.columnbddesc}.`;
                                }
                            } else {
                                datarow[columnbd] = type === "string" ? value.toString() : value;
                            }
                        } else
                            datarow[columnbd] = null;
                    }
                }
                let columnerror = "";
                const completed = templateSelected.filter(x => x.obligatory === true).every(j => {
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
        templateSelected.forEach(k => columnstoload.push({ Header: k.keyexcel.toLocaleUpperCase(), accessor: k.columnbd }));

        console.timeEnd("aux3");

        return {
            success: true,
            result: {
                columns: columnstoload,
                rows: listtransaction
            }
        }
    } catch (e) {
        return {
            success: false,
            msg: e,
            result: {
                columns: [],
                rows: []
            }
        }
        setisload(false);
    }
}