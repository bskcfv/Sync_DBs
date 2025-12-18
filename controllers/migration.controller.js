import { getDeployTables, getLocalTables, DropTable, prepareTable, AlterTableNameLocal, getDataByTable } from "../services/migration.service.js";
import { importForeignTable, cloneTable, dropForeignTable, altertablename } from "../services/connect.service.js";

export const migration = {
    /*
    Objetivo -> Eliminar Tablas de la Base de Datos Local que no sean Coincidentes con las tablas en Deploy
        1. Obtener Nombres de las tablas Locales
        2. Obtener Nombres de las tablas Deploy
        3. Recorrer Cada 'TableName' de la Base de datos local
        4. Verificar Cuales No Coinciden y Eliminarlas
    */
    CleanSchema : async() => {
        try {
            //Servicio de Obtencion de Nombres de las Tablas Locales
            const LocalTables = await getLocalTables();
            //Servicio de Obtencion de Nombres de las Tablas en Deploy
            const DeployTables = await getDeployTables();
            //Recorrer Las Tablas Locales
            for(let LocalTable of LocalTables){
                //Funcion some() -> Retornar True Sí Alguna de las Tablas Deploy Matchea con la Tabla Local que esté siendo recorrida
                const match = DeployTables.some(DeployTable => DeployTable.tablename === LocalTable.tablename)
                //Sí No Hubo Match, Eliminar Tabla de la Base de Datos Local
                if(!match) await DropTable(LocalTable.tablename)
            }
        } catch (error) {
            console.log(`Error en Controller.CleanSchema: ${error}`)
        }
    },
    /*
    Objetivo -> Agregar tablas faltantes en la base de datos Local en Base a la base de datos Deploy
        1. Obtener Nombres de las tablas Locales
        2. Obtener Nombres de las tablas Deploy
        5. Recorrer Tablas En Deploy
        6. Verificar que tablas faltan
        7. Importar la tablas de la base de datos Deploy
        8. Clonar la tablas en la db local
        9. Eliminar tablas importadas de la db local
        9. Actualizar nombre de las tablas locales
    */
    importTables : async() => {
        try {
            //Llamado al servicio de Obtener Nombre de Tablas Local
            const LocalTables = await getLocalTables();
            //Llamado al servicio de Obtener nombre de Tablas Deploy
            const DeployTables = await getDeployTables();
            //Recorrer las tablas en Deploy
            for(let DeployTable of DeployTables){
            //Recorrer las tablas Locales, y verificar sí hay coincidencia con la tabla deploy que esté siendo recorrida
            const match = LocalTables.some(LocalTable => LocalTable.tablename === DeployTable.tablename)
            //Sí no hubo match, es porque la tabla no está en la DB Local, se debe Agregar
                if(!match){
                    //Importar desde la DataBase en Deploy, la tabla Faltante (Crear una FOREIGN TABLE)
                    await importForeignTable(DeployTable.tablename)
                    //Clonar la tabla importada dentro de la Base de Datos Local
                    await cloneTable(DeployTable.tablename)
                    //Eliminar la tabla Importada (Eliminar la FOREIGN TABLE)
                    await dropForeignTable(DeployTable.tablename)
                    //Actualizar el Nombre Como las tablas en Deploy
                    await altertablename(DeployTable.tablename)
                }
            }
        } catch (error) {
            console.log(`Error en Controller.imporTables: ${error}`)
        } 
    },
    /*
    Objetivo -> Despues de Limpiar las tablas (TRUNCATE), Insertar Toda la data (Con Cambios Sí Hubo) al Iniciar el Servidor
        **Al ejecutar Este proceso, las tablas ya están sincronizadas**
        1. Obtener el Nombre de las tablas Locales 
        2. Recorrer el nombre de cada tabla
        3. Alterar el Nombre de la tabla local, para evitar conflictos con la tabla Foranea
        4. Importar la tabla foranea
        5. Servicio prepareTable():
            - Inicia la transaccion
            - Limpiar (TRUNCATE) la tabla
            - Insertar los datos de la tabla foranea en la tabla local
            - Cerrar la Transaccion
        6. Eliminar la tabla foranea
        7. Resturar el Nombre de la tabla Local
    */
    prepareTables : async() =>{
        try {
            //Servicio de obtencion de Nombre de las Tablas
            const tables = await getLocalTables();
            //Recorrer Cada Fila Con el Nombre de la Respectiva Tabla
            for(let table of tables){
                //Servicio de Pasar los Nombres 'tablename' a 'tablename_local' para evitar conflictos
                await AlterTableNameLocal(table.tablename)
                //Servicio de Importar las tablas en Deploy (CREAR FOREIGN TABLE)
                await importForeignTable(table.tablename)
                //Servicio de Actualizacion de datos
                await prepareTable(table.tablename)
                //Servicio de Eliminar FOREIGN TABLE
                await dropForeignTable(table.tablename)
                //Servicio de restaurar los nombres: 'tablename_local' -> 'tablename'
                await altertablename(table.tablename)
            }
            //Retornar Mensaje de Proceso Exitoso
            return console.log("Datos Preparados Y Actualizados")
        } catch (error) {
            return console.log(`Error en migration.prepareTables: ${error}`)
        }
    }
}