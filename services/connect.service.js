import poolLocal from "../lib/DbLocal.js";
import { validateIdentifier } from "../helper/validateName.js";
import dotenv from 'dotenv'

dotenv.config()

/*
    Objetivo -> Generar Una Conexion Con la DB deploy, poder Transferir Data y estructuras a la DB local
        0. Limpiar Conexion Sí había una previamente
        1. Activar Extension de conexion remota 'FOREIGN DATA WRAPPER (FDW)'
        2. Crear Servidor que se Conecte a la DB en Deploy
        3. Enlazar usuario Local con el Usuario Remoto
        4. Importar Tablas en Deploy (así poder Acceder a Estructura y Datos)
        5. Clonar las Tablas Importadas en la db Local
        
*/

//Servicio Activar Extension para Conectar con DB En Deploy
export const ActivateExtension = async() => {
    try {
        await poolLocal.query(
        'CREATE EXTENSION IF NOT EXISTS postgres_fdw;'
        )
        return console.log("Extension Activada")        
    } catch (error) {
        console.log(`Error en Activar Extension: ${error}`)
    }
}

//Servicio Crear Servidor que se conecte a la DB deploy
export const createServer = async() => {
    try {
        await poolLocal.query(
            `
            CREATE SERVER deploy_server
            FOREIGN DATA WRAPPER postgres_fdw
            OPTIONS(
                host '${process.env.db_d_host}',
                dbname '${process.env.db_d_dbname}',
                port '${process.env.db_d_port}',
                sslmode 'require'
            );
            `
        )
        return console.log("Servidor Creado!!")
    } catch (error) {
        console.log(`Error en Crear Servidor: ${error}`)
    }
}

//Servicio Enlazar Usuario Local Con Usuario Remoto
export const connectUsers = async() => {
    try {
        await poolLocal.query(
            `
            CREATE USER MAPPING FOR ${process.env.user}
            SERVER deploy_server
            OPTIONS(
                user '${process.env.db_d_user}',
                password '${process.env.db_d_password}'
            );
            `
        )    
        return console.log("Enlace de Usuarios Creado!!")
    } catch (error) {
        console.log(`Error en Enlazar Usuarios: ${error}`)
    }
    
}

//Servicio Importar Tablas de La DB en Deploy
export const importForeignTable = async(Table) =>{
    try {

        const safeTable = validateIdentifier(Table)

        await poolLocal.query(
            `
            IMPORT FOREIGN SCHEMA ${process.env.db_d_schema}
            LIMIT TO (${safeTable})
            FROM SERVER deploy_server INTO ${process.env.db_schema};
            `
        )
        return console.log(`Tabla ${safeTable} Ha Sido Importada`)
    } catch (error) {
        console.log(`Error en Importar Tabla: ${error}`)
    }
}

//Servicio Clonar Tabla a DB Local
//Le Daremos el nombre 'tablename_loca' para evitar conflictos
export const cloneTable = async(TableName) => {
    try {
        const safeName = validateIdentifier(TableName)

        await poolLocal.query(
            `
            CREATE TABLE ${safeName}_local AS
            SELECT * FROM ${safeName};
            `
        )
        return console.log(`La tabla ${safeName}_local Ha Sido Creada en la DB local!!`)
    } catch (error) {
        console.log(`Error en Clonar Tabla: ${error}`)
    }
}

//Servicio de Eliminar Tabla Importada
export const dropForeignTable = async(TableName) => {
    try {

        const safeName = validateIdentifier(TableName)

        await poolLocal.query(
            `DROP FOREIGN TABLE IF EXISTS ${safeName};`
        )
        return console.log(`Tabla Importada ${safeName} Ha sido Eliminada`)
    } catch (error) {
        console.log(`Error en Eliminar Tabla Clonada: ${TableName}`)
    }
}

//Servicio Modificar nombre, pasar de tablename_local -> tablename
export const altertablename = async(TableName) => {
    try {

        const safeName = validateIdentifier(TableName)

        await poolLocal.query(
            `
            ALTER TABLE ${safeName}_local
            RENAME TO ${safeName};
            `
        )
        return console.log(`El Nombre de la Tabla ha sido Actualizado por: ${safeName}`)
    } catch (error) {
        console.log(`Error en altertablename: ${error}`)
    }
}

//Servicio de Eliminar Conexion Completa
export const DropCon = async() => {
    try {
        await poolLocal.query(
            `DROP SERVER deploy_server CASCADE;`
        )
        return console.log("Conexion Previa entre Databases ha sido eliminada")
    } catch (error) {
        console.log(`Error en Eliminar Connexion: ${error}`)
    }
}