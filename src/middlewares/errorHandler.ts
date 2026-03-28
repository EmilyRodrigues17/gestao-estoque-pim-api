import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof AppError){
        return res.status(err.statusCode).json({
            message: err.message
        })
    }

    if (err instanceof ZodError){
        return res.status(400).json({
            message: "Dados Invalidos",
            details: err.flatten()
        });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno"});
}