variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "callback_urls" {
  type    = list(string)
  default = []
}

variable "logout_urls" {
  type    = list(string)
  default = []
}

variable "admin_user_email" {
  type = string
}

variable "admin_user_temp_password" {
  type      = string
  sensitive = true
}

variable "standard_user_email" {
  type = string
}

variable "standard_user_temp_password" {
  type      = string
  sensitive = true
}
