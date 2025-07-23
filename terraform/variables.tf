variable "mongo_uri" {
  description = "MongoDB cluster connection string"
  type        = string
  sensitive   = true
}

variable "docker_username" {
  description = "Docker Hub username"
  type = string
  default = "ialbertine"
}

variable "docker_password" {
  description = "Docker Hub password"
  type = string
  sensitive = true
}