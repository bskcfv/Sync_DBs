import poolDeploy from "../lib/DbNeon.js";
import ClientPromise from "../lib/DbMongo.js";
import { idColumns } from "../helper/handlerId.js";
import { insertMongoToSql, updateMongoToSql, deleteMongoToSql } from "./convertQuery.service.js";

//Instanciar Objeto de Clase clientPromise
const client = await ClientPromise;
//Conectarse a la Base de Datos Receptora
const db = client.db("MirrorMongo");
//sincronización en tiempo real Mongo -> Postgres
export const startSync = async() => {
    console.log("Iniciando sincronización en tiempo real...");
    //Obtener las Colecciones de Atlas en Formato Array
    const collections = await db.listCollections().toArray();
    //Recorrer las Colecciones
    for (const { name } of collections) {
        //Obtener el Nombre de la PK Correspondiente a la Coleccion
        let idColumn = idColumns[name]
        //Obtener la Coleccion Correspondiente de Atlas
        const source = db.collection(name);
        //.watch() -> Realizar Seguimiento a los Cambios de la Coleccion de Atlas
        const changeStream = source.watch();
        //Listener que Escucha "Cambios" dentro de la Coleccion
        changeStream.on("change", async (change) => {
          try {
              if (change.operationType === "insert") {
                  //Eliminar Columna _id del Documento a Insertar
                  const { _id, ...documentoSinId } = change.fullDocument;
                  //Arreglar Parametros Necesarios para la Traduccion de Sentencias Mongo -> SQL
                  const collectionRequest = `${change.ns.coll}`
                  const operationRequest = `${change.operationType}One`
                  const dataRequest = documentoSinId
                  //Llamado al MicroServicio de Conversion de Querys Insert
                  const query = await insertMongoToSql(collectionRequest, operationRequest, dataRequest)
                  //Ejecutar Query en la Base de Datos Principal
                  await poolDeploy.query(query)
              } else if (change.operationType === "update") {
                  //Arreglar Parametros Necesarios para la Traduccion de Sentencias Mongo -> SQL
                  const collectionRequest = `${change.ns.coll}`
                  const operationRequest = `${change.operationType}One`
                  const filterRequest = {
                    [idColumn]: change.documentKey._id
                  }
                  const updateRequest = {
                    $set: change.updateDescription.updatedFields
                  }
                  //Llamado al MicroServicio de Conversion de Querys Update
                  const query = await updateMongoToSql(collectionRequest, operationRequest, filterRequest, updateRequest)
                  //Ejecutar Query en la Base de Datos Principal
                  await poolDeploy.query(query)
              } else if (change.operationType === "delete") {
                  //Arreglar Parametros Necesarios para la Traduccion de Sentencias Mongo -> SQL
                  const collectionRequest = `${change.ns.coll}`
                  const operationRequest = `${change.operationType}One`
                  const filterRequest = {
                    [idColumn]: change.documentKey._id
                  }
                  //Llamado al MicroServicio de Conversion de Querys Delete
                  const query = await deleteMongoToSql(collectionRequest, operationRequest, filterRequest)
                  //Ejecutar Query en la Base de Datos Principal
                  await poolDeploy.query(query)
              }
          } catch (err) {
            console.error(`Error en ${name}:`, err.message);
          }
        });
        console.log(`Escuchando cambios en ${name}`);
    }
}