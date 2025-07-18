resource "azurerm_container_registry" "bookhub" {
  name                = "bookhubacr${replace(var.rg_name, "-", "")}"
  resource_group_name = var.rg_name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = true
}

output "acr_name" {
  value = azurerm_container_registry.bookhub.name
}

output "acr_login_server" {
  value = azurerm_container_registry.bookhub.login_server
}