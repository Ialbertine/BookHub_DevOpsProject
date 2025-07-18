terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "bookhub" {
  name     = "bookhub-resources"
  location = "East US"
}

module "database" {
  source     = "./modules/database"
  location   = azurerm_resource_group.bookhub.location
  rg_name    = azurerm_resource_group.bookhub.name
}

module "container_registry" {
  source     = "./modules/container_registry"
  location   = azurerm_resource_group.bookhub.location
  rg_name    = azurerm_resource_group.bookhub.name
}

module "app_runner" {
  source          = "./modules/app_runner"
  location        = azurerm_resource_group.bookhub.location
  rg_name         = azurerm_resource_group.bookhub.name
  acr_name        = module.container_registry.acr_name
  database_url    = module.database.connection_string
}