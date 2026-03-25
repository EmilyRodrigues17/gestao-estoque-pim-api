import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoMovimentacao } from "../types/tipoMovimentacao.js";
import { MotivoMovimentacao } from "../types/motivoMovimentacao.js";
import { Insumo } from "./Insumo.js";

@Entity("movimentacao")
export class Movimentacao {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "enum", enum: TipoMovimentacao, nullable: false})
    tipo!: TipoMovimentacao;

    @Column({ type: "enum", enum: MotivoMovimentacao, nullable: false})
    motivo!: MotivoMovimentacao;

    @Column({ type: "numeric", nullable: false})
    quantidade!: number;

    @Column({ type: "numeric", nullable: false})
    saldo_apos!: number;

    @Column({ type: "varchar", nullable: true})
    linha_destino?: string;

    @Column({ type: "varchar", nullable: true})
    observacao?: string;

    @Column({ type: "varchar", nullable: false })
    registrado_por!: string;

    @Column({nullable: false, type: "timestamptz"})
    timestamp!: Date;

    @ManyToOne(() => Insumo, (insumo) => insumo.movimentacoes)
    @JoinColumn({ name: "insumo_id"})
    insumo_id!: Insumo

}