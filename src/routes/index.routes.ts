import { Router } from "express";
import categoriaRouter from "./categoriaRouter.js";
import insumoRouter from "./insumoRouter.js";

const indexRouter = Router();
indexRouter.use(categoriaRouter);
indexRouter.use(insumoRouter);

export default indexRouter;
