### Link to the AzureWebsites URL for Frontend and Backend

## Frontend URL: https://bookhub-frontend-9r7f.azurewebsites.net/ 

## Backend API URL: https://bookhub-backend-9r7f.azurewebsites.net/api/

### Screenshots of The successfully provisioned resources when deploying to Azure

![Terraform is applying infrastructure changes to update the bookhub_backend Azure web app](./screenshots/Screenshot1.png)

![Terraform plans to update one output and warns that the docker_image argument in azurerm_linux_web_app is deprecated and will be removed in version 4.0 of the provider due to some backend dependencies which are deprecated.](./screenshots/Screenshot2.png)

![Terraform applied the changes successfully](./screenshots/Screenshot3.png)

![Building backend images to update changes](./screenshots/Screenshot4.png)

![Pushing changes to the backend images after updating them](./screenshots/Screenshot5.png)
