export enum EstoqueStatus {
    CRITICO = 'critico',
    ATENCAO = 'atencao',
    ESTAVEL = 'estavel',
    LIMITE_PROXIMO = 'limite_proximo'
}

export interface InsumoFormatado {
    id: string;
    nome: string;
    codigo: string;
    categoria: string;
    estoque_atual: number;
    estoque_minimo: number;
    estoque_maximo: number | null;
    percentual: number;
    status: EstoqueStatus;
}