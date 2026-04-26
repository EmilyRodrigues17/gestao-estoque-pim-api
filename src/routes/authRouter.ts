import { Router } from "express";
import { AuthService } from "../services/AuthService.js";
import { AuthController } from "../controllers/AuthController.js";
import { loginSchemaDTO, refreshSchemaDTO, trocarSenhaSchemaDTO } from "../dto/authDTO.js";
import { validateBody } from "../middlewares/validateBody.js";
import { autenticar } from "../middlewares/autenticar.js";

const authRouter = Router();
const authService = new AuthService();
const authController = new AuthController(authService);


authRouter.post("/login", validateBody(loginSchemaDTO),(req, res) => authController.login(req, res));
authRouter.post("/refresh",validateBody(refreshSchemaDTO),(req, res) => authController.refresh(req, res));

authRouter.post("/logout", autenticar, validateBody(refreshSchemaDTO),(req, res) => authController.logout(req, res));
authRouter.post("/trocar-senha", autenticar, validateBody(trocarSenhaSchemaDTO), (req, res) => authController.trocarSenha(req, res));

export default authRouter;
