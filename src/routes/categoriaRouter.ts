import { Router } from "express";
import CategoriaService from "../services/CategoriaService.js";
import CategoriaController from "../controllers/CategoriaController.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createCategoriaSchemaDTO, updateCategoriaSchemaDTO } from "../dto/categoriaSchemaDTO.js";

const categoriaRouter = Router();
const categoriaService = new CategoriaService();
const categoriaController = new CategoriaController(categoriaService);

categoriaRouter.get('/categorias', (req, res) => categoriaController.getAllCategorias(req, res));
categoriaRouter.get('/categorias/:id', (req, res) => categoriaController.getCategoriaById(req, res));
categoriaRouter.post('/categorias', validateBody(createCategoriaSchemaDTO), (req, res) => categoriaController.addNewCategoria(req, res));
categoriaRouter.put('/categorias/:id', validateBody(updateCategoriaSchemaDTO), (req, res) => categoriaController.updateCategoria(req, res));
categoriaRouter.delete('/categorias/:id', (req, res) => categoriaController.deleteCategoria(req, res));

export default categoriaRouter;
