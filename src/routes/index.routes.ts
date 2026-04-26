import { Router } from "express";
import categoriaRouter from "./categoriaRouter.js";
import insumoRouter from "./insumoRouter.js";
import movimentacaoRouter from "./movimentacaoRouter.js";
import authRouter from "./authRouter.js";
import dashboardRouter from "./dashboardRouter.js";
import { autenticar } from "../middlewares/autenticar.js";
import usuarioRouter from "./usuarioRouter.js";

const indexRouter = Router();

indexRouter.use(authRouter);

indexRouter.use(autenticar);

indexRouter.use(usuarioRouter);
indexRouter.use(categoriaRouter);
indexRouter.use(insumoRouter);
indexRouter.use(movimentacaoRouter);
indexRouter.use(dashboardRouter);

export default indexRouter;
