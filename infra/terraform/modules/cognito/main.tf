terraform {
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

locals {
  base_name     = lower("${var.project_name}-${var.environment}")
  domain_prefix = substr(replace(local.base_name, "/[^a-z0-9-]/", "-"), 0, 26)
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "random_string" "domain_suffix" {
  length  = 4
  upper   = false
  special = false
}

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.environment}-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = false
  }

  tags = local.tags
}

resource "aws_cognito_user_pool_domain" "this" {
  domain       = "${local.domain_prefix}-${random_string.domain_suffix.result}"
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.project_name}-${var.environment}-app-client"
  user_pool_id = aws_cognito_user_pool.this.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = [
    "openid",
    "profile",
    "email"
  ]

  allowed_oauth_flows_user_pool_client = true
  callback_urls                        = length(var.callback_urls) > 0 ? var.callback_urls : ["http://localhost:5173/auth/callback"]
  logout_urls                          = length(var.logout_urls) > 0 ? var.logout_urls : ["http://localhost:5173"]
  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  supported_identity_providers         = ["COGNITO"]

  refresh_token_validity = 7
  access_token_validity  = 60
  id_token_validity      = 60
  token_validity_units {
    refresh_token = "days"
    access_token  = "minutes"
    id_token      = "minutes"
  }
}

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.this.id
  description  = "Administrators"
}

resource "aws_cognito_user_group" "user" {
  name         = "user"
  user_pool_id = aws_cognito_user_pool.this.id
  description  = "Regular users"
}

resource "aws_cognito_user" "admin" {
  user_pool_id = aws_cognito_user_pool.this.id
  username     = var.admin_user_email
  attributes = {
    email = var.admin_user_email
  }
  temporary_password   = var.admin_user_temp_password
  force_alias_creation = true
  lifecycle {
    prevent_destroy = false
  }
}

resource "aws_cognito_user_in_group" "admin_membership" {
  user_pool_id = aws_cognito_user_pool.this.id
  username     = aws_cognito_user.admin.username
  group_name   = aws_cognito_user_group.admin.name
}

resource "aws_cognito_user" "standard" {
  user_pool_id = aws_cognito_user_pool.this.id
  username     = var.standard_user_email
  attributes = {
    email = var.standard_user_email
  }
  temporary_password   = var.standard_user_temp_password
  force_alias_creation = true
  lifecycle {
    prevent_destroy = false
  }
}

resource "aws_cognito_user_in_group" "standard_membership" {
  user_pool_id = aws_cognito_user_pool.this.id
  username     = aws_cognito_user.standard.username
  group_name   = aws_cognito_user_group.user.name
}

locals {
  issuer    = aws_cognito_user_pool.this.endpoint
  jwks_uri  = "${aws_cognito_user_pool.this.endpoint}/.well-known/jwks.json"
  auth_host = "${aws_cognito_user_pool_domain.this.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}

data "aws_region" "current" {}

output "user_pool_id" {
  value = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.this.arn
}

output "app_client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "issuer" {
  value = local.issuer
}

output "jwks_uri" {
  value = local.jwks_uri
}

output "authorization_endpoint" {
  value = "https://${local.auth_host}/oauth2/authorize"
}

output "token_endpoint" {
  value = "https://${local.auth_host}/oauth2/token"
}

output "test_users" {
  value = {
    admin = {
      username      = aws_cognito_user.admin.username
      temp_password = var.admin_user_temp_password
    }
    user = {
      username      = aws_cognito_user.standard.username
      temp_password = var.standard_user_temp_password
    }
  }
  sensitive = true
}
