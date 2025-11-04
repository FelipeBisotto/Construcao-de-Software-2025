terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
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

locals {
  database_url = "postgresql://${var.db_username}:${var.db_password}@${module.database.db_endpoint}:5432/${var.db_name}?schema=public"
}

module "ecs" {
  source             = "./modules/ecs"
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.network.vpc_id
  public_subnet_ids  = module.network.public_subnet_ids
  private_subnet_ids = module.network.private_subnet_ids
  backend_image      = var.backend_image
  container_port     = var.container_port
  desired_count      = var.desired_count
  container_env = merge({
    NODE_ENV     = "production"
    PORT         = tostring(var.container_port)
    DATABASE_URL = local.database_url
  }, var.container_env)
}

module "frontend" {
  source       = "./modules/frontend"
  project_name = var.project_name
  environment  = var.environment
}

