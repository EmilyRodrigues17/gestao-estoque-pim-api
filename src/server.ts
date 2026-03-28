import express from "express";
import cors from "cors";
import 'dotenv/config';
import { appDataSource } from "./database/appDataSource.js";
import indexRouter from "./routes/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());
app.use('/api', indexRouter);
app.use(errorHandler);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
})

appDataSource.initialize()
.then(() => {
    console.log("Banco de dados conectado!");

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`)
    });
})
.catch((error) => {
    console.log(error)
})
