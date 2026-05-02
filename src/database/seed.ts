import "dotenv/config";
import { hash } from "bcryptjs";
import { appDataSource } from "./appDataSource.js";
import { Usuario } from "../entities/Usuario.js";
import { Categoria } from "../entities/Categoria.js";
import { Insumo } from "../entities/Insumo.js";
import { Movimentacao } from "../entities/Movimentacao.js";
import { PerfilAcesso } from "../types/perfilAcesso.js";
import { TipoMovimentacao } from "../types/tipoMovimentacao.js";
import { MotivoMovimentacao } from "../types/motivoMovimentacao.js";

async function seed() {
    try {
        await appDataSource.initialize();
        console.log("[\u2713] Banco conectado para seed");

        const usuarioRepo = appDataSource.getRepository(Usuario);
        const categoriaRepo = appDataSource.getRepository(Categoria);
        const insumoRepo = appDataSource.getRepository(Insumo);
        const movimentacaoRepo = appDataSource.getRepository(Movimentacao);

        const senhaPadrao = await hash("123456", 10);

        // 1. Criar Usu\u00e1rios
        console.log("\n[+] Populando Usu\u00e1rios...");
        const usuariosDados = [
            {
                nome: "Administrador Sistema",
                email: "adm@estoquepim.com",
                senha_hash: senhaPadrao,
                perfil_acesso: PerfilAcesso.ADM,
                ativo: true,
                trocar_senha: false,
            },
            {
                nome: "Carlos Gestor",
                email: "carlos.gestor@estoquepim.com",
                senha_hash: senhaPadrao,
                perfil_acesso: PerfilAcesso.GESTOR,
                ativo: true,
                trocar_senha: true,
            },
            {
                nome: "Maria Almoxarife",
                email: "maria.almoxarife@estoquepim.com",
                senha_hash: senhaPadrao,
                perfil_acesso: PerfilAcesso.ALMOXARIFE,
                ativo: true,
                trocar_senha: true,
            },
        ];

        const usuariosMap = new Map<string, Usuario>();
        for (const dados of usuariosDados) {
            let usuario = await usuarioRepo.findOne({ where: { email: dados.email } });
            if (!usuario) {
                usuario = usuarioRepo.create(dados);
                await usuarioRepo.save(usuario);
                console.log(`  - Usu\u00e1rio "${dados.nome}" criado`);
            } else {
                console.log(`  - Usu\u00e1rio "${dados.email}" j\u00e1 existe`);
            }
            usuariosMap.set(dados.email, usuario);
        }

        // 2. Criar Categorias
        console.log("\n[+] Populando Categorias...");
        const categoriasDados = [
            { nome: "Componentes Eletroeletr\u00f4nicos", descricao: "Capacitores, resistores, ICs e transistores" },
            { nome: "Fixa\u00e7\u00e3o e Mec\u00e2nica", descricao: "Parafusos, suportes e estruturas milim\u00e9tricas" },
            { nome: "Qu\u00edmicos e Solda", descricao: "Pasta de solda, fluxo, estanho e solventes isoprop\u00edlicos" },
            { nome: "Embalagem", descricao: "Caixas anti-est\u00e1ticas e materiais de prote\u00e7\u00e3o" },
            { nome: "Placas PCB", descricao: "Placas de circuito impresso virgens e pr\u00e9-montadas" },
        ];

        const categoriasMap = new Map<string, Categoria>();
        for (const dados of categoriasDados) {
            let categoria = await categoriaRepo.findOne({ where: { nome: dados.nome } });
            if (!categoria) {
                categoria = categoriaRepo.create(dados);
                await categoriaRepo.save(categoria);
                console.log(`  - Categoria "${dados.nome}" criada`);
            } else {
                console.log(`  - Categoria "${dados.nome}" j\u00e1 existe`);
            }
            categoriasMap.set(dados.nome, categoria);
        }

        // 3. Criar Insumos
        console.log("\n[+] Populando Insumos...");
        const insumosDados = [
            {
                codigo: "INS-001",
                nome: "Capacitor Cer\u00e2mico 100nF 0603",
                descricao: "Capacitor SMD para desacoplamento de alta frequ\u00eancia",
                unidade_medida: "un",
                estoque_atual: 50,
                estoque_minimo: 200,
                estoque_maximo: 1000,
                localizacao: "Prateleira A1 - Gaveta 05",
                categoria: "Componentes Eletroeletr\u00f4nicos",
            },
            {
                codigo: "INS-002",
                nome: "Resistor 10k Ohm 1/8W 0805",
                descricao: "Resistor SMD para pull-up/pull-down",
                unidade_medida: "un",
                estoque_atual: 5000,
                estoque_minimo: 1000,
                estoque_maximo: 20000,
                localizacao: "Prateleira A1 - Gaveta 12",
                categoria: "Componentes Eletroeletr\u00f4nicos",
            },
            {
                codigo: "INS-003",
                nome: "Parafuso M2 x 4mm Philips",
                descricao: "Parafuso para fixa\u00e7\u00e3o de carca\u00e7as de smartphones",
                unidade_medida: "un",
                estoque_atual: 0,
                estoque_minimo: 500,
                estoque_maximo: 2000,
                localizacao: "Prateleira B2 - Gaveta 01",
                categoria: "Fixa\u00e7\u00e3o e Mec\u00e2nica",
            },
            {
                codigo: "INS-004",
                nome: "Pasta de Solda Sn63Pb37 - 500g",
                descricao: "Pasta de solda para processo Reflow",
                unidade_medida: "pote",
                estoque_atual: 8,
                estoque_minimo: 10,
                estoque_maximo: 30,
                localizacao: "Geladeira Industrial 02",
                categoria: "Qu\u00edmicos e Solda",
            },
            {
                codigo: "INS-005",
                nome: "Placa PCB Main Board TV 50\"",
                descricao: "Placa virgem para montagem de TV",
                unidade_medida: "un",
                estoque_atual: 15,
                estoque_minimo: 40,
                estoque_maximo: 100,
                localizacao: "Prateleira C1",
                categoria: "Placas PCB",
            },
            {
                codigo: "INS-006",
                nome: "\u00c1lcool Isoprop\u00edlico 99.8%",
                descricao: "Limpeza de res\u00edduos de fluxo p\u00f3s-soldagem",
                unidade_medida: "litro",
                estoque_atual: 45,
                estoque_minimo: 20,
                estoque_maximo: 100,
                localizacao: "Arm\u00e1rio de Inflam\u00e1veis",
                categoria: "Qu\u00edmicos e Solda",
            },
            {
                codigo: "INS-007",
                nome: "Caixa Master TV 50\"",
                descricao: "Embalagem externa para expedi\u00e7\u00e3o",
                unidade_medida: "un",
                estoque_atual: 120,
                estoque_minimo: 100,
                estoque_maximo: 500,
                localizacao: "Setor de Expedi\u00e7\u00e3o",
                categoria: "Embalagem",
            },
        ];

        const insumosMap = new Map<string, Insumo>();
        for (const dados of insumosDados) {
            let insumo = await insumoRepo.findOne({ where: { codigo: dados.codigo } });
            const categoria = categoriasMap.get(dados.categoria);
            
            if (!categoria) continue;

            const status = Number(dados.estoque_atual) === 0 ? 'zerado' : 
                           Number(dados.estoque_atual) < Number(dados.estoque_minimo) ? 'critico' : 
                           (dados.estoque_maximo && Number(dados.estoque_atual) > Number(dados.estoque_maximo)) ? 'excesso' : 'normal';

            const insumoData = {
                codigo: dados.codigo,
                nome: dados.nome,
                descricao: dados.descricao,
                unidade_medida: dados.unidade_medida,
                estoque_atual: dados.estoque_atual,
                estoque_minimo: dados.estoque_minimo,
                estoque_maximo: dados.estoque_maximo,
                localizacao: dados.localizacao,
                categoria_id: categoria.id,
                status_estoque: status,
                ativo: true,
            };

            if (!insumo) {
                insumo = insumoRepo.create(insumoData);
                await insumoRepo.save(insumo);
                console.log(`  - Insumo "${dados.nome}" (${dados.codigo}) criado - Status: ${status}`);
            } else {
                console.log(`  - Insumo "${dados.codigo}" j\u00e1 existe, atualizando status...`);
                insumo.status_estoque = status;
                await insumoRepo.save(insumo);
            }
            insumosMap.set(dados.codigo, insumo);
        }

        // 4. Criar Movimenta\u00e7\u00f5es (Algumas para dar hist\u00f3rico)
        console.log("\n[+] Populando Movimenta\u00e7\u00f5es...");
        const almoxarife = usuariosMap.get("maria.almoxarife@estoquepim.com");
        if (!almoxarife) throw new Error("Usu\u00e1rio almoxarife n\u00e3o encontrado para registrar movimenta\u00e7\u00f5es");

        const movimentacoesDados = [
            {
                insumo_cod: "INS-001",
                tipo: TipoMovimentacao.ENTRADA,
                motivo: MotivoMovimentacao.COMPRA,
                quantidade: 50,
                saldo_apos: 50,
                observacao: "Entrada inicial de lote de capacitores",
                registrado_por: almoxarife.nome,
            },
            {
                insumo_cod: "INS-002",
                tipo: TipoMovimentacao.ENTRADA,
                motivo: MotivoMovimentacao.COMPRA,
                quantidade: 6000,
                saldo_apos: 6000,
                observacao: "Recebimento de bobinas SMT",
                registrado_por: almoxarife.nome,
            },
            {
                insumo_cod: "INS-002",
                tipo: TipoMovimentacao.SAIDA,
                motivo: MotivoMovimentacao.CONSUMO,
                quantidade: 1000,
                saldo_apos: 5000,
                linha_destino: "Linha SMT 03",
                observacao: "Abastecimento para produ\u00e7\u00e3o de placas de TV",
                registrado_por: almoxarife.nome,
            },
            {
                insumo_cod: "INS-004",
                tipo: TipoMovimentacao.ENTRADA,
                motivo: MotivoMovimentacao.COMPRA,
                quantidade: 10,
                saldo_apos: 10,
                observacao: "Reposi\u00e7\u00e3o de pasta de solda",
                registrado_por: almoxarife.nome,
            },
            {
                insumo_cod: "INS-004",
                tipo: TipoMovimentacao.SAIDA,
                motivo: MotivoMovimentacao.PERDA,
                quantidade: 2,
                saldo_apos: 8,
                observacao: "Potes vencidos identificados na inspe\u00e7\u00e3o",
                registrado_por: almoxarife.nome,
            },
        ];

        for (const dados of movimentacoesDados) {
            const insumo = insumosMap.get(dados.insumo_cod);
            if (!insumo) continue;

            // Verificar se j\u00e1 existem movimenta\u00e7\u00f5es para evitar duplica\u00e7\u00e3o em re-runs de seed (opcional, mas bom)
            const existe = await movimentacaoRepo.findOne({ where: { insumo_id: insumo.id, observacao: dados.observacao } });
            if (existe) {
                console.log(`  - Movimenta\u00e7\u00e3o para "${dados.insumo_cod}" j\u00e1 registrada (${dados.observacao})`);
                continue;
            }

            const mov = movimentacaoRepo.create({
                insumo_id: insumo.id,
                tipo: dados.tipo,
                motivo: dados.motivo,
                quantidade: dados.quantidade,
                saldo_apos: dados.saldo_apos,
                linha_destino: dados.linha_destino,
                observacao: dados.observacao,
                registrado_por: dados.registrado_por,
            });
            await movimentacaoRepo.save(mov);
            console.log(`  - Movimenta\u00e7\u00e3o de ${dados.tipo} registrada para ${dados.insumo_cod}`);
        }

        console.log("\n[\u2713] Seed conclu\u00eddo com sucesso!");
        await appDataSource.destroy();
        process.exit(0);
    } catch (err) {
        console.error("\n[X] Erro no seed:", err);
        process.exit(1);
    }
}

seed();