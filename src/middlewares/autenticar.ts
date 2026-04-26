import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/jwt.js";
import { AppError } from "../errors/AppError.js";

export interface UsuarioAutenticado extends JwtPayload{
    sub: string;
    perfil: string;
    nome: string;
}

declare global {
    namespace Express {
        interface Request {
            usuario?: UsuarioAutenticado;
        }
    }
}

const getAccessSecret = () => {
    const value = JWT_ACCESS_SECRET;
    if (!value) {
        throw new AppError("JWT_ACCESS_SECRET nao definido", 500);
    }
    return value;
};

export const autenticar: RequestHandler = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Token não fornecido", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new AppError("Token não fornecido", 401);
    }

    try {
        const decoded = jwt.verify(token, getAccessSecret()) as UsuarioAutenticado;
       
        req.usuario = decoded;
        return next();
    } catch {
        throw new AppError("Token inválido ou expirado", 401);
    }
};
