import z from "zod";

export const createCategoriaSchemaDTO = z.object({
    nome: z.string().trim().min(1, "Nome da categoria é obrigatório").max(100),
    descricao: z.string({ error: "Descrição deve ser um texto" }).nullable()
})

export const updateCategoriaSchemaDTO = createCategoriaSchemaDTO.partial()

export type CreateCategoriaSchemaDTO = z.infer<typeof createCategoriaSchemaDTO>
export type UpdateCategoriaSchemaDTO = z.infer<typeof updateCategoriaSchemaDTO>