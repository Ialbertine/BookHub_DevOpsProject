# CI/CD Pipeline Testing Guide

## **1. Trigger Pipeline Testing**

### **Step 1: Make a Test Commit**
```bash
# Make a small change to trigger the pipeline
echo "# Test commit for pipeline verification" >> README.md
git add README.md
git commit -m "test: trigger CI/CD pipeline for verification"
git push origin main
```

### **Step 2: Monitor GitHub Actions**
1. Go to your GitHub repository
2. Click on "Actions" tab
3. Watch the `main.yml` workflow
4. Check each job completes successfully

## **2. Expected Pipeline Jobs & Success Criteria**

### **✅ Security Scan Job**
- **Trivy vulnerability scanner** should run
- Results should appear in GitHub Security tab

### **✅ Backend CI Job**
- ESLint passes
- npm audit completes (may show warnings - that's normal)
- Tests run with coverage
- Coverage report uploaded to Codecov

### **✅ Frontend CI Job**
- ESLint passes
- npm audit completes
- Tests run with coverage
- Build succeeds
- Coverage report uploaded to Codecov

### **✅ Container Security Job** (only on main/develop branches)
- Docker images build successfully
- Trivy scans container images
- Results uploaded to GitHub Security tab

### **✅ Deploy Job** (only on main branch push)
- Images pushed to Docker Hub
- Deployment to Azure succeeds
- Health checks pass

## **3. Manual Verification Steps**

### **Check Security Results**
1. Go to GitHub repository → Security tab
2. Look for:
   - Code scanning alerts
   - Dependency review
   - Security advisories

### **Check Coverage Reports**
1. Go to Codecov.io (if connected)
2. Verify coverage reports for both backend and frontend

### **Check Deployment**
1. Visit your Azure Web App URLs
2. Verify applications are running
3. Check environment variables are set correctly

### **Check Monitoring Dashboard**
1. Deploy with Terraform: `cd terraform && terraform apply`
2. Get monitoring URL: `terraform output monitoring_url`
3. Access the monitoring dashboard
4. Verify real-time metrics are displayed

## **4. Troubleshooting Common Issues**

### **If Security Scan Fails:**
- Check if Trivy configuration is correct
- Review security scan logs for specific errors

### **If npm audit fails:**
- Review vulnerability reports
- Update dependencies if needed
- Consider using `npm audit --audit-level=high` for stricter checks

### **If Container Security fails:**
- Check Docker Hub credentials
- Verify image names and tags
- Review Trivy scan results

### **If Deployment fails:**
- Check Azure credentials
- Verify resource group and app names
- Review health check endpoints

### **If Terraform deployment fails:**
- Check Azure authentication: `az login`
- Verify resource group exists: `az group list`
- Check Terraform configuration syntax

## **5. Performance Monitoring**

### **Pipeline Execution Time**
- Monitor how long each job takes
- Optimize if jobs are taking too long

### **Resource Usage**
- Check GitHub Actions minutes usage
- Monitor Docker Hub storage usage

## **6. Security Validation**

### **Verify Security Scans**
```bash
# Check if security files are created
ls -la trivy-*.sarif
ls -la trivy-backend-results.sarif
ls -la trivy-frontend-results.sarif
```

### **Test Security Endpoints**
```bash
# Test your health endpoint
curl -f https://your-backend.azurewebsites.net/api/health
```

## **7. Final Stage Verification**

### **Complete CD Pipeline**
- ✅ Merge to main triggers full deployment sequence
- ✅ All deployment steps automated
- ✅ Professional-grade deployment process

### **DevSecOps Integration**
- ✅ Dependency and container scanning integrated
- ✅ Security results properly documented
- ✅ Automated security quality gates

### **Monitoring and Observability**
- ✅ Functional monitoring dashboard deployed
- ✅ Real-time operational alarms configured
- ✅ Responsive alerting system implemented

### **Release Management**
- ✅ Automated release process with version tracking
- ✅ Comprehensive documentation maintained
- ✅ Conventional commit standards followed

## **8. Documentation**

### **Update README**
Add pipeline information to your README:
- Pipeline status badge
- Security scanning information
- Deployment URLs
- Monitoring dashboard links

### **Pipeline Status Badge**
```markdown
![CI/CD Pipeline](https://github.com/your-username/your-repo/workflows/main/badge.svg)
```

## **9. Final Assessment Checklist**

### **✅ All Requirements Met**
- [ ] Complete CD pipeline with automated deployment
- [ ] Security scanning integrated at every stage
- [ ] Monitoring dashboard deployed and functional
- [ ] Infrastructure managed with Terraform
- [ ] All tests passing successfully
- [ ] Documentation complete and up-to-date

### **✅ Ready for Assessment**
- [ ] Pipeline renamed to `main.yml`
- [ ] CHANGELOG.md updated with final stage
- [ ] test-pipeline.md provides clear testing guide
- [ ] All unnecessary files removed
- [ ] Project structure clean and professional

---

**Your project is ready for final stage assessment!** 🎉 