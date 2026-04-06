import { Router } from "express";
import categoriaRouter from "./categoriaRouter.js";
import insumoRouter from "./insumoRouter.js";
import movimentacaoRouter from "./movimentacaoRouter.js";

const indexRouter = Router();
indexRouter.use(categoriaRouter);
indexRouter.use(insumoRouter);
indexRouter.use(movimentacaoRouter);

export default indexRouter;
