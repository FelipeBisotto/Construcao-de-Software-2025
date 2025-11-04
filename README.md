# Construção de Software 2025 — Monorepo (MVC)

Este repositório contém um monorepo com backend (API REST em Node/Express + TypeScript + Prisma/Postgres), frontend (React + Vite + TypeScript), Docker Compose, CI inicial e esqueleto de IaC (Terraform).

- Padrão arquitetural: MVC (ver `docs/DESIGN_PATTERN_MVC.md`)
- Banco: Postgres 17 (Docker)
- Linguagens: TypeScript (backend e frontend)
- Front e Back no mesmo repositório

## Requisitos por Release

- Release 1.0: stack, estrutura inicial, Compose com Postgres, CRUD de User com testes, README e CI simples.
- Release 2.0: `infra/terraform/` com VPC, ECS Fargate + ALB, RDS Postgres e bucket S3 versionados via Terraform; pipeline roda fmt/init/validate.
- Release 3.0: Auth via IdP (Cognito/Auth0), validação de JWT via JWKS e RBAC; OpenAPI e testes.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Opção A: Rodar com Docker (recomendado)
docker compose up --build

# 2. Opção B: Rodar localmente
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

## 📋 Como rodar o projeto

### Pré-requisitos

- **Node.js 20+** e **npm 10+**
- **Docker** e **Docker Compose** (para rodar com containers)
- **PostgreSQL** (se rodar localmente sem Docker)

### 📦 Instalação inicial

```bash
# Clone o repositório
git clone <url-do-repo>
cd T3

# Instale as dependências do monorepo
npm install
```

### 🐳 Opção 1: Rodar com Docker Compose (Recomendado)

```bash
# 1. Configure as variáveis de ambiente (opcional, já tem defaults)
cp .env.example .env

# 2. Suba todos os serviços (Postgres + Backend + Frontend)
docker compose up --build

# Para rodar em background
docker compose up -d --build

# Para parar os serviços
docker compose down
```

**Endpoints disponíveis:**
- 🔧 API Backend: `http://localhost:3000`
  - Health check: `http://localhost:3000/health`
  - Users API: `http://localhost:3000/api/users`
  - Swagger: `http://localhost:3000/docs`
- 🎨 Frontend: `http://localhost:5173`
- 🗄️ PostgreSQL: `localhost:5432`

### 💻 Opção 2: Rodar localmente (sem Docker)

#### Backend

```bash
# 1. Configure o banco de dados
cp .env.example .env
# Edite o .env e configure DATABASE_URL para seu Postgres local

# 2. Gere os tipos do Prisma e aplique o schema
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run prisma:push

# 3. Inicie o servidor de desenvolvimento
npm run dev:backend
```

O backend estará disponível em `http://localhost:3000`

#### Frontend

```bash
# Em outro terminal, inicie o frontend
npm run dev:frontend
```

O frontend estará disponível em `http://localhost:5173`

### 📝 Scripts disponíveis

**No diretório raiz (atalhos):**
```bash
npm run dev              # Inicia backend em modo dev (atalho)
npm run dev:backend      # Inicia backend em modo dev
npm run dev:frontend     # Inicia frontend em modo dev
npm run build            # Build de todos os workspaces
npm run build:backend    # Build apenas do backend
npm run build:frontend   # Build apenas do frontend
npm run start:backend    # Inicia backend em produção (após build)
npm run test             # Executa testes de todos os workspaces
npm run test:backend     # Executa apenas testes do backend
npm run lint             # Lint de todos os workspaces
npm run format           # Formata código de todos os workspaces
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:push      # Aplica schema Prisma no banco
```

**Backend específico:**
```bash
npm --workspace apps/backend run dev              # Dev mode
npm --workspace apps/backend run build            # Build para produção
npm --workspace apps/backend run start            # Inicia build de produção
npm --workspace apps/backend run test             # Roda testes
npm --workspace apps/backend run prisma:generate  # Gera cliente Prisma
npm --workspace apps/backend run prisma:push      # Aplica schema no DB
```

**Frontend específico:**
```bash
npm --workspace apps/frontend run dev      # Dev mode com Vite
npm --workspace apps/frontend run build    # Build para produção
npm --workspace apps/frontend run preview  # Preview do build
npm --workspace apps/frontend run test     # Roda testes
```

## Testes e CI

- Testes backend (Jest + Supertest):
  ```bash
  npm --workspace apps/backend test
  ```
- CI: `.github/workflows/ci.yml` faz build, lint, sobe Postgres em serviço, aplica schema Prisma e executa testes do backend; frontend faz build.

## Auth (planejado para Release 3.0)

- Middleware de JWT + JWKS (biblioteca `jose`) preparado e desligável em dev.
- Variáveis: `JWT_ISSUER`, `JWT_AUDIENCE`, `JWKS_URI`.
- RBAC por roles em claims do token.

## Documentação

- MVC: `docs/DESIGN_PATTERN_MVC.md`
- Infra (Terraform): `infra/terraform/` — descreve arquitetura AWS, variáveis e passos `init/plan/apply`.

---

Consulte `Construcao-de-Software-2025/all.md` para requisitos detalhados de cada release.
