
import type { Request, Response } from "express";
import CategoriaService from "../services/CategoriaService.js";

export default class CategoriaController {
    private categoriaService: CategoriaService;

    constructor(categoriaService: CategoriaService){
        this.categoriaService = categoriaService;
    };

    public async getAllCategorias(req: Request, res: Response){
        const categorias = await this.categoriaService.findAll();
        // try catch pra pegar o erro - senao usa o middleware de erro global
        res.status(200).json(categorias);
    };

    public async addNewCategoria(req: Request, res: Response){
        const categoria = await this.categoriaService.create(req.body);

        res.status(201).json(categoria);
    };

    public async updateCategoria(req: Request, res: Response){
        const { id } = req.params;

        const categoria = await this.categoriaService.update(id as string, req.body);

        res.status(200).json(categoria);
    };

    public async deleteCategoria(req: Request, res: Response){
        const { id } = req.params;

        await this.categoriaService.delete(id as string);

        res.status(204).send("Categoria Deletada.")
    };
}
