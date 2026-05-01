import { Router } from "express";
import MovimentacaoService from "../services/MovimentacaoService.js";
import MovimentacaoController from "../controllers/MovimentacaoController.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createMovimentacaoSchemaDTO } from "../dto/movimentacaoSchemaDTO.js";
import { autorizar } from "../middlewares/autorizar.js";
import { PerfilAcesso } from "../types/perfilAcesso.js";

const movimentacaoRouter = Router();
const movimentacaoService = new MovimentacaoService();
const movimentacaoController = new MovimentacaoController(movimentacaoService);

movimentacaoRouter.get('/movimentacoes', (req, res) => movimentacaoController.getAllMovimentacoes(req, res));
movimentacaoRouter.get('/movimentacoes/:id', (req, res) => movimentacaoController.getMovimentacaoById(req, res));
movimentacaoRouter.post('/movimentacoes', autorizar(PerfilAcesso.ALMOXARIFE), validateBody(createMovimentacaoSchemaDTO), (req, res) => movimentacaoController.addNewMovimentacao(req, res));

export default movimentacaoRouter;
