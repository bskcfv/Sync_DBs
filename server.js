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
                setTimeout(menu, 10000);
                break;

            case 'Migrate RDB to Mongo Atlas':
                terminal.blue("\nPreparando Importacion a Mongo\n")
                await Con.GenerateConnection()
                await mongoController.cleanSchema()
                await mongoController.importTables()
                await mongoController.getData()
                terminal.blue("\nImportacion MongoTerminada\n")
                setTimeout(menu, 10000);
                break;


            case 'exit':
                terminal.green("\nSaliendo del Programa\n")
                process.exit();
        }
    })
}

await menu()