import { ILike, type FindOptionsWhere } from "typeorm";
import type { Insumo } from "../entities/Insumo.js";

export interface InsumoQueryParams {
    nome?: string;
    codigo?: string;
    categoriaId?: string;
    statusEstoque?: string;
    insumoAtivo?: boolean
}

export function createFilter(dados: InsumoQueryParams): FindOptionsWhere<Insumo> |  FindOptionsWhere<Insumo>[] {

    if (!dados.nome && !dados.codigo) {
        const filtros: FindOptionsWhere<Insumo> = {};
        if (dados.categoriaId) filtros.categoria_id = dados.categoriaId;
        if (dados.statusEstoque) filtros.status_estoque = dados.statusEstoque;
        if (dados.insumoAtivo) filtros.ativo = dados.insumoAtivo;

        return filtros;
    }

    // Se houver nome ou codigo, cria condicao de OR
    const criterios: FindOptionsWhere<Insumo>[] = [];
    const baseFiltros: FindOptionsWhere<Insumo> = {};

    if (dados.categoriaId) baseFiltros.categoria_id = dados.categoriaId;
    if (dados.statusEstoque) baseFiltros.status_estoque = dados.statusEstoque;
    if (dados.insumoAtivo) baseFiltros.ativo = dados.insumoAtivo;

    if (dados.nome) {
        criterios.push({ ...baseFiltros, nome: ILike(`%${dados.nome}%`)});
    }

    if (dados.codigo) {
        criterios.push({ ...baseFiltros, codigo: ILike(`%${dados.codigo}%`)});
    }

    return criterios;
}
