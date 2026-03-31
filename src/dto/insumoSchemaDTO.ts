import z from "zod";

export const createInsumoSchemaDTO = z.object({
    codigo: z.string({message: "Código interno é obrigatório" }).trim().min(1).max(100),
    nome: z.string().trim().min(1, { error: "Nome do insumo é obrigatório" }).max(100),
    unidade_medida: z.string().trim().min(1).max(50),
    estoque_minimo: z.number().min(1).positive(),
    estoque_maximo: z.number().nullable(),
    localizacao: z.string({ error: "localizacao deve ser um texto"}).nullable(),
    categoria_id: z.uuid(),
    descricao: z.string({ error: "Descrição deve ser um texto" }).nullable()
})

export const updateInsumoSchemaDTO = createInsumoSchemaDTO.omit({
    categoria_id: true,
}).partial().strict()

export type CreateInsumoSchemaDTO = z.infer<typeof createInsumoSchemaDTO>
export type UpdateInsumoSchemaDTO = z.infer<typeof updateInsumoSchemaDTO>
