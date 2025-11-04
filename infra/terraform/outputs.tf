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
  description = "Endpoint público (S3 static site)"
  value       = module.frontend.website_endpoint
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS/Fargate"
  value       = module.ecs.cluster_name
}
