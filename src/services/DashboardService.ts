import { appDataSource } from "../database/appDataSource.js";
import { Insumo } from "../entities/Insumo.js";
import { Movimentacao } from "../entities/Movimentacao.js";

export default class DashboardService {
    private insumoRepository = appDataSource.getRepository(Insumo);
    private movimentacaoRepository = appDataSource.getRepository(Movimentacao);

    public async getDashboardData() {
        const totalInsumosAbaixoMinimo = await this.insumoRepository
            .createQueryBuilder("insumo")
            .where("insumo.estoque_atual < insumo.estoque_minimo")
            .andWhere("insumo.estoque_atual > 0")
            .getCount();

        const totalInsumosZerados = await this.insumoRepository
            .createQueryBuilder("insumo")
            .where("insumo.estoque_atual = 0")
            .getCount();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const movimentacoesHoje = await this.movimentacaoRepository
            .createQueryBuilder("movimentacao")
            .where("movimentacao.timestamp >= :start", { start: todayStart })
            .andWhere("movimentacao.timestamp <= :end", { end: todayEnd })
            .getCount();

        const { totalUnidades } = await this.insumoRepository
            .createQueryBuilder("insumo")
            .select("SUM(insumo.estoque_atual)", "totalUnidades")
            .getRawOne();

        const insumosCriticos = await this.insumoRepository
            .createQueryBuilder("insumo")
            .leftJoinAndSelect("insumo.categoria", "categoria")
            .where("insumo.estoque_atual <= insumo.estoque_minimo")
            .getMany();

        const insumosCriticosFormatted = insumosCriticos.map(insumo => {
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
    }
}
