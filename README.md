# EstoquePIM - API de Gestão de Estoque

[![Node.js Version](https://img.shields.io/badge/node-24.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/express-5.x-lightgrey.svg)](https://expressjs.com/)
[![TypeORM](https://img.shields.io/badge/typeorm-0.3.x-red.svg)](https://typeorm.io/)

API robusta desenvolvida para o controle e gestão de estoque de insumos de produção industrial, focada nas necessidades específicas das fábricas do **Polo Industrial de Manaus (PIM)**.

## Sobre o Projeto

O **EstoquePIM** resolve o problema crítico da interrupção de linhas de produção por falta de insumos. O sistema substitui controles manuais e planilhas por uma solução automatizada que oferece visibilidade em tempo real, rastreabilidade completa e alertas proativos de reposição.

Este projeto faz parte do módulo Full Stack do programa de capacitação do **INDT**.

## Tecnologias Utilizadas

- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework Web:** Express 5
- **ORM:** TypeORM
- **Banco de Dados:** PostgreSQL
- **Validação:** Zod
- **Segurança:** 
  - JWT (JSON Web Tokens) para autenticação
  - Bcrypt para hashing de senhas
  - Helmet e CORS para proteção de headers e acessos
  - Express Rate Limit para prevenção de ataques brute-force

## 👥 Personas

O sistema foi desenhado para atender dois perfis principais do Polo Industrial:

*   **Almoxarife:** O usuário operacional que realiza o recebimento e a baixa de materiais. Precisa de agilidade no registro e precisão nos saldos para evitar paradas na linha.
*   **Gestor de Produção:** O usuário estratégico que monitora a saúde do estoque. Utiliza o dashboard para antecipar compras e analisa o histórico para planejamento de demanda.

## ✅ Requisitos Atendidos

O projeto cumpre integralmente os requisitos definidos no PRD para a versão MVP:

### Requisitos Funcionais (RF)

| ID | Requisito | Prioridade | Status |
|:---:|:---|:---:|:---:|
| RF01 | Autenticar usuários por e-mail e senha, gerando token JWT. | Alta | ✅ Atendido |
| RF02 | Middleware de segurança para proteger rotas da API. | Alta | ✅ Atendido |
| RF03 | Registrar movimentações com tipo, motivo, quantidade e timestamp. | Alta | ✅ Atendido |
| RF04 | Atualização de estoque_atual em transação SQL atômica. | Alta | ✅ Atendido |
| RF05 | Bloquear saídas (erro 422) se quantidade > estoque_atual. | Alta | ✅ Atendido |
| RF06 | Cálculo de saldo previsto no backend para validação. | Alta | ✅ Atendido |
| RF07 | CRUD completo de insumos e categorias no banco de dados. | Alta | ✅ Atendido |
| RF08 | Endpoint de dashboard com indicadores e alertas de estoque. | Alta | ✅ Atendido |
| RF09 | Ordenação da lista de críticos por percentual de reposição. | Média | ✅ Atendido |
| RF10 | Filtros de histórico por período, insumo, tipo e motivo. | Média | ✅ Atendido |
| RF11 | Validação para impedir movimentação de insumos inativos. | Média | ✅ Atendido |
| RF12 | Validação de observação obrigatória para motivos de ajuste/perda. | Média | ✅ Atendido |
| RF13 | Cálculo de consumo médio mensal (trio). | Baixa | ⏳ Pendente |
| RF14 | Fluxo de solicitação e aprovação de reposição (trio). | Baixa | ⏳ Pendente |

### Requisitos Não Funcionais (RNF)

| ID | Requisito | Prioridade | Status |
|:---:|:---|:---:|:---:|
| RNF01 | Garantia de atomicidade (transação SQL) em movimentações. | Alta | ✅ Atendido |
| RNF02 | Hashing de senhas com Bcrypt (segurança de dados). | Alta | ✅ Atendido |
| RNF03 | Exigência de token JWT válido em todas as rotas privadas. | Alta | ✅ Atendido |
| RNF04 | Integridade: saldo atualizado apenas via movimentação. | Alta | ✅ Atendido |
| RNF06 | Código documentado no GitHub com instruções de execução. | Média | ✅ Atendido |
| RNF07 | Armazenamento de segredos em variáveis de ambiente (.env). | Alta | ✅ Atendido |
| RNF08 | Tratamento padronizado de erros (401, 422, 500). | Média | ✅ Atendido |

## Funcionalidades Principais

- **Autenticação Segura:** Login com JWT e controle de sessão.
- **Gestão de Insumos:** CRUD completo de itens com controle de estoque mínimo e máximo.
- **Movimentações Atômicas:** Registro de entradas e saídas garantindo a integridade dos dados através de transações SQL (o saldo só é atualizado se a movimentação for registrada com sucesso).
- **Rastreabilidade:** Histórico detalhado de quem movimentou cada item, quando e por qual motivo (compra, consumo, perda, ajuste).
- **Dashboard de Alertas:** Endpoints otimizados para exibir indicadores de insumos críticos e zerados.
- **Validação de Estoque:** Bloqueio automático de saídas que excedam o saldo disponível.

## Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (recomendado v20+)
- [Docker](https://www.docker.com/) e Docker Compose
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

### Passo a Passo

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/EmilyRodrigues17/gestao-estoque-pim-api.git
    cd gestao-estoque-pim-api
    ```

2.  **Instalar dependências:**
    ```bash
    npm install
    ```

3.  **Configurar variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto baseado no exemplo abaixo:
    ```env
    PORT=6060
    DB_HOST=localhost
    DB_PORT=5434
    DB_USER=postgres
    DB_PASS=sua_senha
    DB_NAME=gestao_estoque_db
    JWT_ACCESS_SECRET=sua_chave_secreta
    ```

4.  **Subir o Banco de Dados (Docker):**
    ```bash
    docker-compose up -d
    ```

5.  **Iniciar a API:**
    ```bash
    npm run dev
    ```
    A API estará disponível em `http://localhost:6060`.

## Principais Endpoints

- `POST /auth/login`: Autenticação de usuário.
- `GET /insumos`: Listagem de todos os insumos (com filtros).
- `POST /movimentacoes`: Registro de nova entrada ou saída.
- `GET /dashboard`: Indicadores e alertas de estoque.
- `GET /categorias`: Gestão de categorias de insumos.

## 🛡️ Segurança

- Todas as rotas (exceto login) exigem um Bearer Token válido.
- As senhas nunca são armazenadas em texto plano.
- Implementação de transações SQL para evitar inconsistência de saldo.

---
Desenvolvido como projeto final para o curso de **Dev Full Stack - INDT**.

