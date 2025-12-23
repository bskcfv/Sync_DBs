import { handlerIds } from "../helper/handlerId.js";
import ClientPromise from "../lib/DbMongo.js";

//Instanciar Objeto de Clase clientPromise
const client = await ClientPromise;
//Conectarse a la Base de Datos Receptora
const db = client.db("MirrorMongo");

//Servicio de Obtencion de Colecciones
export const getCollections = async() => {
    try {
        //Obtener Nombre de las Colecciones en Formato Array
        const collections = await db.listCollections().toArray();
        //Retornar Colecciones
        return collections;
    } catch (error) {
        console.log("Error en mongo.migration.getCollections: ", error)
    }
}

//Foreach no Puede trabajar con Promesas, No usar async o Await

//Servicio Creacion de Colecciones
export const createCollections = async(collectionName) => {
    try {
        for(let name of collectionName){
            //.listCollections(name) -> Recorre las Colecciones Existentes en la Base de Datos
            //.hasNext() -> Retorna true o false Sí existe alguna coincidencia la busqueda
            const exists = await db.listCollections({name}).hasNext();

            //Validacion
            //Sí es false, es porque No existe la coleccion en la base de datos
            //Objetivo -> Evitar Crear Colecciones Repetidamente
            if(!exists) {
                await db.createCollection(name);
                console.log("Se ha creado la Collecion: ", name)
            }
        }
    } catch (error) {
        console.log("Error en mongo.migration.createCollections: ", error)
    }
}

//Servicio de Eliminacion de Colecciones No Coincidentes
export const dropCollection = async(name) => {
    try {
        //Eliminar la Coleccion Correspondiente
        await db.dropCollection(name);
        console.log("Collection Eliminada: ", name);
    } catch (error) {
        console.log("Error en mongo.migration.dropCollection: ", error)
    }
}

/**
 * Servicio de Insercion de Datos
 * 
 * @param {String} collection Nombre de la Coleccion
 * @param {Object[]} data Documentos a Insertar
 */
export const insertTo = async(collection, data) => {
    try {
        //Validacion
        if(data.length == 0){
            console.log(`No hay Datos que insertar en ${collection}`)
            return;
        }

        //Ajustar Formato de Entrada de Datos
        /*
            Se requiere que el id autogenerado de Mongo,
            sea la misma PK de PostgreSql

            Se Hace uso de Manejador de Ids
        */
        const docs = await handlerIds(collection, data)
        
        //Funcion para Insertar Varios Documentos
        await db.collection(collection).insertMany(docs)
        //Visualizar Resultado
        console.log(`No° de Documentos Insertados: ${data.length}. En la Collecion: ${collection}`)
    } catch (error) {
        console.log("Error en mongo.migration.insertTo: ", error)
    }
}
/**
 * Servicio de Eliminar Todos los Documentos de una Coleccion
 * @param {String} collection Nombre de la Coleccion 
 */
export const truncateCollection = async(collection) => {
    try {
        await db.collection(collection).deleteMany({});
    } catch (error) {
        console.log("Error en mongo.migration.truncateCollection: ", error)
    }
}