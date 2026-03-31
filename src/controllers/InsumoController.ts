import type { Request, Response } from "express";
import type InsumoService from "../services/InsumoService.js";
import { createFilter, type InsumoQueryParams } from "../utils/createFilter.js";
import type { CreateInsumoSchemaDTO, UpdateInsumoSchemaDTO } from "../dto/insumoSchemaDTO.js";

export default class InsumoController {
    private insumoService: InsumoService;

    constructor(insumoService: InsumoService){
        this.insumoService = insumoService;
    };

    public async getAllInsumos(req: Request, res: Response){
        const queryParams = req.query;

        if (Object.keys(queryParams).length > 0){
            const filtros = createFilter(queryParams as unknown as InsumoQueryParams);

            const insumos = await this.insumoService.getInsumosByParam(filtros);
            return res.status(200).json(insumos);
        }

        const insumos = await this.insumoService.findAll();
        res.status(200).json(insumos);
    };

    public async getInsumoById(req: Request, res: Response){
        const { id } = req.params;

        const insumo = await this.insumoService.getById(id as string);
        res.status(200).json(insumo);
    };

    public async addNewInsumo(req: Request, res: Response){
        const insumo = await this.insumoService.create(req.body as CreateInsumoSchemaDTO)

        res.status(201).json(insumo);
    };

    public async updateInsumo(req: Request, res: Response){
        const { id } = req.params;

        const insumo = await this.insumoService.update(id as string, req.body as UpdateInsumoSchemaDTO);

        res.status(200).json(insumo);
    };
    
    public async deleteInsumo(req: Request, res: Response){
        const { id } = req.params;

        await this.insumoService.delete(id as string);

        res.status(204).send()
    };

}
