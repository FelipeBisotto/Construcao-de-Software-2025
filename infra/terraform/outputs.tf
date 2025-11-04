output "vpc_id" {
  description = "ID of the provisioned VPC"
  value       = module.network.vpc_id
}

output "alb_dns" {
  description = "Public URL of the API load balancer"
  value       = module.ecs.alb_dns_name
}

output "db_endpoint" {
  description = "Postgres database endpoint"
  value       = module.database.db_endpoint
}

output "frontend_bucket" {
  description = "S3 bucket for hosting the frontend"
  value       = module.frontend.bucket_name
}

output "frontend_website_url" {
  description = "Public endpoint (S3 static site)"
  value       = module.frontend.website_endpoint
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS/Fargate"
  value       = module.ecs.cluster_name
}

output "cognito_user_pool_id" {
  description = "ID do User Pool Cognito"
  value       = module.cognito.user_pool_id
}

output "cognito_app_client_id" {
  description = "App Client (audience) usado pela API"
  value       = module.cognito.app_client_id
}

output "jwt_issuer" {
  description = "Issuer utilizado na validação do JWT"
  value       = module.cognito.issuer
}

output "jwks_uri" {
  description = "URL da JWKS pública"
  value       = module.cognito.jwks_uri
}

output "cognito_authorization_endpoint" {
  description = "Endpoint Authorization Code (Hosted UI)"
  value       = module.cognito.authorization_endpoint
}

output "cognito_token_endpoint" {
  description = "Endpoint de token do Cognito"
  value       = module.cognito.token_endpoint
}
