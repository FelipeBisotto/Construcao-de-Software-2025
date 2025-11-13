variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "backend_image" {
  type = string
}

variable "container_port" {
  type    = number
  default = 3000
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "cpu" {
  type    = number
  default = 512
}

variable "memory" {
  type    = number
  default = 1024
}

variable "container_env" {
  type    = map(string)
  default = {}
}

variable "execution_role_name" {
  type        = string
  description = "Existing IAM role name to be used as ECS execution role (e.g., LabRole in AWS Academy)"
  default     = "LabRole"
}

variable "health_check_path" {
  type    = string
  default = "/health"
}
