locals {
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-${var.environment}-db-sg"
  description = "Allow Postgres from app subnets"
  vpc_id      = var.vpc_id

  tags = local.tags
}

resource "aws_security_group_rule" "ingress_app" {
  for_each = toset(var.allowed_cidr_blocks)

  type              = "ingress"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  security_group_id = aws_security_group.db.id
  cidr_blocks       = [each.value]
  description       = "Allow app subnets"
}

resource "aws_security_group_rule" "egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.db.id
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-${var.environment}-db-subnet"
  subnet_ids = var.private_subnet_ids
  tags       = local.tags
}

resource "aws_db_instance" "this" {
  identifier                   = "${var.project_name}-${var.environment}-db"
  allocated_storage            = var.allocated_storage
  engine                       = "postgres"
  engine_version               = "17.5"
  instance_class               = var.instance_class
  db_name                      = var.db_name
  username                     = var.db_username
  password                     = var.db_password
  db_subnet_group_name         = aws_db_subnet_group.this.name
  vpc_security_group_ids       = [aws_security_group.db.id]
  publicly_accessible          = false
  apply_immediately            = true
  skip_final_snapshot          = true
  backup_retention_period      = var.backup_retention
  auto_minor_version_upgrade   = true
  deletion_protection          = false
  storage_encrypted            = true
  multi_az                     = false
  performance_insights_enabled = true
  max_allocated_storage        = var.allocated_storage + 20

  tags = local.tags
}

output "db_endpoint" {
  value = aws_db_instance.this.address
}

output "db_secret" {
  value = {
    username = var.db_username
    password = var.db_password
    database = var.db_name
  }
  sensitive = true
}

output "security_group_id" {
  value = aws_security_group.db.id
}
