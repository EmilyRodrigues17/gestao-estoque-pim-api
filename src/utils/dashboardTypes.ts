export interface InsumoCriticoFormatted {
    id: string;
    nome: string;
    codigo: string;
    categoria: string;
    estoque_atual: number;
    estoque_minimo: number;
    percentual: number;
}

export interface DashboardData {
    totalInsumosAbaixoMinimo: number;
    totalInsumosZerados: number;
    movimentacoesHoje: number;
    totalUnidadesEstoque: number;
    insumosCriticos: InsumoCriticoFormatted[];
}
