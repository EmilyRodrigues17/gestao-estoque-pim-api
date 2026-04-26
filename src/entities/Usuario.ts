import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PerfilAcesso } from "../types/perfilAcesso.js";
import { Sessao } from "./Sessao.js";

@Entity("usuario")
export class Usuario {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", nullable: false})
    nome!: string;

    @Column({ type: "varchar", unique: true, nullable: false})
    email!: string;

    @Column({ type: "varchar", nullable: false, select: false})
    senha_hash!: string;

    @Column({ type: "enum", enum: PerfilAcesso, nullable: false})
    perfil_acesso!: PerfilAcesso;

    @Column({ type: "boolean", default: true, nullable: false })
    ativo!: boolean;

    @Column({ type: "boolean", default: true, nullable: false })
    trocar_senha!: boolean;

    @CreateDateColumn({nullable: false, type: "timestamptz"})
    created_at!: Date;
        
    @UpdateDateColumn({nullable: false, type: "timestamptz"})
    updated_at!: Date;

    @OneToMany(() => Sessao, (sessao) => sessao.usuario)
    sessoes!: Sessao[];

}
