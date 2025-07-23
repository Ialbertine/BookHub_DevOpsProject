terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "bookhub" {
  name     = "bookhub_devops"
  location = "centralindia" 
}

module "app_runner" {
  source    = "./modules/app_runner"
  location  = azurerm_resource_group.bookhub.location
  rg_name   = azurerm_resource_group.bookhub.name
  mongo_uri = var.mongo_uri  # Make sure to pass this as TF_VAR_mongo_uri
}