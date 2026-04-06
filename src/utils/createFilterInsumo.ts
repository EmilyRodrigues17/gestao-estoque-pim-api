import { ILike, type FindOptionsWhere } from "typeorm";
import type { Insumo } from "../entities/Insumo.js";

export interface InsumoQueryParams {
    nome?: string;
    codigo?: string;
    categoriaId?: string;
}

export function createFilter(dados: InsumoQueryParams): FindOptionsWhere<Insumo> {
    const filtros: FindOptionsWhere<Insumo> = {};

    if (dados.nome) {
        filtros.nome = ILike(`%${dados.nome}%`);
    }

    if (dados.codigo) {
        filtros.codigo = ILike(`%${dados.codigo}%`);
    }

    if (dados.categoriaId) {
        filtros.categoria_id = dados.categoriaId;
    }

    return filtros;
}
