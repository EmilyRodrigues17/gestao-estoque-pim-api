import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Categoria } from "./Categoria.js";
import { Movimentacao } from "./Movimentacao.js";

@Entity("insumo")
export class Insumo {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true, nullable: false})
    codigo!: string;

    @Column({ type: "varchar", nullable: false})
    nome!: string;

    @Column({ type: "varchar", nullable: true})
    descricao?: string | null;

    @Column({ type: "varchar", nullable: false})
    unidade_medida!: string;

    @Column({ type: "numeric", default: 0, nullable: false})
    estoque_atual!: number;

    @Column({ type: "numeric", nullable: false})
    estoque_minimo!: number;

    @Column({ type: "numeric", nullable: true})
    estoque_maximo?: number | null;

    @Column({ type: "varchar", nullable: true})
    localizacao?: string | null;

    @Column({ type: "boolean", default: true, nullable: false})
    ativo?: boolean;

    @Column({ type: "varchar", default: 'critico', nullable: false})
    status_estoque!: string;

    @CreateDateColumn({nullable: false, type: "timestamptz"})
    created_at!: Date;
    
    @UpdateDateColumn({nullable: false, type: "timestamptz"})
    updated_at!: Date;

    @Column({ name: "categoria_id", type: "uuid" })
    categoria_id!: string;

    @ManyToOne(() => Categoria, (categoria) => categoria.insumos)
    @JoinColumn({ name: "categoria_id"})
    categoria!: Categoria

    @OneToMany(() => Movimentacao, (movimentacao) => movimentacao.insumo)
    movimentacoes!: Movimentacao[]
}