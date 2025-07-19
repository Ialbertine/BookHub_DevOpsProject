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

resource "azurerm_cosmosdb_mongo_database" "bookhub" {
  name                = "bookhub"
  resource_group_name = var.rg_name
  account_name        = azurerm_cosmosdb_account.bookhub.name
}

resource "azurerm_cosmosdb_mongo_collection" "users_collection" {
  name                = "users"
  resource_group_name = var.rg_name
  account_name        = azurerm_cosmosdb_account.bookhub.name
  database_name       = azurerm_cosmosdb_mongo_database.bookhub_db.name
  shard_key           = "_id"
  throughput          = 400
}

resource "azurerm_cosmosdb_mongo_collection" "books_collection" {
  name                = "books"
  resource_group_name = var.rg_name
  account_name        = azurerm_cosmosdb_account.bookhub.name
  database_name       = azurerm_cosmosdb_mongo_database.bookhub.name
  shard_key           = "_id"
  throughput          = 400
}

output "database_name" {
  value = azurerm_cosmosdb_mongo_database.bookhub.name
}

output "users_collection_name" {
  value = azurerm_cosmosdb_mongo_collection.users_collection.name
}

output "books_collection_name" {
  value = azurerm_cosmosdb_mongo_collection.books_collection.name
}

output "connection_string" {
  value     = azurerm_cosmosdb_account.bookhub.connection_strings[0]
  sensitive = true
}