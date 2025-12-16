import { migration } from "./controllers/migration.controller.js";
import { Con } from "./controllers/connect.controller.js";
import { Sync } from "./controllers/sync.controller.js";
import { mongoController } from "./controllers/mongo.migration.controller.js";

(async() => {
    
    await Con.GenerateConnection()
    //await migration.CleanSchema()
    //await migration.importTables()
    //await migration.prepareTables()
    await mongoController.cleanSchema()
    await mongoController.importTables()
    await mongoController.getData()
    //await Sync.Suscriptor()

})();