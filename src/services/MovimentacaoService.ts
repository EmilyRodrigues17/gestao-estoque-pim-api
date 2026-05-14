import { appDataSource } from "../database/appDataSource.js";
import { Insumo } from "../entities/Insumo.js";
import { Movimentacao } from "../entities/Movimentacao.js";
import { Usuario } from "../entities/Usuario.js";
import { AppError } from "../errors/AppError.js";
import type { CreateMovimentacaoSchemaDTO } from "../dto/movimentacaoSchemaDTO.js";
import { TipoMovimentacao } from "../types/tipoMovimentacao.js";
import { MotivoMovimentacao } from "../types/motivoMovimentacao.js";
import { In, type FindOptionsWhere } from "typeorm";
import { calcularStatus } from "../utils/updateStatusEstoqueInsumo.js";

export default class MovimentacaoService {
    private movimentacaoRepository = appDataSource.getRepository(Movimentacao);
    private insumoRepository = appDataSource.getRepository(Insumo);
    private usuarioRepository = appDataSource.getRepository(Usuario);

    public async findAll(): Promise<Movimentacao[]> {
        const movimentacoes = await this.movimentacaoRepository.find({ 
            relations: { insumo: true },
            order: { timestamp: 'DESC'},
        });
        return this.enriquecerComUsuarios(movimentacoes);
    };

    public async getById(id: string): Promise<Movimentacao> {
        const movimentacao = await this.movimentacaoRepository.findOne({
            where: { id },
            relations: { insumo: true },
        });

        if (!movimentacao) {
            throw new AppError("Movimentação não encontrada.", 404);
        }

        const [enriquecida] = await this.enriquecerComUsuarios([movimentacao]);
        return enriquecida!;
    };

    public async getMovimentacaoByParam(filtros: FindOptionsWhere<Movimentacao>): Promise<Movimentacao[]> {
        const movimentacoes = await this.movimentacaoRepository.find({
            where: filtros,
            relations: { insumo: true },
            order: { timestamp: 'DESC'},
        });

        if (movimentacoes.length == 0) {
            throw new AppError("Movimentação não encontrada.", 404)
        }

        return this.enriquecerComUsuarios(movimentacoes);
    };

    private async enriquecerComUsuarios(movimentacoes: Movimentacao[]): Promise<Movimentacao[]> {
        if (movimentacoes.length === 0) return movimentacoes;

        const userIds = [...new Set(movimentacoes.map(m => m.registrado_por).filter(Boolean))];
        if (userIds.length === 0) return movimentacoes;

        const usuarios = await this.usuarioRepository.find({
            where: { id: In(userIds) }
        });

        const userMap = new Map<string, string>();
        for (const u of usuarios) {
            userMap.set(u.id, u.nome);
        }

        return movimentacoes.map(m => ({
            ...m,
            usuario: { nome: userMap.get(m.registrado_por) || "Usuário Desconhecido" }
        })) as unknown as Movimentacao[];
    }

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
            if (insumo.estoque_maximo !== null || insumo.estoque_maximo !== undefined){
                const novaQuantidadeTotal = estoqueAtual + Number(data.quantidade);
                if (novaQuantidadeTotal > insumo.estoque_maximo!) {
                    throw new AppError("Quantidade excede o valor definido para estoque maximo", 422);
                }
                    
            }

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
        insumo.status_estoque = calcularStatus(insumo);
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