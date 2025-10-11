import { getDeployTables, getLocalTables, DropTable, cleanTable } from "../services/migration.service.js";
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
            LocalTables.forEach(async(LocalTable) => {
                //Funcion some() -> Retornar True Sí Alguna de las Tablas Deploy Matchea con la Tabla Local que esté siendo recorrida
                const match = DeployTables.some(DeployTable => DeployTable.tablename === LocalTable.tablename)
                //Sí No Hubo Match, Eliminar Tabla de la Base de Datos Local
                if(!match) await DropTable(LocalTable.tablename)
            });
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
            DeployTables.forEach(async(DeployTable)=>{
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
        })
        } catch (error) {
            console.log(`Error en Controller.imporTables: ${error}`)
        } 
    },
    /*
    Objetivo -> Limpiar las Tablas Locales
    */
    prepareTables : async() =>{
        try {
            //Servicio de obtencion de Nombre de las Tablas
            const tables = await getLocalTables();
            //Recorrer Cada Fila Con el Nombre de la Respectiva Tabla
            tables.forEach(async(table) => {
                //Obtener el nombre de la Tabla en Formato String
                const tablename = JSON.stringify(table.tablename)
                //Visualizar en Consola
                console.log(`Tabla ${tablename} Localizada`);
                //Servicio de Limpiar Data de las DB Localizadas
                await cleanTable(tablename)
            });
            //Retornar Mensaje de Proceso Exitoso
            return console.log("Limpieza Exitosa")
        } catch (error) {
            return console.log(error)
        }
    },
    getDatav2 : async() => {
        try {
            
        } catch (error) {
            console.log(`Error en migration.getDataV2: ${error}`)
        }
    },
    getData : async() =>{
        try {
            //Servicio de Obtener Nombre de las Tablas
            const tables = await getDeployTables();
            //Recorrer Cada Fila Con el Nombre de la Respectiva Tabla
            tables.forEach(async(table) => {
                //Obtener el nombre de la tabla en formato String
                const tablename = JSON.stringify(table.tablename)
                //Visualizar en Consola
                console.log(`Tabla ${tablename} en Deploy Localizada`)
                //Servicio de Obtencion de Datos de la tabla
                const data = await getDataByTable(tablename)
                //Visualizar los Datos de la tabla
                data.forEach(async(row) => {
                    //const result = await postDataByTable(tablename, Object.keys(row), Object.values(row))
                    //console.log(result)
                    //const dataRow = JSON.stringify(row)
                    //console.log(Object.keys(row))
                    //console.log(Object.values(row))
                });
            });    
        } catch (error) {
            console.log(error)
        }
        
    }
}