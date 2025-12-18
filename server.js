import { migration } from "./controllers/migration.controller.js";
import { Con } from "./controllers/connect.controller.js";
import { Sync } from "./controllers/sync.controller.js";
import { mongoController } from "./controllers/mongo.migration.controller.js";

import pkg from 'terminal-kit';
const {terminal} = pkg;

async function menu() {
    let itemsMenu = [
        'Migrate RDB to RDB local',
        'Migrate RDB to Mongo Atlas',
        'What Data Import to Mongo Atlas',
        'What Table Import to Mongo Atlas',
        'exit'
    ]

    terminal.clear();

    terminal.cyan("Welcome!!\n")

    terminal.singleColumnMenu(itemsMenu, async(err, response) => {
        terminal('\n').eraseLineAfter();

        switch(response.selectedText){
            case 'Migrate RDB to RDB local':
                terminal.blue("\nPreparando Importacion\n")
                await Con.GenerateConnection()
                await migration.CleanSchema()
                await migration.importTables()
                await migration.prepareTables()
                terminal.blue("\nImportacion Terminada\n")
                setTimeout(menu, 2000);
                break;

            case 'Migrate RDB to Mongo Atlas':
                terminal.blue("\nPreparando Importacion a Mongo\n")
                await Con.GenerateConnection()
                await mongoController.cleanSchema()
                await mongoController.importTables()
                await mongoController.getData()
                terminal.blue("\nImportacion MongoTerminada\n")
                setTimeout(menu, 2000);
                break;
            
            case 'What Data Import to Mongo Atlas':
                terminal.blue("\nEscriba el Numero de las tablas a Necesitar: ")
                const listDataTables = []
                let number = await terminal.inputField().promise;
                for (let i = 0; i <= number; i++) {
                    terminal.blue(`\n Escriba el Nombre de la tabla ${i}: `)
                    let tableName = await terminal.inputField().promise;
                    listDataTables.push(tableName)
                }
                terminal.blue("\n Tablas Guardadas, Es momento de Procesar Solicitud\n")
                await mongoController.getSelectedData(listDataTables)
                terminal.green("\nTablas Enviadas Con exito\n")
                setTimeout(menu, 5000);
                break;
            
            case 'What Table Import to Mongo Atlas':
                terminal.blue("\nEscriba el Numero de las tablas a Importar: ")
                const listTables = []
                let numbertables = await terminal.inputField().promise;
                for (let i = 0; i <= numbertables; i++) {
                    terminal.blue(`\n Escriba el Nombre de la tabla ${i}: `)
                    let tableName = await terminal.inputField().promise;
                    listTables.push(tableName)
                }
                terminal.blue("\n Tablas Guardadas, Es momento de Procesar Solicitud\n")
                await mongoController.importSelected(listTables)
                terminal.green("\nTablas Importadas Con exito\n")
                setTimeout(menu, 5000);
                break;

            case 'exit':
                terminal.green("\nSaliendo del Programa\n")
                process.exit();
        }
    })
}

await menu()