# Terraform Infrastructure Management

This directory contains the Terraform configuration for managing Azure infrastructure for the BookHub project.

## ⚠️ **IMPORTANT: Local Infrastructure Management**

**Infrastructure changes are managed LOCALLY, not through CI/CD pipelines.**

- ✅ **Local Terraform**: All infrastructure changes are applied locally
- ✅ **CI/CD Applications**: Only application code is deployed through GitHub Actions
- ✅ **Manual Control**: You have full control over when infrastructure changes are applied

## 🏗️ **Infrastructure Overview**

- **Backend Web App**: Node.js API service
- **Frontend Web App**: React application
- **Monitoring Web App**: Dashboard for application monitoring
- **Resource Group**: `bookhub_devops` (existing)

## 📁 **Files Structure**

```
terraform/
├── main.tf              # Main configuration and data sources
├── staging.tf           # Staging environment resources
├── variables.tf         # Input variables definition
├── outputs.tf           # Output values
├── terraform.tfvars     # Environment variables (used for both staging & production)
└── modules/             # Reusable modules
    ├── app_runner/      # Web app module
    └── database/        # Database module
```

## 🚀 **Local Terraform Workflow**

### **For Staging Environment:**

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan staging deployment (targets staging resources)
terraform plan -target=azurerm_linux_web_app.bookhub_staging_backend -target=azurerm_linux_web_app.bookhub_staging_frontend -target=azurerm_linux_web_app.bookhub_staging_monitoring -out=staging.tfplan

# Apply staging changes
terraform apply staging.tfplan
```

### **For Production Environment:**

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan production deployment (targets production resources)
terraform plan -target=azurerm_linux_web_app.bookhub_backend -target=azurerm_linux_web_app.bookhub_frontend -target=azurerm_linux_web_app.bookhub_monitoring -out=production.tfplan

# Apply production changes
terraform apply production.tfplan
```

### **For All Resources:**

```bash
# Plan all resources
terraform plan -out=all.tfplan

# Apply all changes
terraform apply all.tfplan
```

## 🔧 **Environment Variables**

### **Single `terraform.tfvars` File:**
- Contains all environment variables
- Used for both staging and production
- Contains sensitive data (MongoDB URI, JWT secret, Docker credentials)

## ⚠️ **Important Notes**

1. **Never commit `terraform.tfvars`** - It contains sensitive information
2. **Always review the plan** before applying changes
3. **Use targeting** to deploy specific environments
4. **Backup your state** before major changes

## 🔍 **Useful Commands**

```bash
# Show current state
terraform show

# List resources
terraform state list

# Destroy specific resource
terraform destroy -target=azurerm_linux_web_app.bookhub_staging_backend

# Refresh state
terraform refresh

# Validate configuration
terraform validate
```

## 🛡️ **Security Best Practices**

1. **Use Azure Key Vault** for storing secrets in production
2. **Enable state encryption** for sensitive data
3. **Use service principals** with minimal required permissions
4. **Regularly rotate secrets** and credentials

## 📋 **Pre-deployment Checklist**

- [ ] Review `terraform plan` output
- [ ] Verify resource names and locations
- [ ] Check environment variables
- [ ] Ensure Azure credentials are valid
- [ ] Backup current state (if needed)

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Authentication Error**: Ensure Azure CLI is logged in
2. **Resource Not Found**: Check if resource group exists
3. **Permission Denied**: Verify service principal permissions
4. **State Lock**: Check for concurrent operations

### **Getting Help:**

- Check Azure CLI status: `az account show`
- Verify Terraform version: `terraform version`
- Review Azure provider documentation 