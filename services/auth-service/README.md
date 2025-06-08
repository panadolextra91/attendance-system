# Auth Service

The authentication service for the University Attendance System.

## Features

- User registration and login
- Role-based authentication (Student, Teacher, Admin)
- JWT-based authentication
- Device fingerprinting for anti-cheating
- Profile management

## Architecture

The service follows a clean architecture with:

- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Middleware**: Handle cross-cutting concerns

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get the user profile (requires authentication)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Setup and Development

### Prerequisites

- Node.js v18+
- PostgreSQL (available via Docker)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

### Development

```bash
# Start the service in development mode
npm run dev
```

### Database Migrations

```bash
# Create and apply migrations
npm run prisma:migrate:dev

# Apply migrations in production
npm run prisma:migrate:deploy
```

### Build and Run for Production

```bash
# Start the application
npm start
```

## Docker

Build and run the service using Docker:

```bash
# Build the Docker image
docker build -t auth-service .

# Run the container
docker run -p 3001:3001 auth-service
```

Or use Docker Compose from the root directory:

```bash
docker-compose up -d
```
