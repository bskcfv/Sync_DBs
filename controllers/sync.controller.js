import { notify_action, trigger_notify } from "../services/sync.service.js";
import { getDeployTables } from "../services/migration.service.js";

export const Sync = {
    Suscriptor : async() => {
        try {
            console.log("Iniciando Sincronizacion")
            //Llamado de Servicio de Creacion de Funciones de Notificacion
            await notify_action()
            //Llamado al Servicio de Obtencion de Nombre de Tablas
            const tables = await getDeployTables()
            //Bucle que recorra cada tabla
            for(const table of tables){
                console.log(`Sincronizando tabla ${table.tablename}`)
                //Llamado de Servicio de Asignamiento de Trigger a tabla
                await trigger_notify(table.tablename)
            }
            return 'Triggers Creados Correctamente'
        } catch (error) {
            console.log(`Error en sysnc.controller.Suscriptor: ${error}`)
        }
    }
}