# Design Pattern: MVC no Projeto

Este projeto adota o padrão MVC (Model–View–Controller) com extensões comuns (Service, Repository e Middlewares) para manter as responsabilidades bem separadas e facilitar testes e evolução.

## Mapeamento no Monorepo

- Model
  - Backend: modelos de dados e schema no Prisma (`apps/backend/prisma/schema.prisma`), além de DTOs/validações com Zod.
  - Responsabilidade: representar o domínio e garantir integridade dos dados.

- View
  - Frontend: SPA em React + TypeScript (`apps/frontend/`).
  - Responsabilidade: renderizar a UI, gerenciar estado de tela e integrar com a API.

- Controller
  - Backend: rotas Express chamando controllers (`apps/backend/src/modules/**/`).
  - Responsabilidade: receber a requisição, validar entrada, orquestrar serviços e devolver respostas.

## Extensões de Camada

- Service: implementa regras de negócio, mantém controllers finos e reutilizáveis.
- Repository: isola o acesso a dados (Prisma), permitindo testes e futuras trocas de tecnologia.
- Middleware: cross-cutting concerns (auth/JWT, validações, erros, CORS, logging).
- Schemas (Zod): validação de input/out e contratos estáveis entre camadas.

## Fluxo típico

View (React) → Controller (Express) → Service → Repository (Prisma) → Postgres

Retorno: Repository → Service → Controller → View

## Convenções de Pastas e Nomes

- Por domínio (ex.: `user`): `apps/backend/src/modules/user/`
  - `user.controller.ts`, `user.service.ts`, `user.repository.ts`, `user.routes.ts`, `user.schema.ts`.
- Middlewares: `apps/backend/src/middlewares/`
- Configuração e bootstrap: `apps/backend/src/server.ts`, `apps/backend/src/config/`.

## Autenticação e Autorização (T3)

- Autenticação via JWT validado por JWKS (IdP Cognito/Auth0) com a lib `jose`.
- RBAC: checagem de roles/permissions nas rotas.
- Variáveis: `JWT_ISSUER`, `JWT_AUDIENCE`, `JWKS_URI` e CORS configurável.

## Benefícios

- Separação de responsabilidades e baixa acoplamento.
- Testabilidade: cada camada testável isoladamente.
- Evolutividade: troca de UI, DB ou regras sem impacto desnecessário.

