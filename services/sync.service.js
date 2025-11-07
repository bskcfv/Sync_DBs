import poolDeploy from "../lib/DbNeon.js";
import createPostgresSubscriber from "pg-listen";

/*
    Objetvio -> Crear Mecanismo que Escuche los cambios/eventos de la base de datos Deploy
    Usar pg-listen en NodeJs
    Usar NOTIFY en postgres

    Pasos: 
        3. Crear Funcion que Detecte: Tabla, sentencia DML ejecutada, Resultado
        4. Asignarle un Trigger
        2. Conectar Suscriptor
        5. Funcion asincronica que escuche los cambios en nodejs    
 */

//Servicio Inicializar Funcion de Notificaciones
/*
    Concepto a Necesitar:
        TG_OP -> Trigger Operation ('Operación que detecta el Trigger)
        TG_TABLE_NAME -> Trigger Table Name ('Tabla que detecta el Trigger')
        json_build_object(); -> funcion de Postgres de obtener varios datos y convertirlos a JSON
        row_to_json() -> funcion de convertir un registro (Fila) a Formato JSON
        PERFORM -> 'Ejecutar' Una Funcion Sin Retornar Nada
        pg_notify(canal, mensaje) -> función asincronica encargada de enviar por el canal indicado un mensaje
            |-> pg_notify va a enviar el mensaje a todos los listeners suscritos al canal ('table_changes')
            |-> Los Canales NO se crean, se crean automaticamente al ser declarados en la funcion pg_notify
    Variables:
        payload -> Encargada de receptar toda la información (Tabla, sentencia DML ejecutada, Resultado)
    Registros:
        Contexto: El trigger es 'AFTER'
        OLD -> Los Registros despues de ser Eliminados son 'Viejos'
        NEW -> Los Registros despues de ser Insertados o Actualizados son 'Nuevos'
*/
export const notify_action = async() => {
    return await poolDeploy.query(
        `
        CREATE OR REPLACE FUNCTION notify_action()
        RETURNS TRIGGER AS $$
        DECLARE
        payload JSON;
        BEGIN
            IF(TG_OP = 'DELETE') THEN
                payload := json_build_object(
                    'operation', TG_OP,
                    'table', TG_TABLE_NAME,
                    'data', row_to_json(OLD)
                );
            ELSE
                payload := json_build_object(
                    'operation', TG_OP,
                    'table', TG_TABLE_NAME,
                    'data', row_to_json(NEW)
                );
            END IF;

            PERFORM pg_notify('table_changes', payload::TEXT);

            RETURN NULL;

        END;
        $$ LANGUAGE plpgsql;
        `
    )
}
//Servicio de Asignar Trigger a Cada Tabla Existente
export const trigger_notify = async(tablename) => {
    return await poolDeploy.query(
        `
        CREATE OR REPLACE TRIGGER t_notify_${tablename}
        AFTER INSERT OR UPDATE OR DELETE ON ${tablename}
        FOR EACH ROW
        EXECUTE FUNCTION notify_action();
        `
    )
}

//Servicio de Crear Suscripción al Canal Establecido
export const generateSuscription = async () => {
    //Crear Objeto configurado para conectarse a la Database Correspondiente
    const suscriptor = createPostgresSubscriber({connectionString:process.env.db_url})
    //Callback que Visualice las Notificaciones
    //.notifications.on('canal','mensaje')
    suscriptor.notifications.on('table_changes', (payload) => {
        console.log(`Notificacion: `)
        console.log(JSON.parse(payload))
    })
    //Conectarse a la Database
    await suscriptor.connect()
    //Ejecutar LISTEN 'canal' en Postgres
    await suscriptor.listenTo('table_changes')

    return "Sincronizacion Completa en el canal table_changes"
}




