import type { Request, Response } from "express";
import { UsuarioService } from "../services/UsuarioService.js";
import type { CreateUsuarioSchemaDTO, UpdateUsuarioSchemaDTO } from "../dto/usuarioSchemaDTO.js";

export class UsuarioController {
    private usuarioService: UsuarioService;

    constructor(usuarioService: UsuarioService) {
        this.usuarioService = usuarioService;
    }

    public async getAllUsuarios(req: Request, res: Response) {
        const usuarios = await this.usuarioService.findAll();
        res.status(200).json(usuarios);
    };

    public async getUsuarioById(req: Request, res: Response) {
        const { id } = req.params;
        const usuario = await this.usuarioService.getById(id as string);
        res.status(200).json(usuario);
    };

    public async addNewUsuario(req: Request, res: Response) {
        const usuario = await this.usuarioService.create(req.body as CreateUsuarioSchemaDTO);
        res.status(201).json(usuario.id);
    };

    public async updateUsuario(req: Request, res: Response) {
        const { id } = req.params;
        const usuario = await this.usuarioService.update(
            id as string,
            req.body as UpdateUsuarioSchemaDTO
        );
        res.status(200).json(usuario);
    };

    public async deleteUsuario(req: Request, res: Response) {
        const { id } = req.params;
        await this.usuarioService.delete(id as string);
        res.status(204).send();
    };
}
