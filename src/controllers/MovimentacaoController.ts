import type { Request, Response } from "express";
import type MovimentacaoService from "../services/MovimentacaoService.js";
import type { CreateMovimentacaoSchemaDTO } from "../dto/movimentacaoSchemaDTO.js";
import { createFilterMovimentacao, type MovimentacaoQueryParams } from "../utils/createFilterMovimentacao.js";

export default class MovimentacaoController {
    private movimentacaoService: MovimentacaoService;

    constructor(movimentacaoService: MovimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    };

    public async addNewMovimentacao(req: Request, res: Response) {
        const movimentacao = await this.movimentacaoService.create(req.body as CreateMovimentacaoSchemaDTO);

        res.status(201).json(movimentacao);
    };

    public async getAllMovimentacoes(req: Request, res: Response) {
        const queryParams = req.query;

        if (Object.keys(queryParams).length > 0) {
            const filtros = createFilterMovimentacao(queryParams as unknown as MovimentacaoQueryParams);

            const movimentacoes = await this.movimentacaoService.getMovimentacaoByParam(filtros);
            return res.status(200).json(movimentacoes);
        }

        const movimentacoes = await this.movimentacaoService.findAll();
        res.status(200).json(movimentacoes);
    };

    public async getMovimentacaoById(req: Request, res: Response) {
        const { id } = req.params;

        const movimentacao = await this.movimentacaoService.getById(id as string);
        res.status(200).json(movimentacao);
    };
}