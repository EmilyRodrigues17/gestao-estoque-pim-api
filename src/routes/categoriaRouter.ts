import { Router } from "express";
import CategoriaService from "../services/CategoriaService.js";
import CategoriaController from "../controllers/CategoriaController.js";

const categoriaRouter = Router();
const categoriaService = new CategoriaService();
const categoriaController = new CategoriaController(categoriaService);

categoriaRouter.get('/categorias', (req, res) => categoriaController.getAllCategorias(req, res));
categoriaRouter.post('/categorias', (req, res) => categoriaController.addNewCategoria(req, res));
categoriaRouter.post('/categorias/:id', (req, res) => categoriaController.updateCategoria(req, res));
categoriaRouter.delete('/categorias/:id', (req, res) => categoriaController.deleteCategoria(req, res));

export default categoriaRouter;
