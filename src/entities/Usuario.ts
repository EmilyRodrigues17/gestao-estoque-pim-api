import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("usuario")
export class Usuario {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true, nullable: false})
    nome!: string;

    @Column({ type: "varchar", unique: true, nullable: false})
    email!: string;

    @Column({ type: "varchar", unique: true, nullable: false})
    senha!: string;

    @Column({ type: "varchar", unique: true, nullable: false})
    nivel_acesso!: string;

    @CreateDateColumn({nullable: false, type: "timestamptz"})
    created_at!: Date;
        
    @UpdateDateColumn({nullable: false, type: "timestamptz"})
    updated_at!: Date;

}