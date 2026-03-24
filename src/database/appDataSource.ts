import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const appDataSource = new DataSource({
    type: "postgres",

    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER as string,
    password: process.env.DB_PASS as string,
    database: process.env.DB_NAME as string,

    entities: [
        process.env.NODE_ENV === "production"
        ? "dist/entities/*.js" 
        : "src/entities/*.ts"
    ],

    logging: ["query", "error", "schema"],

    synchronize: true,

});
