import { Between, LessThanOrEqual, MoreThanOrEqual, type FindOptionsWhere } from "typeorm";
import type { Movimentacao } from "../entities/Movimentacao.js";

export interface MovimentacaoQueryParams {
    insumo_id?: string;
    tipo?: string;
    motivo?: string;
    dataInicio?: string;
    dataFim?: string;
}

export function createFilterMovimentacao(dados: MovimentacaoQueryParams): FindOptionsWhere<Movimentacao> {
    const filtros: FindOptionsWhere<Movimentacao> = {};

    if (dados.insumo_id) {
        filtros.insumo_id = dados.insumo_id;
    }

    if (dados.tipo) {
        filtros.tipo = dados.tipo as any;
    }

    if (dados.motivo) {
        filtros.motivo = dados.motivo as any;
    }

    if (dados.dataInicio && dados.dataFim) {
        filtros.timestamp = Between(new Date(dados.dataInicio), new Date(dados.dataFim));
    } else if (dados.dataInicio) {
        filtros.timestamp = MoreThanOrEqual(new Date(dados.dataInicio));
    } else if (dados.dataFim) {
        filtros.timestamp = LessThanOrEqual(new Date(dados.dataFim));
    }

    return filtros;
}
