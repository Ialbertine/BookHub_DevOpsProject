variable "location" {
  description = "Azure region for resources"
  type        = string
}

variable "rg_name" {
  description = "Resource group name"
  type        = string
}

variable "mongo_uri" {
  description = "MongoDB cluster connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
}