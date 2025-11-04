variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "index_document" {
  type    = string
  default = "index.html"
}

variable "error_document" {
  type    = string
  default = "index.html"
}
