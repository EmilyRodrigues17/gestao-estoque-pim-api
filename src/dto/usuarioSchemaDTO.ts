import z from "zod";
import { PerfilAcesso } from "../types/perfilAcesso.js";

export const createUsuarioSchemaDTO = z.object({
    nome: z.string({ error: "Nome é obrigatório" }).min(2),
    email: z.string({ error: "Email é obrigatório" }).email("Email inválido"),
    senha: z.string({ error: "Senha é obrigatória" }).min(6, "Mínimo 6 caracteres"),
    perfil_acesso: z.enum(PerfilAcesso, { error: "Perfil inválido (adm, gestor, almoxarife)" }),
});

export const updateUsuarioSchemaDTO = z.object({
    nome: z.string().min(2).optional(),
    email: z.string().email("Email inválido").optional(),
    senha: z.string().min(6, "Mínimo 6 caracteres").optional(),
    perfil_acesso: z.enum(PerfilAcesso).optional(),
    ativo: z.boolean().optional(),
});

export type CreateUsuarioSchemaDTO = z.infer<typeof createUsuarioSchemaDTO>;
export type UpdateUsuarioSchemaDTO = z.infer<typeof updateUsuarioSchemaDTO>;
