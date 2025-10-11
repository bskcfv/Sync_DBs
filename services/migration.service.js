import poolDeploy from "../lib/DbNeon.js";
import poolLocal from "../lib/DbLocal.js";


//Servicio de Obtencion de Tablas Deploy
export const getDeployTables = async() =>{
    const result = await poolDeploy.query(
        `
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE pg_tables.schemaname = 'public'
        ORDER BY tablename ASC;
        `
    );
    return result.rows
}

//Servicio de Obtencion de Tablas Local
export const getLocalTables = async() =>{
    const result = await poolLocal.query(
        'SELECT * FROM SHOWTABLES;'
    );
    return result.rows;
}

//Servicio de Limpieza de Tablas Local
export const cleanTable = async(TableName) => {
    const result = poolLocal.query(
        `TRUNCATE TABLE ${TableName};`,
    );
    return console.log(`Tabla ${TableName} ha sido Limpiada`);
}

//Servicio de Eliminacion de Tablas No Coincidentes
export const DropTable = async(TableName) => {
    try {
        const result = await poolLocal.query(
            `DROP TABLE ${TableName};`
        )
        return console.log(`Tabla Eliminada: ${TableName}`);
    } catch (error) {
        console.log(`Error al Eliminar Tabla: ${TableName}`)
        return null;
    }
}

//Servicio de Obtencion de datos
export const getDataByTable = async(TableName) => {
    const result = poolDeploy.query(
        `SELECT * FROM ${TableName};`
    );
    return (await result).rows;
}

//Servicio de Insercion de datos
export const postDataByTable = async(TableName, fields, values) =>{
    //preparedStatement -> Declarar Insert Según Tabla
    let preparedStatement = `INSERT INTO ${TableName}(`;
    //Tomar el array fields ejemplo: ['id', 'nombre', 'edad']
    //Convertirlo con .join(", ") a String -> "'id', ''nombre', 'edad'"
    //Asignar String Procesado a variable preparedFields
    let preparedFields = fields.join(", ");
    //Unir preparedStament con preparedFields con el cierre de la sentencia ')'
    preparedStatement += preparedFields + ') VALUES('
    //Recorrer Valores Respetando su Tipo de Dato
    values.forEach((value, index) => {
        //Validar el Ultimo Valor del array
        if(index === values.length - 1) {
            //agregar el ultimo valor junto al cierre de la sentencia SQL
            preparedStatement += `${value});`
        }
        else {
            //Agregar Valor Intermedio
            preparedStatement += `${value}, `
        }
    });
    //Ejecutar Insercion
    const result = await poolLocal.query(preparedStatement)
    //Retornar Numero de Filas Afectadas
    return result.rowCount
}