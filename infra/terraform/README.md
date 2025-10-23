# Infra as Code (Terraform) — Esqueleto

Este diretório contém o esqueleto de IaC para AWS, a ser evoluído na Release 2.0/3.0.

Passos locais típicos:

```bash
cd infra/terraform
terraform init -backend=false
terraform validate
```

Variáveis esperadas: veja `variables.tf`.

