import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config()

//Opciones de la Conexion
const options = {};
//Creación de la coneccion
const client = new MongoClient(process.env.mongo_url, options);
//Creacion de Clientes con capacidad de Promesas
const ClientPromise = client.connect();
//exportar ClientPromise
export default ClientPromise;
