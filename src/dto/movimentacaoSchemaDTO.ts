import z from "zod";
import { TipoMovimentacao } from "../types/tipoMovimentacao.js";
import { MotivoMovimentacao } from "../types/motivoMovimentacao.js";

export const createMovimentacaoSchemaDTO = z.object({
    insumo_id: z.uuid({ message: "ID do insumo deve ser um UUID válido" }),
    tipo: z.enum(TipoMovimentacao, { message: "Tipo deve ser 'entrada' ou 'saida'" }),
    motivo: z.enum(MotivoMovimentacao, {
        message: "Motivo deve ser 'compra', 'devolucao', 'consumo', 'perda' ou 'ajuste'"
    }),
    quantidade: z.number({ message: "Quantidade é obrigatória" }).positive({ message: "Quantidade deve ser positiva" }),
    linha_destino: z.string().nullable().optional(),
    observacao: z.string().nullable().optional(),
    registrado_por: z.string({ message: "Campo registrado_por é obrigatório" }).min(1),
}).superRefine((data, ctx) => {

    if ((data.motivo === "ajuste" || data.motivo === "perda") && (!data.observacao || data.observacao.trim() === "")) {
        ctx.addIssue({
            code: "custom",
            message: "Campo Observação é obrigatória para movimentações com motivo 'ajuste' ou 'perda'",
            path: ["observacao"],
        });
    }

    if (data.tipo === "saida" && data.motivo === "consumo" && (!data.linha_destino || data.linha_destino.trim() === "")) {
        ctx.addIssue({
            code: "custom",
            message: "Linha de destino é obrigatória para saídas com motivo 'consumo'",
            path: ["linha_destino"],
        });
    }
});

export type CreateMovimentacaoSchemaDTO = z.infer<typeof createMovimentacaoSchemaDTO>;