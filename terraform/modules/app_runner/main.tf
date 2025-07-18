resource "azurerm_container_group" "bookhub" {
  name                = "bookhub-container"
  resource_group_name = var.rg_name
  location            = var.location
  ip_address_type     = "Public"
  dns_name_label      = "bookhub-app"
  os_type             = "Linux"

  container {
    name   = "bookhub-backend"
    image  = "${var.acr_name}.azurecr.io/bookhub-backend:latest"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 5000
      protocol = "TCP"
    }

    environment_variables = {
      "MONGODB_URI" = var.database_url
      "NODE_ENV"    = "production"
    }
  }

  container {
    name   = "bookhub-frontend"
    image  = "${var.acr_name}.azurecr.io/bookhub-frontend:latest"
    cpu    = "0.5"
    memory = "1.0"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }

  depends_on = [var.database_url]
}

output "app_url" {
  value = "https://${azurerm_container_group.bookhub.fqdn}"
}