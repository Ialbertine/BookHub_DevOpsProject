# Terraform Infrastructure Management

This directory contains the Terraform configuration for managing Azure infrastructure for the BookHub project.

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
├── terraform.tfvars     # Production variables (contains secrets)
├── staging.tfvars       # Staging variables
├── terraform.tfvars.example  # Example variables file
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

# Plan staging deployment
terraform plan -var-file="staging.tfvars" -out=staging.tfplan

# Apply staging changes
terraform apply staging.tfplan
```

### **For Production Environment:**

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan production deployment
terraform plan -var-file="terraform.tfvars" -out=production.tfplan

# Apply production changes
terraform apply production.tfplan
```

## 🔧 **Environment Variables**

### **Staging (`staging.tfvars`):**
- Uses staging-specific resource names
- Points to staging Azure resources
- Contains actual secrets for staging environment

### **Production (`terraform.tfvars`):**
- Uses production resource names
- Points to production Azure resources
- Contains actual secrets for production environment

## ⚠️ **Important Notes**

1. **Never commit `terraform.tfvars`** - It contains sensitive information
2. **Always review the plan** before applying changes
3. **Use separate state files** for different environments if needed
4. **Backup your state** before major changes

## 🔍 **Useful Commands**

```bash
# Show current state
terraform show

# List resources
terraform state list

# Destroy specific resource
terraform destroy -target=azurerm_app_service.staging_backend

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