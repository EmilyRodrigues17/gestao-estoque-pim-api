import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Insumo } from "./Insumo.js";

@Entity("categoria")
export class Categoria {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", nullable: false, unique: true })
    nome!: string;

    @Column({ type: "varchar", nullable: true })
    descricao?: string | null;

    @CreateDateColumn({nullable: false, type: "timestamptz"})
    created_at!: Date;

    @UpdateDateColumn({nullable: false, type: "timestamptz"})
    updated_at!: Date;

    @OneToMany(() => Insumo, (insumo) => insumo.categoria)
    insumos!: Insumo[]
}
