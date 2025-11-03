# Construção de Software 2025 — Monorepo (MVC)

Este repositório contém um monorepo com backend (API REST em Node/Express + TypeScript + Prisma/Postgres), frontend (React + Vite + TypeScript), Docker Compose, CI inicial e esqueleto de IaC (Terraform).

- Padrão arquitetural: MVC (ver `docs/DESIGN_PATTERN_MVC.md`)
- Banco: Postgres 17 (Docker)
- Linguagens: TypeScript (backend e frontend)
- Front e Back no mesmo repositório

## Requisitos por Release

- Release 1.0: stack, estrutura inicial, Compose com Postgres, CRUD de User com testes, README e CI simples.
- Release 2.0: `infra/terraform/` com esqueleto de IaC e CI validando formato/validate.
- Release 3.0: Auth via IdP (Cognito/Auth0), validação de JWT via JWKS e RBAC; OpenAPI e testes.

## Como rodar (Docker Compose)

1. Copie `.env.example` para `.env` e ajuste se necessário.
2. Instale as dependências e gere os lockfiles necessários:
   ```bash
   npm install
   npm --workspace apps/backend install
   npm --workspace apps/frontend install
   ```
3. Suba os serviços:
   ```bash
   docker compose up --build
   ```
3. Endpoints úteis:
   - API: `http://localhost:3000/health`, `http://localhost:3000/api/users`
   - Web (Vite dev): `http://localhost:5173`

A API faz `prisma generate` e `prisma db push` automaticamente para subir o schema.

## Como rodar localmente (sem Docker)

- Requisitos: Node 20+, npm 10+
- Instalar dependências do monorepo:
  ```bash
  npm install
  ```
- Backend:
  ```bash
  cp .env.example .env  # edite DATABASE_URL
  npm --workspace apps/backend run prisma:generate
  npm --workspace apps/backend run prisma:push
  npm run dev:backend
  ```
- Frontend:
  ```bash
  npm run dev:frontend
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
- Infra (Terraform): `infra/terraform/`

---

Consulte `Construcao-de-Software-2025/all.md` para requisitos detalhados de cada release.
