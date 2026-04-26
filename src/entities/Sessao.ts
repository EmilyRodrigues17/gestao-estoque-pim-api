import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./Usuario.js";

@Entity("sessao")
export class Sessao {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "usuario_id", type: "uuid" })
    usuario_id!: string;

    @ManyToOne(() => Usuario, (usuario) => usuario.sessoes, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "usuario_id" })
    usuario!: Usuario;

    @Column({ type: "varchar", nullable: false })
    refresh_token_hash!: string;

    @Column({ type: "timestamptz", nullable: false })
    expires_at!: Date;

    @Column({ type: "timestamptz", nullable: true })
    revoked_at!: Date | null;

    @Column({ type: "varchar", nullable: true })
    ip!: string | null;

    @Column({ type: "varchar", nullable: true })
    user_agent!: string | null;

    @CreateDateColumn({ type: "timestamptz" })
    created_at!: Date;
}