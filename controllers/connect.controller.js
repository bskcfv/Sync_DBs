import { ActivateExtension, createServer, connectUsers, DropCon } from "../services/connect.service.js";

export const Con = {
    GenerateConnection : async() =>{
        try {
            //Llamado de Servicio de Eliminar Conexion (Pruebas)
            await DropCon()
            //Llamado de Servicio de Conexion
            await ActivateExtension()
            //Llamado de Servicio de Creacion de Servidor
            await createServer()
            //Llamado de Servicio de Enlazamiento de Usuarios
            await connectUsers()
            //Retornar Respuesta
            return console.log("Conexion Entre Databases Completado")
        } catch (error) {
            console.log(error)
        }
    }
}