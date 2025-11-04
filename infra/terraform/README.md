# Infraestrutura como Código (Terraform)

Release 2 introduz o provisionamento completo do ambiente AWS necessário para executar o backend e hospedar o frontend.

## Arquitetura planejada

| Componente | Descrição |
|------------|-----------|
| **VPC (10.0.0.0/16)** | Dois subnets públicos + dois privados com NAT por AZ, roteamento e tags padrão. |
| **ECS Fargate + ALB** | Um cluster ECS roda a API Node em tasks Fargate. O ALB público (porta 80) encaminha tráfego para o serviço privado. Logs vão para CloudWatch. |
| **PostgreSQL RDS** | Instância Postgres 17 em subnets privadas, acessível apenas pelo serviço ECS. |
| **S3 Static Website** | Bucket versionado para publicar o build do frontend (React). Endereço estático `http://<bucket>.s3-website-<region>.amazonaws.com`. |

> **Observação**: variáveis como `backend_image`, `db_password` e secrets JWT devem ser injetadas via `terraform.tfvars` ou variáveis de ambiente antes do `apply`.

## Estrutura

```
infra/terraform
├── main.tf                # Orquestra módulos
├── variables.tf           # Variáveis globais
├── outputs.tf             # Endpoints importantes
├── terraform.tfvars.example
└── modules
    ├── database/          # RDS + SG
    ├── ecs/               # ALB + ECS + IAM
    ├── frontend/          # Bucket S3 estático
    └── network/           # VPC/Subnets/NAT
```

## Pré-requisitos

- Terraform >= 1.5
- AWS CLI configurado com credenciais que possuam permissões para:
  - VPC, EC2, IAM, ECS, RDS, CloudWatch, S3.
- (Opcional) Repositório no ECR contendo a imagem `backend_image`.

## Como usar

1. Copie o arquivo de exemplo de variáveis e ajuste valores (nunca versione o arquivo final).
   ```bash
   cd infra/terraform
   cp terraform.tfvars.example terraform.tfvars
   # edite backend_image, db creds, JWT vars etc.
   ```
2. Inicialize e valide:
   ```bash
   terraform init
   terraform fmt
   terraform validate
   ```
3. Opcional: visualize o plano
   ```bash
   terraform plan
   ```
4. Aplique:
   ```bash
   terraform apply
   ```

## Outputs relevantes

- `alb_dns` – URL pública para a API.
- `db_endpoint` – host do Postgres (porta 5432).
- `frontend_website_url` – endpoint do bucket estático.
- `ecs_cluster_name` – usado para observabilidade / deploys.

## Boas práticas

- Configure um backend remoto (S3 + DynamoDB) antes do primeiro `apply` para evitar perdas de state.
- Use workspaces (`terraform workspace select dev`) para manter ambientes isolados (dev/stage/prod).
- Credenciais sensíveis (`db_password`, `JWT_*`) devem vir de pipeline seguro/GitHub Actions Secrets.
