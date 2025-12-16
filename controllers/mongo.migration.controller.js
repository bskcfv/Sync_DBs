import { getCollections, createCollections, dropCollection } from "../services/mongo.migration.service.js";
import { getDeployTables } from "../services/migration.service.js";


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
    }
}