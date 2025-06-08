# University Attendance System

A microservices-based system for managing university course attendance with anti-cheating mechanisms.

## Architecture

This system consists of several microservices:

- **Auth Service**: User management and authentication
- **Course Service**: Course and lecture management
- **Enrollment Service**: Student enrollment and roster management
- **Attendance Service**: Attendance tracking with anti-cheating
- **Location Service**: Geolocation verification for classroom attendance
- **API Gateway**: Client-facing API layer

## Technology Stack

- **Backend**: NestJS (TypeScript)
- **Databases**:
  - PostgreSQL: User, course, and enrollment data
  - MongoDB: Attendance records and analytics
- **ORM**: Prisma for PostgreSQL services
- **Message Broker**: RabbitMQ for inter-service communication
- **Caching**: Redis
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+)
- npm or yarn

### Setup

1. Clone the repository
2. Start the infrastructure:

```bash
docker-compose up -d
```

3. Individual service setup instructions are in their respective directories

## Development

Each service can be developed independently. See the README in each service directory for specific development instructions. 