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


