import type { Insumo } from "../entities/Insumo.js";

export function calcularStatus(insumo: Insumo): string {
  if (insumo.estoque_atual < insumo.estoque_minimo) return 'critico';
  if (insumo.estoque_maximo && insumo.estoque_atual > insumo.estoque_maximo) return 'excesso';
  return 'normal';
}