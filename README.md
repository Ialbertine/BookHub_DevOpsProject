# BookHub_DevOpsProject
Book Hub is a Full-Stack web application designed to help users explore and discover books across genres with ease. It provides a simple interface for browsing, searching, and viewing book details, while also giving librarians full control over managing the book collection. The platform balances functionality for both everyday readers and library staff in a clean, responsive experience.

## Application URLs
- Frontend: https://bookhub-frontend-9r7f.azurewebsites.net
- Backend API: https://bookhub-backend-9r7f.azurewebsites.net
- monitoring Dashboard: https://bookhub-monitoring-2n62.azurewebsites.net/dashboard 

## Features
### Backend
- RESTful API with Express.js
- User authentication with JWT
- MongoDB data storage with Mongoose
- Secure password hashing with bcrypt
- API security best practices with Helmet and CORS
- Request logging with Morgan

### Frontend
- React with Vite
- Typescript
- Tailwindcss
- Responsive Design
- Testing with vitest
- Linting with ESLint

### Monitoring & Observability
- Real-time application health monitoring
- Comprehensive logging with Winston
- Performance metrics tracking
- Security alert system
- Operational dashboard with alerts

## Installation
- Node.js
- MongoDB
- Git


### Backend Setup
1. Clone the respository
```bash
git clone https://github.com/Ialbertine/BookHub_DevOpsProject.git

npm install #for the root installation
npm run dev #for running both the backend and frontend at the same time
cd backend
```
2. Install dependencies
```bash
npm install
#then 
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Development
### backend
- `npm test` run test with coverage
- `npm run test` run tests in watch mode
- `npm run lint` run Eslint
- `npm run lint:fix` : for linting the issues

### Frontend
- `npm run build`: build for production
- `npm run test` : run tests
- `npm run test:coverage` : run tests with coverage
- `npm run test:watch` 
- `npm run lint` : Run Eslint
- `npm run lint:fix`: fix linting issues

## Continuous Integration/Deployment (CI/CD)

### **Enhanced Security Pipeline**
The project uses a comprehensive GitHub Actions CI/CD pipeline with integrated security scanning:

#### **Security Components:**
- **Dependency Vulnerability Scanning** - npm audit with moderate+ severity
- **Code Security Scanning** - Trivy filesystem scan for code vulnerabilities
- **Container Security Scanning** - Trivy vulnerability scanner for Docker images
- **Comprehensive Security Scanning** - Trivy vulnerability scanner for codebase and containers
- **Security Results Integration** - All results uploaded to GitHub Security tab

#### **Pipeline Stages:**
1. **Security Scan** - Vulnerability scanning of codebase and dependencies
2. **Backend CI** - Linting, testing, security audit, coverage reporting
3. **Frontend CI** - Linting, testing, building, security audit, coverage reporting
4. **Deployment** - Automated deployment to Azure Web Apps with health checks

#### **Quality Gates:**
- All tests must pass
- Security scans must complete without critical vulnerabilities
- Code coverage must meet minimum thresholds
- Linting must pass
- Build must succeed

#### **Automated Deployment:**
- **Trigger**: Push to main branch
- **Target**: Azure Web Apps (Backend + Frontend)
- **Health Checks**: Automated verification of deployment success
- **Monitoring**: Real-time application health monitoring

### Branches CI workflow
To maintain a clean and efficient development process the structured Git branching strategy combined with automated CI (for now) Pipelines to ensure code quality before deployment

1. main branch
- represents the production ready state of the application
- only updated Pull requests (PRs) from develop after passing all CI checks
- Protected by github branch protection rules main requires PRs, approvals and CI checks

2. Develop branch
- the integration branch where all feature branches merge
- must pass CI tests linting, unit tests, integration tests before merging into main
- used for staging/testing environments
- All PRs must be opened to the develop branch
- Use Semantic commit message like (feat:, fix:, chore:)

## Docker Images intructions
## Frontend Container
- Image: ialbertine/frontend:latest
- Base: Node.js with Vite build system
- Port: 3000
- Environment: Production for React build

## Backend Container
- Image: ialbertine/backend:latest
- Base: Node.js with Express framework
- Port: 5000
- Features: REST API, JWT authentication, MongoDB integration(clusters from mongodb atlas)

### Azure Infrastructure
## Resources Deployed
- Resource Group: bookhub_devops
- App Service Plan: Linux-based, F1 (Free tier used subscription azure for student starter)
- Frontend App Service: bookhub-frontend-[suffix]
- Backend App Service: bookhub-backend-[suffix]

### Environment Variables Configured
## Backend App Service:
- MONGODB_URI: Database connection string
- JWT_SECRET: Authentication secret key
- JWT_EXPIRES_IN: Token expiration time
- FRONTEND_URL: CORS allowed origin
- NODE_ENV: production
- WEBSITES_PORT: 5000

## Frontend App Service:
- VITE_API_BASE_URL: Backend API endpoint
- NODE_ENV: production
- WEBSITES_PORT: 3000

### Deployment
## Prerequisites
- Azure CLI installed and configured
- Terraform installed
- Docker Hub account
  
## Deploy Infrastructure
```bash
#Navigate to terraform directory
cd terraform
# Initialize Terraform
terraform init
# Plan deployment
terraform plan 
# Apply infrastructure
terraform apply
```
## Environment Variables Required
```bash
#Create a terraform.tfvars
#check in the code file called terraform.tfvars.example
#use the guidance environment to create yours

mongodb_uri = "your-mongodb-connection-string"
location = "your choise" ex: East US but check the region your subscription support
docker_username = "your-dockerhub-username"
docker_password = "your-dockerhub-password"
jwt_secret = "your-jwt-secret-key"
```

## Key Features
- Containerized Applications: Both frontend and backend run in Docker containers
- Infrastructure as Code: Complete Azure infrastructure managed with Terraform
- Auto-scaling: Azure App Service handles traffic scaling
- Environment Configuration: Proper environment variable management
- CORS Configuration: Secure cross-origin resource sharing
- Health Monitoring: Built-in health check endpoints
- **Enhanced Security**: Comprehensive vulnerability scanning and security testing
- **Automated Releases**: Complete release management with versioning and changelog
- **Monitoring & Observability**: Real-time application monitoring and alerting

## Documentation

### **Core Documentation**
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history, releases, and automated updates
- **[test-pipeline.md](./test-pipeline.md)** - Testing procedures and troubleshooting
- **[phase.md](./phase.md)** - containing the url links for the project bookhub and link of the PRs i reviewed


### **Quick Commands**
```bash
# Development
npm run dev                    
npm run test                  
npm run lint                  
npm run security:audit       

# Documentation
npm run changelog:check        
npm run changelog:version      
npm run release:prepare      

# Commits & Releases
npm run commit                
npm run test:release          
```
