import { appDataSource } from "../database/appDataSource.js";
import { Usuario } from "../entities/Usuario.js";
import { AppError } from "../errors/AppError.js";
import { hash } from "bcryptjs";
import type { CreateUsuarioSchemaDTO, UpdateUsuarioSchemaDTO } from "../dto/usuarioSchemaDTO.js";

export class UsuarioService {
    private usuarioRepository = appDataSource.getRepository(Usuario);

    public async findAll() {
        return this.usuarioRepository.find({ order: { nome: "ASC" } });
    }

    public async getById(id: string): Promise<Usuario> {
        const usuario = await this.usuarioRepository.findOne({ where: { id } });
        if (!usuario) {
            throw new AppError("Usuário não encontrado", 404);
        }
        return usuario;
    };

    public async create(data: CreateUsuarioSchemaDTO): Promise<Usuario> {
        const usuarioExiste = await this.usuarioRepository.findOne({ where: { email: data.email } });
        if (usuarioExiste) {
            throw new AppError("Email já cadastrado", 409);
        }

        const novoUsuario = this.usuarioRepository.create({
            nome: data.nome,
            email: data.email,
            senha_hash: await hash(data.senha, 10),
            perfil_acesso: data.perfil_acesso,
            ativo: true,
            trocar_senha: true,
        });

        await this.usuarioRepository.save(novoUsuario);
        return novoUsuario;
    };

    public async update(id: string, data: UpdateUsuarioSchemaDTO): Promise<Usuario> {
        const usuarioExiste = await this.getById(id);
        
        if (data.email && data.email !== usuarioExiste.email) {
            const usuarioComMesmoEmail = await this.usuarioRepository.findOne({ where: { email: data.email } });
            if (usuarioComMesmoEmail) {
                throw new AppError("Email já está em uso", 409);
            }
        }

        const dadosUpdate = Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined)
        ) as Partial<Usuario>;

        const usuarioAtualizado = this.usuarioRepository.merge(usuarioExiste, dadosUpdate);
        await this.usuarioRepository.save(usuarioAtualizado);
        return usuarioAtualizado;
    };

    public async delete(id: string) {
        const usuario = await this.getById(id);
        if (!usuario) {
            throw new AppError("Usuário não encontrado", 404);
        }
        
        await this.usuarioRepository.remove(usuario);
    };
}
