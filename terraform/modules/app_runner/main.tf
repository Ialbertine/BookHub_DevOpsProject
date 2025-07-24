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
      docker_image     = "ialbertine/backend"     
      docker_image_tag = "latest"
    }
    always_on = false
  }

  app_settings = {
    "MONGODB_URI"     = var.mongo_uri
    "NODE_ENV"        = "production"
    "WEBSITES_PORT"   = "5000"
    "JWT_SECRET"      = var.jwt_secret
    "JWT_EXPIRES_IN"  = "1d"
    "FRONTEND_URL"    = "https://bookhub-frontend-${random_string.suffix.result}.azurewebsites.net"
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
      docker_image     = "ialbertine/frontend"     
      docker_image_tag = "latest"
    }
    always_on = false  # MUST be false for F1 (free tier)
  }

  app_settings = {
    "WEBSITES_PORT"        = "3000"
    "NODE_ENV"             = "production"
    "VITE_API_BASE_URL" = "https://bookhub-backend-${random_string.suffix.result}.azurewebsites.net"
  }
}

output "backend_url" {
  value = "https://${azurerm_linux_web_app.bookhub_backend.default_hostname}"
}

output "frontend_url" {
  value = "https://${azurerm_linux_web_app.bookhub_frontend.default_hostname}"
}