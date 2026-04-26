import type { Repository } from "typeorm";
import { Usuario } from "../entities/Usuario.js";
import { Sessao } from "../entities/Sessao.js";
import { appDataSource } from "../database/appDataSource.js";
import { createHash } from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_ACCESS_EXPIRES_IN, JWT_ACCESS_SECRET, JWT_REFRESH_EXPIRES_IN_DAYS, JWT_REFRESH_SECRET } from "../config/jwt.js";
import { AppError } from "../errors/AppError.js";
import { compare, hash } from "bcryptjs";

interface AccessTokenPayload {
    sub: string;
    perfil: string;
    nome: string;
}

interface RefreshTokenPayload {
    sub: string;
    sid: string;
}

export class AuthService {
    private usuarioRepository: Repository<Usuario>;
    private sessaoRepository: Repository<Sessao>;

    constructor() {
        this.usuarioRepository = appDataSource.getRepository(Usuario);
        this.sessaoRepository = appDataSource.getRepository(Sessao);
    }

    private hashToken (token: string): string {
        return createHash("sha256").update(token).digest("hex")
    }

    private gerarAccessToken(usuario: Usuario): string {
        const payload: AccessTokenPayload = {
            sub: usuario.id,
            perfil: usuario.perfil_acesso,
            nome: usuario.nome
        };
        return (jwt.sign as Function)(payload, JWT_ACCESS_SECRET, {expiresIn: JWT_ACCESS_EXPIRES_IN})
    }

    private gerarRefreshToken(sessaoId: string, usuarioId: string): string {
        const payload: RefreshTokenPayload = {
            sub: usuarioId,
            sid: sessaoId,
        };
        return (jwt.sign as Function)(payload, JWT_REFRESH_SECRET, {
            expiresIn: `${JWT_REFRESH_EXPIRES_IN_DAYS}d`,
        });
    }

    async login(email: string, senha: string, meta?: { ip?: string; userAgent?: string}){
        const usuario = await this.usuarioRepository.findOne({
            where: { email },
            select: ["id", "nome", "email", "senha_hash", "perfil_acesso", "ativo", "trocar_senha"]
        });

        if (!usuario) {
            throw new AppError("Credenciais inválidas", 401);
        }
        if (!usuario.ativo) {
            throw new AppError("Usuário inativo", 401);
        }

        // comparar senha com hash
        const senhaCorreta = await compare(senha, usuario.senha_hash);
        if (!senhaCorreta) {
            throw new AppError("Credenciais inválidas", 401);
        }

        // criar sessao no banco
        const sessao = this.sessaoRepository.create({
            usuario,
            refresh_token_hash: "",
            expires_at: new Date(),
            ip: meta?.ip ?? null,
            user_agent: meta?.userAgent ?? null,
        });

        await this.sessaoRepository.save(sessao);

        // gerando tokens
        const refreshToken = this.gerarRefreshToken(sessao.id, usuario.id);
        const accessToken = this.gerarAccessToken(usuario);

        sessao.refresh_token_hash = this.hashToken(refreshToken);
        sessao.expires_at = new Date(Date.now() + JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

        await this.sessaoRepository.save(sessao);

        return {
            accessToken,
            refreshToken,
            trocarSenha: usuario.trocar_senha,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil_acesso: usuario.perfil_acesso,
            },
        };

    }

    async refresh(refreshToken: string) {
        // verificacao de assinatura
        let payload: JwtPayload;
        try {
            payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET!) as JwtPayload;
        } catch {
            throw new AppError("Refresh token inválido", 401);
        }
        const { sid: sessaoId, sub: usuarioId } = payload;
        if (!sessaoId || !usuarioId) {
            throw new AppError("Refresh token inválido", 401);
        }

        // buscar de sessao
        const sessao = await this.sessaoRepository.findOne({
            where: { id: sessaoId },
            relations: { usuario: true },
        });

        // validacao
        if (!sessao || sessao.revoked_at) throw new AppError("Sessão inválida", 401);
        if (sessao.expires_at < new Date()) throw new AppError("Refresh token expirado", 401);
        if (sessao.refresh_token_hash !== this.hashToken(refreshToken)) {
            throw new AppError("Refresh token inválido", 401);
        }
        if (sessao.usuario_id !== usuarioId) throw new AppError("Sessão inválida", 401);

        const usuario = sessao.usuario;
        if (!usuario || !usuario.ativo) throw new AppError("Usuário inválido", 401);

        // revogacao de sessao antiga
        sessao.revoked_at = new Date();
        await this.sessaoRepository.save(sessao);

        // nova sessao
        const novaSessao = this.sessaoRepository.create({
            usuario,
            refresh_token_hash: "",
            expires_at: new Date(),
            ip: sessao.ip,
            user_agent: sessao.user_agent,
        });

        await this.sessaoRepository.save(novaSessao);

        const novoRefreshToken = this.gerarRefreshToken(novaSessao.id, usuario.id);
        novaSessao.refresh_token_hash = this.hashToken(novoRefreshToken);
        novaSessao.expires_at = new Date(
            Date.now() + JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
        );
        await this.sessaoRepository.save(novaSessao);

        const accessToken = this.gerarAccessToken(usuario);
        return {
            accessToken,
            refreshToken: novoRefreshToken,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil_acesso: usuario.perfil_acesso,
            },
        };
    }

    async logout(refreshToken: string) {
        let payload: JwtPayload;
        try {
            payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET!) as JwtPayload;
        } catch {
            throw new AppError("Refresh token inválido", 401);
        }

        const sessaoId = payload.sid;
        if (!sessaoId) throw new AppError("Refresh token inválido", 401);

        const sessao = await this.sessaoRepository.findOne({ where: { id: sessaoId } });

        if (!sessao) return;
        if (sessao.refresh_token_hash !== this.hashToken(refreshToken)) {
            throw new AppError("Refresh token inválido", 401);
        }

        sessao.revoked_at = new Date();
        await this.sessaoRepository.save(sessao);
    }

    async trocarSenha(usuarioId: string, senhaAtual: string, novaSenha: string) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: usuarioId },
            select: ["id", "senha_hash", "trocar_senha"],
        });

        if (!usuario) throw new AppError("Usuário inválido", 400);

        const senhaCorreta = await compare(senhaAtual, usuario.senha_hash);
        if (!senhaCorreta) throw new AppError("Senha atual incorreta", 401);
       
        usuario.senha_hash = await hash(novaSenha, 10);
        usuario.trocar_senha = false;
        await this.usuarioRepository.save(usuario);
    }

}
