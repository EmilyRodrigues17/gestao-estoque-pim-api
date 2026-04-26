import z from "zod";

export const loginSchemaDTO = z.object({
    email: z
        .string({ error: "Email é obrigatório" })
        .email("Email inválido"),
    senha: z
        .string({ error: "Senha é obrigatória" })
        .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const refreshSchemaDTO = z.object({
    refreshToken: z.string({ error: "Refresh token é obrigatório" }),
});

export const trocarSenhaSchemaDTO = z.object({
    senhaAtual: z
        .string({ error: "Senha atual é obrigatória" })
        .min(6, "Senha deve ter no mínimo 6 caracteres"),
    novaSenha: z
        .string({ error: "Nova senha é obrigatória" })
        .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginSchemaDTO = z.infer<typeof loginSchemaDTO>;
export type RefreshSchemaDTO = z.infer<typeof refreshSchemaDTO>;
export type TrocarSenhaSchemaDTO = z.infer<typeof trocarSenhaSchemaDTO>;