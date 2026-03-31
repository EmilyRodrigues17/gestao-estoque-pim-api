import { Router } from "express";
import InsumoService from "../services/InsumoService.js";
import InsumoController from "../controllers/InsumoController.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createInsumoSchemaDTO, updateInsumoSchemaDTO } from "../dto/insumoSchemaDTO.js";

const insumoRouter = Router();
const insumoService = new InsumoService();
const insumoController = new InsumoController(insumoService);

insumoRouter.get('/insumos', (req, res) => insumoController.getAllInsumos(req, res));
insumoRouter.get('/insumos/:id', (req, res) => insumoController.getInsumoById(req, res));
insumoRouter.post('/insumos', validateBody(createInsumoSchemaDTO), (req, res) => insumoController.addNewInsumo(req, res));
insumoRouter.put('/insumos/:id', validateBody(updateInsumoSchemaDTO), (req, res) => insumoController.updateInsumo(req, res));
insumoRouter.delete('/insumos/:id', (req, res) => insumoController.deleteInsumo(req, res));


export default insumoRouter;