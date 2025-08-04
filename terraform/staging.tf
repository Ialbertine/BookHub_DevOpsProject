# Staging environment resources
# Note: Uses the SAME app service plan as production for consistency

# Use the exact same app service plan as production
data "azurerm_service_plan" "existing" {
  name                = "bookhub-plan-9r7f"  # Same plan as production
  resource_group_name = data.azurerm_resource_group.bookhub.name
}

# Linux Web App for Staging Backend
resource "azurerm_linux_web_app" "bookhub_staging_backend" {
  name                = "bookhub-staging-backend-9r7f"  # Same suffix as production
  location            = data.azurerm_resource_group.bookhub.location
  resource_group_name = data.azurerm_resource_group.bookhub.name
  service_plan_id     = data.azurerm_service_plan.existing.id

  site_config {
    application_stack {
      docker_image     = "ialbertine/backend"     
      docker_image_tag = "latest"
    }
    always_on = false
  }

  app_settings = {
    "MONGODB_URI"     = var.mongo_uri
    "NODE_ENV"        = "staging"
    "WEBSITES_PORT"   = "5000"
    "JWT_SECRET"      = var.jwt_secret
    "JWT_EXPIRES_IN"  = "1d"
    "FRONTEND_URL"    = "https://bookhub-staging-frontend-9r7f.azurewebsites.net"
    "ENVIRONMENT"     = "staging"
  }
}

# Linux Web App for Staging Frontend
resource "azurerm_linux_web_app" "bookhub_staging_frontend" {
  name                = "bookhub-staging-frontend-9r7f"  # Same suffix as production
  location            = data.azurerm_resource_group.bookhub.location
  resource_group_name = data.azurerm_resource_group.bookhub.name
  service_plan_id     = data.azurerm_service_plan.existing.id

  site_config {
    application_stack {
      docker_image     = "ialbertine/frontend"     
      docker_image_tag = "latest"
    }
    always_on = false  # MUST be false for F1 (free tier)
  }

  app_settings = {
    "WEBSITES_PORT"        = "3000"
    "NODE_ENV"             = "staging"
    "VITE_API_URL"         = "https://bookhub-staging-backend-9r7f.azurewebsites.net"
    "VITE_ENVIRONMENT"     = "staging"
  }
}

# Linux Web App for Staging Monitoring Dashboard
resource "azurerm_linux_web_app" "bookhub_staging_monitoring" {
  name                = "bookhub-staging-monitoring-9r7f"  # Same suffix as production
  location            = data.azurerm_resource_group.bookhub.location
  resource_group_name = data.azurerm_resource_group.bookhub.name
  service_plan_id     = data.azurerm_service_plan.existing.id

  site_config {
    application_stack {
      docker_image     = "ialbertine/monitoring"     
      docker_image_tag = "latest"
    }
    always_on = false  # MUST be false for F1 (free tier)
  }

  app_settings = {
    "WEBSITES_PORT"        = "3001"
    "NODE_ENV"             = "staging"
    "BACKEND_URL"          = "https://bookhub-staging-backend-9r7f.azurewebsites.net"
    "FRONTEND_URL"         = "https://bookhub-staging-frontend-9r7f.azurewebsites.net"
    "ENVIRONMENT"          = "staging"
    "MONITORING_PORT"      = "3001"
  }
}

# Outputs are defined in outputs.tf for better organization 