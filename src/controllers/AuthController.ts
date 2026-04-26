import type { Request, Response } from "express";
import type { AuthService } from "../services/AuthService.js";
import type { LoginSchemaDTO, RefreshSchemaDTO, TrocarSenhaSchemaDTO } from "../dto/authDTO.js";

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    async login(req: Request, res: Response) {
        const { email, senha } = req.body as LoginSchemaDTO;
        
        const meta ={
            ...(req.ip ? { ip: req.ip } : {}),
            ...(req.headers["user-agent"]
                ? { userAgent: String(req.headers["user-agent"]) }
                : {})
        };

        const resultado = await this.authService.login(email, senha, meta);
        res.status(200).json(resultado);
    };

    async refresh(req: Request, res: Response) {
        const { refreshToken } = req.body as RefreshSchemaDTO;
        const resultado = await this.authService.refresh(refreshToken);
        res.status(200).json(resultado);
    };

    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body as RefreshSchemaDTO;
        await this.authService.logout(refreshToken);
        res.status(204).send();
    };

    async trocarSenha(req: Request, res: Response) {
        const { senhaAtual, novaSenha } = req.body as TrocarSenhaSchemaDTO;
        
        const usuarioId = req.usuario!.sub;
        await this.authService.trocarSenha(usuarioId, senhaAtual, novaSenha);
        res.status(200).json({ message: "Senha alterada com sucesso" });
    };
}