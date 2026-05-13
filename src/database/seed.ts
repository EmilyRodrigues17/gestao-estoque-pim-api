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
import { calcularStatus } from "../utils/updateStatusEstoqueInsumo.js";

async function seed() {
    try {
        await appDataSource.initialize();
        console.log("[\u2713] Banco conectado para seed");

        const usuarioRepo = appDataSource.getRepository(Usuario);
        const categoriaRepo = appDataSource.getRepository(Categoria);
        const insumoRepo = appDataSource.getRepository(Insumo);
        const movimentacaoRepo = appDataSource.getRepository(Movimentacao);
        const sessaoRepo = appDataSource.getRepository("sessao");

        console.log("\n[!] Limpando dados antigos do banco para garantir consistência total...");
        // Executar queries SQL diretas para evitar TypeORM Error em deletes sem critérios
        await appDataSource.query('DELETE FROM movimentacao');
        await appDataSource.query('DELETE FROM insumo');
        await appDataSource.query('DELETE FROM categoria');
        console.log("[\u2713] Tabelas de estoque limpas com sucesso.");

        const senhaHash = await hash("Senha@123", 10);

        // 1. Criar Usuários solicitados
        console.log("\n[+] Populando Usuários (Apenas os solicitados)...");
        const usuariosDados = [
            {
                nome: "Maria Leticia",
                email: "maria.leticia@estoquepim.com",
                senha_hash: senhaHash,
                perfil_acesso: PerfilAcesso.ALMOXARIFE,
                ativo: true,
                trocar_senha: false,
            },
            {
                nome: "Carlos Eduardo",
                email: "carlos.eduardo@estoquepim.com",
                senha_hash: senhaHash,
                perfil_acesso: PerfilAcesso.GESTOR,
                ativo: true,
                trocar_senha: false,
            },
            {
                nome: "Luciano Ferreira",
                email: "luciano.ferreira@estoquepim.com",
                senha_hash: senhaHash,
                perfil_acesso: PerfilAcesso.ALMOXARIFE,
                ativo: true,
                trocar_senha: false,
            },
            {
                nome: "Lucas Reis",
                email: "lucas.reis@estoquepim.com",
                senha_hash: senhaHash,
                perfil_acesso: PerfilAcesso.ALMOXARIFE,
                ativo: true,
                trocar_senha: false,
            },
        ];

        const usuariosSalvos: Usuario[] = [];
        for (const dados of usuariosDados) {
            let u = await usuarioRepo.findOne({ where: { email: dados.email } });
            if (!u) {
                u = usuarioRepo.create(dados);
                await usuarioRepo.save(u);
                console.log(`  - Usuário "${u.nome}" (${u.perfil_acesso}) criado com sucesso.`);
            } else {
                console.log(`  - Usuário "${u.nome}" já existe no banco.`);
            }
            usuariosSalvos.push(u);
        }

        const almoxarifes = usuariosSalvos.filter(u => u.perfil_acesso === PerfilAcesso.ALMOXARIFE);
        if (almoxarifes.length === 0) {
            throw new Error("Nenhum usuário com perfil Almoxarife encontrado para registrar movimentações.");
        }

        // 2. Criar 6 Categorias Condizentes com o PIM
        console.log("\n[+] Populando Categorias Eletroeletrônicas...");
        const categoriasDados = [
            { nome: "Componentes Eletroeletrônicos", descricao: "Capacitores, resistores, indutores e passivos SMD/PTH para montagem em superfície" },
            { nome: "Semicondutores e Circuitos Integrados", descricao: "Microcontroladores, memórias, conversores DC-DC, reguladores e drivers de potência" },
            { nome: "Placas de Circuito Impresso (PCB)", descricao: "Placas virgens multicamadas FR4, painéis de fibra de vidro e substratos de alumínio" },
            { nome: "Insumos Químicos e Soldagem", descricao: "Pastas de solda SAC305/chumbo, ligas metálicas, fluxos no-clean, solventes e resinas" },
            { nome: "Fixação Mecânica e Estrutural", descricao: "Parafusos de precisão micrométricos, espaçadores, dissipadores térmicos e blindagens EMI" },
            { nome: "Embalagens e Proteção ESD", descricao: "Bobinas SMD, bandejas JEDEC, sacos blindados antiestáticos e caixas master de expedição" }
        ];

        const categoriasSalvas = await categoriaRepo.save(categoriaRepo.create(categoriasDados));
        for (const c of categoriasSalvas) {
            console.log(`  - Categoria "${c.nome}" criada.`);
        }

        // Listas detalhadas de 15 insumos por categoria
        const insumosPorCategoria = [
            // Cat 0: Componentes Eletroeletrônicos
            [
                { nome: "Capacitor Cerâmico SMD 100nF 50V 0805", und: "un", min: 1000, max: 10000, loc: "Prateleira A1 - Gaveta 01" },
                { nome: "Capacitor Eletrolítico 1000uF 25V PTH", und: "un", min: 500, max: 5000, loc: "Prateleira A1 - Gaveta 02" },
                { nome: "Resistor SMD 10kΩ 1/8W 0805 1%", und: "un", min: 2000, max: 20000, loc: "Prateleira A2 - Bobina 05" },
                { nome: "Resistor SMD 4.7kΩ 1/10W 0603 5%", und: "un", min: 2000, max: 20000, loc: "Prateleira A2 - Bobina 06" },
                { nome: "Resistor de Potência 1Ω 5W Cerâmico", und: "un", min: 200, max: 2000, loc: "Prateleira A3 - Gaveta 10" },
                { nome: "Indutor de Potência SMD 10uH 2.5A", und: "un", min: 400, max: 4000, loc: "Prateleira A4 - Gaveta 01" },
                { nome: "Indutor Multicamada 100nH 0402", und: "un", min: 1500, max: 15000, loc: "Prateleira A4 - Bobina 02" },
                { nome: "Varistor de Óxido Metálico 14D471K", und: "un", min: 300, max: 3000, loc: "Prateleira A5 - Gaveta 03" },
                { nome: "Termistor NTC 10kΩ 1% 3435", und: "un", min: 300, max: 3000, loc: "Prateleira A5 - Gaveta 04" },
                { nome: "Diodo Retificador 1N4007 1A 1000V", und: "un", min: 1000, max: 10000, loc: "Prateleira B1 - Gaveta 01" },
                { nome: "Diodo Schottky SS34 3A 40V SMD", und: "un", min: 800, max: 8000, loc: "Prateleira B1 - Bobina 03" },
                { nome: "Diodo Zener BZX84C5V1 5.1V SOT-23", und: "un", min: 1000, max: 10000, loc: "Prateleira B2 - Bobina 01" },
                { nome: "Transistor NPN BC547B PTH", und: "un", min: 1000, max: 10000, loc: "Prateleira B3 - Gaveta 05" },
                { nome: "Transistor MOSFET AO3400 N-Ch SOT-23", und: "un", min: 800, max: 8000, loc: "Prateleira B3 - Bobina 08" },
                { nome: "Cristal Oscilador 16MHz HC-49S", und: "un", min: 500, max: 5000, loc: "Prateleira B4 - Gaveta 02" }
            ],
            // Cat 1: Semicondutores e Circuitos Integrados
            [
                { nome: "Microcontrolador ATmega328P-AU TQFP-32", und: "un", min: 200, max: 2000, loc: "Armário ESD 1 - Prateleira 1" },
                { nome: "Microcontrolador ESP32-WROOM-32E SMD", und: "un", min: 150, max: 1500, loc: "Armário ESD 1 - Prateleira 2" },
                { nome: "Memória Flash SPI 32MB W25Q256JVSIQ", und: "un", min: 300, max: 3000, loc: "Armário ESD 1 - Gaveta 05" },
                { nome: "Memória EEPROM 24C32 SMD SOIC-8", und: "un", min: 400, max: 4000, loc: "Armário ESD 1 - Gaveta 06" },
                { nome: "Regulador de Tensão LDO AMS1117-3.3", und: "un", min: 1000, max: 10000, loc: "Armário ESD 2 - Bobina 01" },
                { nome: "Regulador de Tensão LM7805 5V TO-220", und: "un", min: 500, max: 5000, loc: "Armário ESD 2 - Gaveta 02" },
                { nome: "Conversor DC-DC Buck MP2307DN SOIC-8E", und: "un", min: 400, max: 4000, loc: "Armário ESD 2 - Bobina 04" },
                { nome: "Circuito Integrado Temporizador NE555", und: "un", min: 1000, max: 10000, loc: "Armário ESD 3 - Gaveta 01" },
                { nome: "Amplificador Operacional LM358 SOIC-8", und: "un", min: 800, max: 8000, loc: "Armário ESD 3 - Bobina 02" },
                { nome: "Driver de Motor Ponte H L293D DIP-16", und: "un", min: 300, max: 3000, loc: "Armário ESD 3 - Gaveta 05" },
                { nome: "Interface Transceiver RS-485 MAX485ESA", und: "un", min: 500, max: 5000, loc: "Armário ESD 4 - Bobina 01" },
                { nome: "Controlador de Carga Li-Ion TP4056 SOP-8", und: "un", min: 600, max: 6000, loc: "Armário ESD 4 - Bobina 03" },
                { nome: "Conversor Analógico-Digital ADS1115", und: "un", min: 200, max: 2000, loc: "Armário ESD 4 - Gaveta 02" },
                { nome: "Expansor de I/O I2C PCF8574T SOIC-16", und: "un", min: 300, max: 3000, loc: "Armário ESD 5 - Bobina 01" },
                { nome: "Optoacoplador PC817 DIP-4", und: "un", min: 1200, max: 12000, loc: "Armário ESD 5 - Gaveta 04" }
            ],
            // Cat 2: Placas de Circuito Impresso (PCB)
            [
                { nome: "Placa PCB FR4 dupla face - Painel TV 55\"", und: "un", min: 50, max: 500, loc: "Estante PCB A - Nível 1" },
                { nome: "Placa PCB FR4 4 camadas - Mainboard Smartbox", und: "un", min: 80, max: 800, loc: "Estante PCB A - Nível 2" },
                { nome: "Placa PCB Alumínio - Barra LED Backlight", und: "un", min: 100, max: 1000, loc: "Estante PCB A - Nível 3" },
                { nome: "Placa PCB FR4 0.8mm - Módulo Wi-Fi/BT", und: "un", min: 200, max: 2000, loc: "Estante PCB B - Gaveta 01" },
                { nome: "Placa PCB Flexível (FPC) - Flat Display", und: "un", min: 300, max: 3000, loc: "Estante PCB B - Gaveta 02" },
                { nome: "Placa PCB FR4 simples - Fonte Alimentação", und: "un", min: 100, max: 1000, loc: "Estante PCB B - Nível 4" },
                { nome: "Placa PCB FR4 multicamada - Controle Remoto", und: "un", min: 150, max: 1500, loc: "Estante PCB C - Nível 1" },
                { nome: "Placa PCB FR4 - Painel Ar Condicionado", und: "un", min: 60, max: 600, loc: "Estante PCB C - Nível 2" },
                { nome: "Placa PCB de Potência 2.0mm - Inversor", und: "un", min: 40, max: 400, loc: "Estante PCB C - Nível 3" },
                { nome: "Placa PCB Cerâmica - Sensor de Gás", und: "un", min: 100, max: 1000, loc: "Estante PCB D - Gaveta 01" },
                { nome: "Placa PCB FR4 - Interface IHM Touch", und: "un", min: 50, max: 500, loc: "Estante PCB D - Nível 2" },
                { nome: "Placa PCB FR4 Alta Tg - Placa Mãe POS", und: "un", min: 40, max: 400, loc: "Estante PCB D - Nível 3" },
                { nome: "Placa PCB Halogen Free - Câmera Automotiva", und: "un", min: 120, max: 1200, loc: "Estante PCB E - Nível 1" },
                { nome: "Placa PCB Impedância Controlada - Roteador", und: "un", min: 80, max: 800, loc: "Estante PCB E - Nível 2" },
                { nome: "Placa PCB Dourada (ENIG) - Sensores Médicos", und: "un", min: 30, max: 300, loc: "Estante PCB E - Gaveta 05" }
            ],
            // Cat 3: Insumos Químicos e Soldagem
            [
                { nome: "Pasta de Solda SAC305 - Pote 500g", und: "pote", min: 10, max: 100, loc: "Câmara Fria 1 - Prateleira A" },
                { nome: "Pasta de Solda Sn63Pb37 - Pote 500g", und: "pote", min: 12, max: 120, loc: "Câmara Fria 1 - Prateleira B" },
                { nome: "Fio de Solda Estanho 0.8mm SAC305 500g", und: "rolo", min: 15, max: 150, loc: "Armário Químico - Prateleira 1" },
                { nome: "Fio de Solda Estanho 1.0mm Com Chumbo 500g", und: "rolo", min: 15, max: 150, loc: "Armário Químico - Prateleira 2" },
                { nome: "Fluxo de Solda No-Clean Líquido - Galão 5L", und: "galao", min: 5, max: 50, loc: "Sala de Inflamáveis - Setor A" },
                { nome: "Fluxo em Gel Retrabalho BGA - Seringa 10cc", und: "un", min: 20, max: 200, loc: "Armário Químico - Gaveta 01" },
                { nome: "Álcool Isopropílico Pureza 99.9% - 20L", und: "bombona", min: 4, max: 40, loc: "Sala de Inflamáveis - Setor B" },
                { nome: "Solvente Limpeza de Placas Reflow - 1L", und: "lata", min: 10, max: 100, loc: "Armário Químico - Prateleira 3" },
                { nome: "Adesivo Epóxi Vermelho SMD - Seringa 30cc", und: "un", min: 15, max: 150, loc: "Câmara Fria 2" },
                { nome: "Resina Conformal Coating Acrílica - Spray", und: "un", min: 12, max: 120, loc: "Armário Químico - Prateleira 4" },
                { nome: "Resina Epóxi Bicomponente Isolação - 1kg", und: "kit", min: 8, max: 80, loc: "Armário Químico - Prateleira 5" },
                { nome: "Pasta Térmica Silicone com Prata - 100g", und: "pote", min: 15, max: 150, loc: "Armário Químico - Gaveta 03" },
                { nome: "Fita Kapton Poliimida Alta Temp 12mm", und: "rolo", min: 30, max: 300, loc: "Estante de Consumíveis - A1" },
                { nome: "Malha Desoldadora de Cobre 2.5mm", und: "rolo", min: 40, max: 400, loc: "Estante de Consumíveis - A2" },
                { nome: "Verniz Isolante Elétrico Incolor - 900ml", und: "lata", min: 6, max: 60, loc: "Sala de Inflamáveis - Setor C" }
            ],
            // Cat 4: Fixação Mecânica e Estrutural
            [
                { nome: "Parafuso M2 x 4mm Panela Philips Niquelado", und: "un", min: 5000, max: 50000, loc: "Corredor Fixação - Gaveta M2-1" },
                { nome: "Parafuso M3 x 6mm Chata Torx Preto", und: "un", min: 5000, max: 50000, loc: "Corredor Fixação - Gaveta M3-2" },
                { nome: "Parafuso Auto-Atarraxante 2.2 x 5mm Plástico", und: "un", min: 4000, max: 40000, loc: "Corredor Fixação - Gaveta AA-1" },
                { nome: "Espaçador Sextavado Latão M3x10 Fêmea-Fêmea", und: "un", min: 1000, max: 10000, loc: "Corredor Fixação - Gaveta ESP-1" },
                { nome: "Espaçador de Nylon M2.5 x 8mm Macho-Fêmea", und: "un", min: 1000, max: 10000, loc: "Corredor Fixação - Gaveta ESP-3" },
                { nome: "Arruela Lisa de Pressão M3 Aço Inox", und: "un", min: 5000, max: 50000, loc: "Corredor Fixação - Gaveta ARR-2" },
                { nome: "Porca Sextavada M2 Aço Zincado", und: "un", min: 5000, max: 50000, loc: "Corredor Fixação - Gaveta POR-1" },
                { nome: "Dissipador de Calor Alumínio TO-220", und: "un", min: 500, max: 5000, loc: "Estante Mecânica A - Prateleira 1" },
                { nome: "Dissipador Térmico Extrudado Chipset BGA", und: "un", min: 200, max: 2000, loc: "Estante Mecânica A - Prateleira 2" },
                { nome: "Blindagem Metálica (Shielding EMI) Módulo RF", und: "un", min: 600, max: 6000, loc: "Estante Mecânica B - Caixa 05" },
                { nome: "Grampo de Fixação de Transistor Dissipador", und: "un", min: 1000, max: 10000, loc: "Estante Mecânica B - Gaveta 01" },
                { nome: "Passa-Fio de Borracha Nitrílica 8mm", und: "un", min: 800, max: 8000, loc: "Estante Mecânica C - Gaveta 04" },
                { nome: "Suporte Plástico Fixação LED 5mm", und: "un", min: 1500, max: 15000, loc: "Estante Mecânica C - Gaveta 05" },
                { nome: "Mola de Contato de Bateria Aço Niquelado", und: "un", min: 1200, max: 12000, loc: "Estante Mecânica D - Caixa 02" },
                { nome: "Presilha de Fixação de Cabo Flat (FPC Clamp)", und: "un", min: 1000, max: 10000, loc: "Estante Mecânica D - Gaveta 08" }
            ],
            // Cat 5: Embalagens e Proteção ESD
            [
                { nome: "Saco Antiestático Blindado Metal-In 10x15cm", und: "un", min: 1000, max: 10000, loc: "Almoxarifado ESD - Estante 1" },
                { nome: "Saco Antiestático Dissipativo Rosa 20x30cm", und: "un", min: 1000, max: 10000, loc: "Almoxarifado ESD - Estante 2" },
                { nome: "Plástico Bolha ESD Rosa - Bobina 1.20x100m", und: "rolo", min: 5, max: 50, loc: "Área de Blocos e Bobinas - Fila A" },
                { nome: "Bandeja de Transporte JEDEC CIs QFP/BGA", und: "un", min: 50, max: 500, loc: "Almoxarifado ESD - Estante 3" },
                { nome: "Bobina Fita Transportadora 8mm SMD", und: "un", min: 40, max: 400, loc: "Almoxarifado ESD - Estante 4" },
                { nome: "Fita de Cobertura Cover Tape ESD 5.4mm", und: "un", min: 40, max: 400, loc: "Almoxarifado ESD - Estante 4" },
                { nome: "Carretel Plástico Vazio 7\" Componentes SMD", und: "un", min: 100, max: 1000, loc: "Almoxarifado ESD - Estante 5" },
                { nome: "Caixa Master Papelão Ondulado Kraft TV 55\"", und: "un", min: 200, max: 2000, loc: "Pátio de Expedição - Setor Embalagem" },
                { nome: "Berço Calço EPS Isopor Moldado TV 55\"", und: "par", min: 200, max: 2000, loc: "Pátio de Expedição - Setor Isopor" },
                { nome: "Fita Adesiva Empacotamento Frágil 48mmx50m", und: "rolo", min: 30, max: 300, loc: "Armário de Expedição - Gaveta A" },
                { nome: "Etiqueta Adesiva Identificação ESD Warning", und: "rolo", min: 10, max: 100, loc: "Armário de Expedição - Gaveta B" },
                { nome: "Sílica Gel Dessecante Sachê 10g", und: "un", min: 2000, max: 20000, loc: "Armário de Expedição - Caixa 01" },
                { nome: "Indicador de Umidade Cartão HIC 3 Pontos", und: "un", min: 500, max: 5000, loc: "Almoxarifado ESD - Gaveta Central" },
                { nome: "Espuma Condutiva Preta Alta Densidade 5mm", und: "un", min: 30, max: 300, loc: "Almoxarifado ESD - Estante 6" },
                { nome: "Caixa Plástica Condutiva ESD com Divisórias", und: "un", min: 40, max: 400, loc: "Almoxarifado ESD - Estante 7" }
            ]
        ];

        // Função interna para desenhar a curva de 20 saldos
        function gerarSaldosHistorico(min: number, max: number, final: number): number[] {
            const saldos: number[] = [];
            const proporcoes = [
                1.00, 0.90, 0.80, 0.70, 0.85, 0.75, 0.65, 0.55, 0.70, 
                0.60, 0.50, 0.42, 0.60, 0.50, 0.40, 0.32, 0.48, 0.38
            ];

            for (let i = 0; i < 18; i++) {
                saldos.push(Math.max(1, Math.floor(max * proporcoes[i])));
            }

            let p18 = Math.floor((saldos[17] + final) / 2);
            if (p18 === saldos[17]) {
                p18 = saldos[17] + (final >= saldos[17] ? 1 : -1);
            }
            saldos.push(Math.max(final > 0 ? 1 : 0, p18));
            saldos.push(final);

            // Ajuste fino para evitar saldos idênticos consecutivos (garantindo qtd > 0)
            for (let i = 1; i < 19; i++) {
                if (saldos[i] === saldos[i-1]) {
                    if (saldos[i] < max) saldos[i] += 1;
                    else if (saldos[i] > 1) saldos[i] -= 1;
                    else saldos[i] = 2;
                }
            }

            saldos[19] = final;
            if (saldos[19] === saldos[18]) {
                if (saldos[18] > 0) {
                    if (saldos[18] < max) saldos[18] += 1;
                    else saldos[18] -= 1;
                } else {
                    saldos[18] = 1;
                }
            }

            if (saldos[18] === saldos[17]) {
                if (saldos[17] > 1) saldos[17] -= 1;
                else saldos[17] += 1;
            }

            return saldos;
        }

        console.log("\n[+] Criando 90 Insumos e preparando 1.800 Movimentações...");
        const insumosParaSalvar: Insumo[] = [];
        const configuracoesMovimentacao: { insumoRefIndex: number; saldos: number[] }[] = [];

        let insumoGlobalIndex = 0;

        for (let catIdx = 0; catIdx < categoriasSalvas.length; catIdx++) {
            const cat = categoriasSalvas[catIdx];
            const itens = insumosPorCategoria[catIdx];

            for (const item of itens) {
                const numString = (50 + insumoGlobalIndex).toString().padStart(4, '0');
                const codigo = `INS-${numString}`;

                // Distribuir de forma perfeitamente equilibrada os 5 status alvo
                const tipoAlvo = insumoGlobalIndex % 5;
                let estoqueFinal = 0;

                if (tipoAlvo === 0) {
                    // Crítico não zerado
                    estoqueFinal = Math.floor(item.min * 0.6);
                    if (estoqueFinal === 0) estoqueFinal = 1;
                } else if (tipoAlvo === 1) {
                    // Zerado
                    estoqueFinal = 0;
                } else if (tipoAlvo === 2) {
                    // Atenção
                    estoqueFinal = Math.floor(item.min * 1.05);
                    if (estoqueFinal <= item.min) estoqueFinal = item.min + 1;
                } else if (tipoAlvo === 3) {
                    // Estável
                    estoqueFinal = Math.floor((item.min + item.max) / 2);
                } else if (tipoAlvo === 4) {
                    // Nível Máximo / Limite Próximo
                    estoqueFinal = Math.floor(item.max * 0.98);
                }

                // Criamos a entidade de Insumo com seus saldos finais
                const insumoEntidade = insumoRepo.create({
                    codigo,
                    nome: item.nome,
                    descricao: `Insumo essencial para montagem eletroeletrônica no PIM. Qualidade assegurada.`,
                    unidade_medida: item.und,
                    estoque_minimo: item.min,
                    estoque_maximo: item.max,
                    estoque_atual: estoqueFinal,
                    localizacao: item.loc,
                    categoria_id: cat.id,
                    ativo: true,
                    status_estoque: 'estavel' // será recalculado na linha abaixo
                });

                insumoEntidade.status_estoque = calcularStatus(insumoEntidade);
                insumosParaSalvar.push(insumoEntidade);

                // Preparamos a curva de 20 saldos para este insumo
                const saldosCurva = gerarSaldosHistorico(item.min, item.max, estoqueFinal);
                configuracoesMovimentacao.push({
                    insumoRefIndex: insumoGlobalIndex,
                    saldos: saldosCurva
                });

                insumoGlobalIndex++;
            }
        }

        // Salvamos todos os 90 insumos de uma vez de forma super otimizada
        const insumosSalvos = await insumoRepo.save(insumosParaSalvar);
        console.log(`[\u2713] ${insumosSalvos.length} Insumos inseridos com sucesso nos status calculados.`);

        // Agora geramos as 1.800 instâncias de Movimentacao
        const todasMovimentacoes: Movimentacao[] = [];
        const linhasProducao = ["Linha SMT 01", "Linha SMT 02", "Linha PTH", "Linha de Montagem Final", "Setor de Testes e CQ"];

        for (const config of configuracoesMovimentacao) {
            const insumo = insumosSalvos[config.insumoRefIndex];
            const saldos = config.saldos;

            // Datas distribuídas entre 5 de Janeiro e início de Maio de 2026
            const startDay = 3 + (config.insumoRefIndex % 5);
            const baseDate = new Date(2026, 0, startDay, 8, 0, 0);

            for (let i = 0; i < 20; i++) {
                const prevSaldo = i > 0 ? saldos[i-1] : 0;
                const currSaldo = saldos[i];
                const qtd = Math.abs(currSaldo - prevSaldo);
                const tipo = currSaldo > prevSaldo ? TipoMovimentacao.ENTRADA : TipoMovimentacao.SAIDA;

                let motivo: MotivoMovimentacao;
                let linha_destino: string | undefined = undefined;
                let observacao: string | undefined = undefined;

                if (i === 0) {
                    motivo = MotivoMovimentacao.COMPRA;
                    observacao = "Abastecimento inicial programado para o PIM";
                } else if (tipo === TipoMovimentacao.ENTRADA) {
                    if (i % 8 === 0) {
                        motivo = MotivoMovimentacao.DEVOLUCAO;
                        observacao = "Devolução de lote excedente da linha de produção";
                    } else {
                        motivo = MotivoMovimentacao.COMPRA;
                        observacao = "Aquisição de reposição para suprimento da fábrica";
                    }
                } else {
                    // Saídas
                    if (i % 9 === 0) {
                        motivo = MotivoMovimentacao.AJUSTE;
                        observacao = "Ajuste de inventário rotativo conforme auditoria de estoque";
                    } else if (i % 14 === 0) {
                        motivo = MotivoMovimentacao.PERDA;
                        observacao = "Material danificado acidentalmente no setup de máquina";
                    } else {
                        motivo = MotivoMovimentacao.CONSUMO;
                        linha_destino = linhasProducao[(config.insumoRefIndex + i) % linhasProducao.length];
                        observacao = `Abastecimento de insumos para a ${linha_destino}`;
                    }
                }

                // Determinar o almoxarife que registrou de forma alternada
                const almoxarife = almoxarifes[(config.insumoRefIndex + i) % almoxarifes.length];

                // Calcular timestamp preciso com avanço de 6 dias por passo
                const timestamp = new Date(baseDate.getTime());
                timestamp.setDate(timestamp.getDate() + (i * 6));
                timestamp.setHours(8 + (i % 9), (config.insumoRefIndex * 7 + i * 13) % 60, (i * 19) % 60);

                const mov = movimentacaoRepo.create({
                    insumo_id: insumo.id,
                    tipo,
                    motivo,
                    quantidade: qtd,
                    saldo_apos: currSaldo,
                    linha_destino,
                    observacao,
                    registrado_por: almoxarife.nome,
                    timestamp
                });

                todasMovimentacoes.push(mov);
            }
        }

        console.log(`\n[+] Salvando ${todasMovimentacoes.length} históricos de movimentação em lotes...`);
        // Salvar em chunks para máxima performance e respeitar limites do banco
        const chunkSize = 400;
        for (let i = 0; i < todasMovimentacoes.length; i += chunkSize) {
            await movimentacaoRepo.save(todasMovimentacoes.slice(i, i + chunkSize));
        }

        console.log("[\u2713] Todas as movimentações salvas com sucesso.");
        console.log("\n[\u2713] Seed concluído com estrondoso sucesso! O sistema está pronto com dados premium.");

        await appDataSource.destroy();
        process.exit(0);
    } catch (err) {
        console.error("\n[X] Erro crítico no seed:", err);
        process.exit(1);
    }
}

seed();