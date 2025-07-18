resource "azurerm_cosmosdb_account" "bookhub" {
  name                = "bookhub-cosmosdb"
  location            = var.location
  resource_group_name = var.rg_name
  offer_type          = "Standard"
  kind                = "MongoDB"

  enable_automatic_failover = true

  capabilities {
    name = "EnableAggregationPipeline"
  }

  capabilities {
    name = "mongoEnableDocLevelTTL"
  }

  capabilities {
    name = "MongoDBv3.4"
  }

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }
}

output "connection_string" {
  value     = azurerm_cosmosdb_account.bookhub.connection_strings[0]
  sensitive = true
}