
import type { Request, Response } from "express";
import CategoriaService from "../services/CategoriaService.js";
import type { CreateCategoriaSchemaDTO, UpdateCategoriaSchemaDTO } from "../dto/categoriaSchemaDTO.js";

export default class CategoriaController {
    private categoriaService: CategoriaService;

    constructor(categoriaService: CategoriaService){
        this.categoriaService = categoriaService;
    };

    public async getAllCategorias(req: Request, res: Response){
        const categorias = await this.categoriaService.findAll();
        res.status(200).json(categorias);
    };

    public async getCategoriaById(req: Request, res: Response){
        const { id } = req.params;

        const categoria = await this.categoriaService.getById(id as string);
        res.status(200).json(categoria);
    };

    public async addNewCategoria(req: Request, res: Response){
        const categoria = await this.categoriaService.create(req.body as CreateCategoriaSchemaDTO);

        res.status(201).json(categoria);
    };

    public async updateCategoria(req: Request, res: Response){
        const { id } = req.params;

        const categoria = await this.categoriaService.update(id as string, req.body as UpdateCategoriaSchemaDTO);

        res.status(200).json(categoria);
    };

    public async deleteCategoria(req: Request, res: Response){
        const { id } = req.params;

        await this.categoriaService.delete(id as string);

        res.status(204).json({message: "Categoria Deletada."})
    };
}
