import poolDeploy from "../lib/DbNeon.js";
import poolLocal from "../lib/DbLocal.js";
import { validateIdentifier } from "../helper/validateName.js";


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

//Servicio de Alterar Nombre de tablas: tablename --> tablename_local
export const AlterTableNameLocal = async(TableName) => {
    try {

        const safeName = validateIdentifier(TableName)

        await poolLocal.query(
            `
            ALTER TABLE ${safeName}
            RENAME TO ${safeName}_local;
            `
        )
        return console.log(`El Nombre de la Tabla ha sido Actualizado por: ${TableName}_local`)
    } catch (error) {
        console.log(`Error en AlterTableNameLocal: ${error}`)
    }
}

//Servicio de Actualizacion de datos dentro de las Tablas Local
export const prepareTable = async(TableName) => {
    try {

        const safeName = validateIdentifier(TableName)

        //Inicializar Transsacion
        await poolLocal.query('BEGIN;')
        //Limpiar Tablas que finalicen en '_local'
        await poolLocal.query(
            `TRUNCATE TABLE ${safeName}_local;`
        )
        //Insertar Datos desde la Tabla Foranea hasta la tabla local
        await poolLocal.query(
            `
            INSERT INTO ${safeName}_local
            SELECT * FROM ${safeName};
            `,
        );
        //Terminar Transaccion
        await poolLocal.query('COMMIT;')
        //Retornar Respuesta
        return console.log(`Tabla ${safeName} ha sido Actualizada`);
    } catch (error) {
        //Ejecutar ROLLBACK Sí hubo algun error
        await poolLocal.query(
            "ROLLBACK;"
        )
        return console.log(`Rollback de Prevencion Ejecutado, Error: ${error}`)
    }
}

//Servicio de Eliminacion de Tablas No Coincidentes
export const DropTable = async(TableName) => {
    try {

        const safeName = validateIdentifier(TableName)

        const result = await poolLocal.query(
            `DROP TABLE ${safeName};`
        )
        return console.log(`Tabla Eliminada: ${safeName}`);
    } catch (error) {
        console.log(`Error al Eliminar Tabla: ${TableName}`)
        return null;
    }
}

//Servicio de Obtencion de datos
export const getDataByTable = async(TableName) => {
    try {

        const safeName = validateIdentifier(TableName)

        const result = await poolDeploy.query(
            `SELECT * FROM public.${safeName};`
        );
        return result.rows;    
    } catch (error) {
        console.log("Error en migration.getDataByTable: ", error)
    }
    
}