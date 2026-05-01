import { Between, Raw } from "typeorm";
import { appDataSource } from "../database/appDataSource.js";
import { Insumo } from "../entities/Insumo.js";
import { Movimentacao } from "../entities/Movimentacao.js";
import type { DashboardData } from "../utils/dashboardTypes.js";
import { EstoqueStatus, type InsumoFormatado } from "../types/insumoFormatado.js";

export default class DashboardService {
    private insumoRepository = appDataSource.getRepository(Insumo);
    private movimentacaoRepository = appDataSource.getRepository(Movimentacao);

    public async getDashboardData(): Promise<DashboardData> {
        const totalInsumosAbaixoMinimo = await this.insumoRepository.count({
            where: {
                estoque_atual: Raw((alias) => `${alias} < estoque_minimo AND ${alias} > 0`)
            }
        });

        const totalInsumosZerados = await this.insumoRepository.count({
            where: { 
                estoque_atual: 0 
            }
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const movimentacoesHoje = await this.movimentacaoRepository.count({
            where: {
                timestamp: Between(todayStart, todayEnd)
            }
        });

        const totalUnidades = await this.insumoRepository.sum("estoque_atual");

        const totalInsumos = await this.insumoRepository.find({
            relations: { categoria: true }
        });

        const insumosProcessados = totalInsumos.map(insumo => this.formatarInsumo(insumo));

        const insumosAlertas = insumosProcessados
            .filter(i => i.status === EstoqueStatus.ATENCAO || i.status === EstoqueStatus.CRITICO)
            .sort((a, b) => this.getPrioridade(a.status) - this.getPrioridade(b.status));
    

        return {
            totalInsumosAbaixoMinimo,
            totalInsumosZerados,
            movimentacoesHoje,
            totalUnidadesEstoque: Number(totalUnidades) || 0,
            insumosCriticos: insumosAlertas
        };
    };

    private formatarInsumo(insumo: Insumo): InsumoFormatado {
        
        const atual = Number(insumo.estoque_atual);
        const min = Number(insumo.estoque_minimo);
        const max = insumo.estoque_maximo ? Number(insumo.estoque_maximo) : null;
        const maxCalculo = max ?? (min + 200);

        const percentualBruto = maxCalculo > 0 ? (atual/maxCalculo) * 100 : 0;
        const percentual = Math.min(Math.round(percentualBruto), 100);
        
        let status = EstoqueStatus.ESTAVEL;

        if (atual <= min) {
            status = EstoqueStatus.CRITICO;
        } 
 
        else if (atual <= min * 1.1) {
            status = EstoqueStatus.ATENCAO;
        }
       
        else if (atual >= maxCalculo * 0.95) {
            status = EstoqueStatus.LIMITE_PROXIMO;
        }

        return {
            id: insumo.id,
            nome: insumo.nome,
            codigo: insumo.codigo,
            categoria: insumo.categoria?.nome || 'Sem Categoria',
            estoque_atual: atual,
            estoque_minimo: min,
            estoque_maximo: max,
            percentual: percentual,
            status
        };
    }

    private getPrioridade(status: EstoqueStatus): number {
        const ordem = {
            [EstoqueStatus.CRITICO]: 1,
            [EstoqueStatus.ATENCAO]: 2,
            [EstoqueStatus.LIMITE_PROXIMO]: 3,
            [EstoqueStatus.ESTAVEL]: 4,
        };
        return ordem[status];
    }

}
