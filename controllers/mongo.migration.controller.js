import { getCollections, createCollections, dropCollection, insertTo, truncateCollection } from "../services/mongo.migration.service.js";
import { getDeployTables, getDataByTable } from "../services/migration.service.js";


//Recuerdate Cabezon -> Async No Funciona Con Foreach

export const mongoController = {
    /*
    Objetivo -> Coincidir Tablas y Colecciones
    Pasos:
        Obtener Nombre de las tablas de Postgres
        Obtener Nombre de las Colecciones Existentes
        Eliminar No Coincidentes
    */
    cleanSchema : async() => {
        try {
            //Obtener Tablas en Deploy
            const deployTables = await getDeployTables();
            //Obtener Colecciones de Mongo
            const mongoCollections = await getCollections();
            //Iterar Cada Coleccion
            for(let collection of mongoCollections){
                //Recorrer cada tabla en deploy, y verificar Sí existe alguna coleccion coincidente
                const match = deployTables.some(table => table.tablename === collection.name)
                //Sí no hay coincidencias, esa coleccion no debería existir, hay que eliminarla
                if(!match) await dropCollection(collection.name)
            }
        } catch (error) {
            console.log("Error en mongoController.cleanSchema: ", error)
        }
    },
    importTables : async() => {
        try {
            //Array que va a ser Procesado
            const tablenames = [];
            //Obtener Tablas en Deploy
            const deployTables = await getDeployTables();
            //Obtener Colecciones de Mongo
            const mongoCollections = await getCollections();
            //Preparar Array Con solo los nombres
            deployTables.forEach(table => {
                tablenames.push(table.tablename)
            })
            /*
            Objetivo -> Depurar el Array que vamos a Usar
            Contexto:
                tenemos un array con todos los nombres de la base de datos Central.
                debemos buscar cuales colecciones ya existen para no volver a crearlas.
                por lo tanto, debemos hacer una busqueda, mirar coincidentes, y sacarlos del array.
            */
            //Iterar Cada Coleccion
            for(let collection of mongoCollections){
                //Recorrer cada tabla en deploy, y verificar Sí existe alguna coleccion coincidente
                const match = tablenames.some(name => name === collection.name)
                //Sí hay coincidencias, sacar el nombre de la tabla proveniente del array
                if(match) {
                    //Buscar el Indice Segun el Nombre
                    const index = tablenames.indexOf(collection.name)
                    //Eliminarlo Mediante el Indice
                    tablenames.splice(index, 1)
                }
            }
            //Validar Sí es necesario Importar Colecciones
            if(tablenames.length == 0){
                console.log("Colecciones Al día")
                return;
            }
            //Crear Colleciones Con los Datos Depurados Obtenidos
            await createCollections(tablenames)
            console.log("Colleciones Creadas Correctamente!")
        } catch (error) {
            console.log("Error en mongoController.importTables: ", error)
        }
    },
    /* Controlador en Cuarentena -_- No se Acerque Porfavor */
    /*
        Objetivo -> Obtener Todos los datos de la base de datos Principal, y migrarlos a MongoDb
            Pasos:
                1. Obtener el Nombre de las tablas
                2. Recorrer cada tabla
                3. Obtener todos los datos de cada tabla
    */
    getData : async() =>{
        try {
            //Servicio de Obtener Nombre de las Tablas
            const tables = await getDeployTables();
            //Recorrer Cada Tabla
            for(let table of tables){
                //Visualizar en Consola
                console.log(`Tabla ${table.tablename} en Deploy Localizada`)
                //Servicio de Obtencion de Datos de la tabla
                const data = await getDataByTable(table.tablename)
                //Visualizar los Datos de la tabla
                //console.log(data)
                //console.log(Object.keys(data))
                //console.log(Object.values(data))

                //Limpiar la Coleccion
                await truncateCollection(table.tablename)
                //Insertar Datos en Cada Coleccion
                await insertTo(table.tablename, data)
                
            }
        } catch (error) {
            console.log(error)
        }
        
    }
}