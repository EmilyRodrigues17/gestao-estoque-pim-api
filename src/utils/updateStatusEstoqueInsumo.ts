import type { Insumo } from "../entities/Insumo.js";
import { EstoqueStatus } from "../types/insumoFormatado.js";

export function calcularStatus(insumo: Insumo): string {
  const atual = Number(insumo.estoque_atual);
  const min = Number(insumo.estoque_minimo);
  const max = insumo.estoque_maximo ? Number(insumo.estoque_maximo) : null;
  const maxCalculo = max ?? (min + 200);

  if (atual <= min) {
    return EstoqueStatus.CRITICO;
  }

  if (atual <= min * 1.1) {
    return EstoqueStatus.ATENCAO;
  }

  if (atual >= maxCalculo * 0.95) {
    return EstoqueStatus.LIMITE_PROXIMO;
  }

  return EstoqueStatus.ESTAVEL;
}