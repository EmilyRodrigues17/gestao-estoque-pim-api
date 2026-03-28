import { Router } from "express";
import categoriaRouter from "./categoriaRouter.js";

const indexRouter = Router();
indexRouter.use(categoriaRouter);

export default indexRouter;
