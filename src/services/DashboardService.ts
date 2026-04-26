import { Between, Raw } from "typeorm";
import { appDataSource } from "../database/appDataSource.js";
import { Insumo } from "../entities/Insumo.js";
import { Movimentacao } from "../entities/Movimentacao.js";
import type { DashboardData } from "../utils/dashboardTypes.js";

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

        const insumosCriticos = await this.insumoRepository.find({
            where: {
                estoque_atual: Raw((alias) => `${alias} <= estoque_minimo`)
            },
            relations: { categoria: true }
        });

        const insumosCriticosFormatted = insumosCriticos.map((insumo) => {
            const min = Number(insumo.estoque_minimo);
            const atual = Number(insumo.estoque_atual);
            let percentual = 0;
            if (min > 0) {
                percentual = (atual / min) * 100;
            }
            
            return {
                id: insumo.id,
                nome: insumo.nome,
                codigo: insumo.codigo,
                categoria: insumo.categoria?.nome || 'Sem Categoria',
                estoque_atual: atual,
                estoque_minimo: min,
                percentual: Math.min(Math.round(percentual), 100)
            };
        });

        insumosCriticosFormatted.sort((a, b) => a.percentual - b.percentual);

        return {
            totalInsumosAbaixoMinimo,
            totalInsumosZerados,
            movimentacoesHoje,
            totalUnidadesEstoque: Number(totalUnidades) || 0,
            insumosCriticos: insumosCriticosFormatted
        };
    };

}
