import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { PerfilAcesso } from "../types/perfilAcesso.js";

export const autorizar = (...perfisPermitidos: PerfilAcesso[]): RequestHandler => {
    return (req, _res, next) => {
        const usuario = req.usuario;
        if (!usuario) {
            throw new AppError("Não autenticado", 401);
        }
        
        const perfisComAdm = new Set([PerfilAcesso.ADM, ...perfisPermitidos]);
        if (!perfisComAdm.has(usuario.perfil as PerfilAcesso)) {
            throw new AppError("Acesso negado: permissão insuficiente", 403);
        }
        return next();
    };
};

