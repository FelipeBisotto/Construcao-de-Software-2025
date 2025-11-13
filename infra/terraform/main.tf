terraform {
  backend "s3" {
    bucket         = "cs2025-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "cs2025-terraform-lock"
  }

  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source               = "./modules/network"
  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "database" {
  source              = "./modules/database"
  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.network.vpc_id
  private_subnet_ids  = module.network.private_subnet_ids
  allowed_cidr_blocks = module.network.private_subnet_cidrs
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
}

module "cognito" {
  source                      = "./modules/cognito"
  project_name                = var.project_name
  environment                 = var.environment
  callback_urls               = var.cognito_callback_urls
  logout_urls                 = var.cognito_logout_urls
  admin_user_email            = var.cognito_admin_email
  admin_user_temp_password    = var.cognito_admin_temp_password
  standard_user_email         = var.cognito_user_email
  standard_user_temp_password = var.cognito_user_temp_password
}

locals {
  database_url = "postgresql://${var.db_username}:${var.db_password}@${module.database.db_endpoint}:5432/${var.db_name}?schema=public"
}

module "ecs" {
  source              = "./modules/ecs"
  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.network.vpc_id
  public_subnet_ids   = module.network.public_subnet_ids
  private_subnet_ids  = module.network.private_subnet_ids
  backend_image       = var.backend_image
  container_port      = var.container_port
  desired_count       = var.desired_count
  execution_role_name = var.execution_role_name
  container_env = merge({
    NODE_ENV     = "production"
    PORT         = tostring(var.container_port)
    DATABASE_URL = local.database_url
    JWT_ISSUER   = module.cognito.issuer
    JWT_AUDIENCE = module.cognito.app_client_id
    JWKS_URI     = module.cognito.jwks_uri
  }, var.container_env)
}

module "frontend" {
  source       = "./modules/frontend"
  project_name = var.project_name
  environment  = var.environment
}
