import { Router } from "express";
import { UsuarioService } from "../services/UsuarioService.js";
import { UsuarioController } from "../controllers/UsuarioController.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createUsuarioSchemaDTO, updateUsuarioSchemaDTO } from "../dto/usuarioSchemaDTO.js";
import { autorizar } from "../middlewares/autorizar.js";

const usuarioRouter = Router();
const usuarioService = new UsuarioService();
const usuarioController = new UsuarioController(usuarioService);

usuarioRouter.get("/usuarios", autorizar(), (req, res) => usuarioController.getAllUsuarios(req, res));
usuarioRouter.get("/usuarios/:id", autorizar(), (req, res) => usuarioController.getUsuarioById(req, res));
usuarioRouter.post("/usuarios", autorizar(), validateBody(createUsuarioSchemaDTO), (req, res) => usuarioController.addNewUsuario(req, res));
usuarioRouter.put("/usuarios/:id", autorizar(), validateBody(updateUsuarioSchemaDTO), (req, res) => usuarioController.updateUsuario(req, res));
usuarioRouter.delete("/usuarios/:id", autorizar(), (req, res) => usuarioController.deleteUsuario(req, res));

export default usuarioRouter;
