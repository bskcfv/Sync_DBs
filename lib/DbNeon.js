import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config()

const poolDeploy = new Pool({
    connectionString:process.env.db_url
})

export default poolDeploy;