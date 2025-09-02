# Banking System API Gateway

This is the API Gateway for the Banking System microservices architecture, built using Ocelot and MMLib.SwaggerForOcelot.

## Overview

The API Gateway serves as a single entry point for all client requests to the Banking System microservices. It provides:

- **Unified API endpoint** at `https://localhost:7210`
- **JWT Authentication** for secured services
- **Swagger UI integration** for all downstream services
- **CORS configuration** for cross-origin requests
- **Global exception handling**
- **Health monitoring** endpoints

## Services Routing

The following microservices are routed through the API Gateway:

| Service | Port | Route | Authentication Required |
|---------|------|-------|------------------------|
| AuthService | 7201 | `/api/Auth/{everything}` | No |
| CustomerService | 7202 | `/api/Customer/{everything}` | Yes |
| AccountService | 7203 | `/api/Account/{everything}` | Yes |
| TransactionService | 7204 | `/api/Transaction/{everything}` | Yes |

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- All downstream services running on their respective ports

### Running the API Gateway

1. Navigate to the APIGateway directory
2. Run the following commands:

```bash
dotnet restore
dotnet run
```

3. Access the API Gateway at `https://localhost:7210`
4. View Swagger UI at `https://localhost:7210/swagger`

### Configuration

The main configuration is in `ocelot.json`. Key sections include:

- **Routes**: Defines how requests are routed to downstream services
- **SwaggerEndPoints**: Configures Swagger integration for each service
- **GlobalConfiguration**: Sets the base URL for the API Gateway

### Authentication

Services requiring authentication expect a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To obtain a token, make a request to the AuthService through the gateway:

```
POST https://localhost:7210/api/Auth/login
```

### Health Monitoring

The API Gateway provides health endpoints:

- `GET /api/Health` - Gateway health status
- `GET /api/Health/services` - Status of all services

### Example Requests

1. **Login (No Auth Required)**:
   ```
   POST https://localhost:7210/api/Auth/login
   Content-Type: application/json
   
   {
     "username": "user@example.com",
     "password": "password"
   }
   ```

2. **Get Customer (Auth Required)**:
   ```
   GET https://localhost:7210/api/Customer/123
   Authorization: Bearer <jwt-token>
   ```

3. **Create Account (Auth Required)**:
   ```
   POST https://localhost:7210/api/Account/CreateAccount
   Authorization: Bearer <jwt-token>
   Content-Type: application/json
   
   {
     "customerId": 123,
     "initialBalance": 1000.00,
     "accountType": "Savings"
   }
   ```

## Features

### Swagger Integration

All downstream services' Swagger documentation is aggregated and available through the API Gateway at `/swagger`. Each service's endpoints are properly documented with the gateway's base URL.

### CORS Support

The gateway is configured to allow cross-origin requests from any origin, making it suitable for web applications.

### Error Handling

Global exception middleware provides consistent error responses across all services.

### JWT Authentication

Integrated JWT authentication validates tokens for protected routes and forwards them to downstream services.

## Troubleshooting

1. **Service Unavailable**: Ensure all downstream services are running on their configured ports
2. **Authentication Errors**: Verify JWT token is valid and properly formatted
3. **CORS Issues**: Check that the gateway's CORS policy matches your client's requirements

## Development

To modify routing or add new services:

1. Update `ocelot.json` with new route configurations
2. Add corresponding SwaggerEndPoints entries
3. Restart the API Gateway

For additional security or middleware, modify `Program.cs` to include custom middleware in the pipeline.