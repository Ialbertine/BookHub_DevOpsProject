variable "location" {
  type = string
}

variable "rg_name" {
  type = string
}

variable "mongo_uri" {
  type      = string
  sensitive = true
}

# Random suffix for unique naming
resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}

# App Service Plan - FREE TIER
resource "azurerm_service_plan" "bookhub" {
  name                = "bookhub-plan-${random_string.suffix.result}"
  location            = var.location
  resource_group_name = var.rg_name
  os_type             = "Linux"
  sku_name            = "F1"
}

# Linux Web App for Backend
resource "azurerm_linux_web_app" "bookhub_backend" {
  name                = "bookhub-backend-${random_string.suffix.result}"
  location            = var.location
  resource_group_name = var.rg_name
  service_plan_id     = azurerm_service_plan.bookhub.id

  site_config {
    application_stack {
      docker_image     = "ialbertine/bookhub-backend"
      docker_image_tag = "latest"
    }
    always_on = false
  }

  app_settings = {
    "MONGODB_URI"   = var.mongo_uri
    "NODE_ENV"      = "production"
    "WEBSITES_PORT" = "5000"
  }
}

# Linux Web App for Frontend
resource "azurerm_linux_web_app" "bookhub_frontend" {
  name                = "bookhub-frontend-${random_string.suffix.result}"
  location            = var.location
  resource_group_name = var.rg_name
  service_plan_id     = azurerm_service_plan.bookhub.id

  site_config {
    application_stack {
      docker_image     = "ialbertine/bookhub-frontend"
      docker_image_tag = "latest"
    }
    always_on = false  # MUST be false for F1 (free tier)
  }

  app_settings = {
    "WEBSITES_PORT" = "3000"
    "API_URL"       = "https://${azurerm_linux_web_app.bookhub_backend.default_hostname}"
  }
}

output "backend_url" {
  value = "https://${azurerm_linux_web_app.bookhub_backend.default_hostname}"
}

output "frontend_url" {
  value = "https://${azurerm_linux_web_app.bookhub_frontend.default_hostname}"
}