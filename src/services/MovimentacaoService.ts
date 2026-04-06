import { appDataSource } from "../database/appDataSource.js";
import { Insumo } from "../entities/Insumo.js";
import { Movimentacao } from "../entities/Movimentacao.js";
import { AppError } from "../errors/AppError.js";
import type { CreateMovimentacaoSchemaDTO } from "../dto/movimentacaoSchemaDTO.js";
import { TipoMovimentacao } from "../types/tipoMovimentacao.js";
import { MotivoMovimentacao } from "../types/motivoMovimentacao.js";
import type { FindOptionsWhere } from "typeorm";

export default class MovimentacaoService {
    private movimentacaoRepository = appDataSource.getRepository(Movimentacao);
    private insumoRepository = appDataSource.getRepository(Insumo);

    public async findAll(): Promise<Movimentacao[]> {
        return this.movimentacaoRepository.find({ 
            relations: { insumo: true }
        })
    };

    public async getById(id: string): Promise<Movimentacao> {
        const movimentacao = await this.movimentacaoRepository.findOne({
            where: { id },
            relations: { insumo: true },
        });

        if (!movimentacao) {
            throw new AppError("Movimentação não encontrada.", 404);
        }

        return movimentacao;
    };

    public async getMovimentacaoByParam(filtros: FindOptionsWhere<Movimentacao>): Promise<Movimentacao[]> {
        const movimentacaoExiste = this.movimentacaoRepository.find({
            where: filtros,
            relations: { insumo: true }
        });

        if ((await movimentacaoExiste).length == 0) {
            throw new AppError("Movimentação não encontrada.", 404)
        }

        return movimentacaoExiste
    };

    public async create(data: CreateMovimentacaoSchemaDTO): Promise<Movimentacao> {

        const insumo = await this.insumoRepository.findOneBy({ id: data.insumo_id })

        if (!insumo) {
            throw new AppError("Insumo não encontrado.", 404);
        }

        if (!insumo.ativo) {
            throw new AppError("Insumo inativo. Não é possível registrar movimentação.", 400);
        }

        const estoqueAtual = Number(insumo.estoque_atual);
        let qtdEstoque: number;

        if (data.tipo === "entrada") {
            qtdEstoque = estoqueAtual + Number(data.quantidade);
        } else if (data.tipo === "saida") {
            if (estoqueAtual === 0) {
                throw new AppError("Quantidade de estoque zerada. Não permite movimentação de saída.", 400);
            }

            if (Number(data.quantidade) > estoqueAtual) {
                throw new AppError("Quantidade solicitada superior ao estoque atual.", 422);
            }

            qtdEstoque = estoqueAtual - Number(data.quantidade);

        } else {
            throw new AppError("Tipo de movimentação inválida.", 400);
        }

        const novaMovimentacao = this.movimentacaoRepository.create({
            insumo_id: data.insumo_id,
            tipo: data.tipo as TipoMovimentacao,
            motivo: data.motivo as MotivoMovimentacao,
            quantidade: data.quantidade,
            saldo_apos: qtdEstoque,
            linha_destino: data.linha_destino ?? undefined,
            observacao: data.observacao ?? undefined,
            registrado_por: data.registrado_por,
        });

        try {
            await this.movimentacaoRepository.save(novaMovimentacao);
        } catch (error) {
            console.error("Erro ao salvar registro de movimentação:", error);
            throw new AppError("Falha ao salvar registro de movimentação. Tente novamente.", 400);
        }

        insumo.estoque_atual = qtdEstoque;
        try {
            await this.insumoRepository.save(insumo);
        } catch (error) {
            await this.movimentacaoRepository.remove(novaMovimentacao);
            console.error("Erro ao atualizar estoque do insumo:", error);
            throw new AppError("Falha ao atualizar estoque. Movimentação revertida.", 500);
        }

        return novaMovimentacao;
    }
}