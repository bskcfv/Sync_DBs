import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config()

const poolLocal = new Pool({
    user: process.env.user,
    password: process.env.password,
    host: process.env.host,
    port:process.env.port,
    database: process.env.db_local
})

export default poolLocal;