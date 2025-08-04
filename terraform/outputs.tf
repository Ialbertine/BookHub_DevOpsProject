# Production Environment Outputs
output "production_backend_url" {
  value       = module.app_runner.backend_url
  description = "URL of the production backend application"
}

output "production_frontend_url" {
  value       = module.app_runner.frontend_url
  description = "URL of the production frontend application"
}

output "production_monitoring_url" {
  value       = module.app_runner.monitoring_url
  description = "URL of the production monitoring dashboard"
}

# Staging Environment Outputs (if staging.tf is applied)
output "staging_backend_url" {
  value       = try("https://${azurerm_linux_web_app.bookhub_staging_backend.default_hostname}", "Staging not deployed yet")
  description = "URL of the staging backend application"
}

output "staging_frontend_url" {
  value       = try("https://${azurerm_linux_web_app.bookhub_staging_frontend.default_hostname}", "Staging not deployed yet")
  description = "URL of the staging frontend application"
}

output "staging_monitoring_url" {
  value       = try("https://${azurerm_linux_web_app.bookhub_staging_monitoring.default_hostname}/dashboard", "Staging not deployed yet")
  description = "URL of the staging monitoring dashboard"
}

