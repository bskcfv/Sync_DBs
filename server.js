import { migration } from "./controllers/migration.controller.js";
import { Con } from "./controllers/connect.controller.js";


(async() => {
    
    await Con.GenerateConnection()
    await migration.CleanSchema()
    await migration.importTables()
    await migration.prepareTables()
    //await migration.getData()

})();