variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "cs2025"
}

variable "environment" {
  description = "Deployment environment identifier"
  type        = string
  default     = "dev"
}

variable "backend_image" {
  description = "Full image URI for the backend container (ECR or Docker Hub)"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "app"
}

variable "db_username" {
  description = "Database admin username"
  type        = string
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

variable "vpc_cidr" {
  description = "Base CIDR for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "container_port" {
  description = "Backend container/listener port"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "container_env" {
  description = "Extra environment variables injected into the backend task"
  type        = map(string)
  default     = {}
}

variable "cognito_callback_urls" {
  description = "Callback URLs permitidos no Cognito Hosted UI"
  type        = list(string)
  default     = []
}

variable "cognito_logout_urls" {
  description = "URLs de logout para Cognito"
  type        = list(string)
  default     = []
}

variable "cognito_admin_email" {
  description = "Email do usuário administrador seed"
  type        = string
  default     = "admin@example.com"
}

variable "cognito_admin_temp_password" {
  description = "Senha temporária do administrador (será exigida troca no primeiro login)"
  type        = string
  default     = "Admin123!"
  sensitive   = true
}

variable "cognito_user_email" {
  description = "Email do usuário padrão seed"
  type        = string
  default     = "user@example.com"
}

variable "cognito_user_temp_password" {
  description = "Senha temporária do usuário padrão"
  type        = string
  default     = "User123!"
  sensitive   = true
}
