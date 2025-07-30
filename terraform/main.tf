terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "azurerm" {
  features {}
}

# Use data source to reference existing resource group
data "azurerm_resource_group" "bookhub" {
  name = "bookhub_devops"
}

module "app_runner" {
  source     = "./modules/app_runner"
  location   = data.azurerm_resource_group.bookhub.location
  rg_name    = data.azurerm_resource_group.bookhub.name
  mongo_uri  = var.mongo_uri  
  jwt_secret = var.jwt_secret
}

# Output the URLs from the module
output "backend_url" {
  value       = module.app_runner.backend_url
  description = "URL of the backend application"
}

output "frontend_url" {
  value       = module.app_runner.frontend_url
  description = "URL of the frontend application"
}

output "monitoring_url" {
  value       = module.app_runner.monitoring_url
  description = "URL of the monitoring dashboard"
}