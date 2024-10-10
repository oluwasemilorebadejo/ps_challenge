# PS Challenge API

This API is built using Node.js, TypeScript, Express, and TypeORM. It supports various functionalities like user authentication, room management, and payment processing. The project uses dependency injection with `typedi` and integrates with cron jobs for scheduled tasks. Find the comprehensive postman documentation here: `here`

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
  - [Auth Routes](#auth-routes)
  - [User Routes](#user-routes)
  - [Room Routes](#room-routes)
  - [Payment Routes](#payment-routes)
- [Error Handling](#error-handling)
- [Cron Jobs](#cron-jobs)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (>= 16.x)
- PostgreSQL (>= 13.x)
- TypeScript (>= 5.x)
- Docker (optional, for containerization)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ps-challenge.git cd ps-challenge
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

````

3. Build the project:

    ```sh
	npm run build
    ```

## Environment Variables

Create a `.env` file in the root directory and provide the following environment variables:

```makerfile
NODE_ENV=
PORT=

DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_HOST=
DATABASE=
DATABASE_PORT=
DATABASE_DIALECT=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES=

PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
````

## Running the App

To start the application, you can use the following commands:

### Development Mode:

```bash
npm run dev
```

### Production Mode:

bash

Copy code

```bash
npm run build
npm start
```

## API Endpoints

### Auth Routes

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User signup
- `POST /api/v1/auth/logout` - User logout

### User Routes

- `GET /api/v1/users/me` - Get current logged-in user
- `GET /api/v1/users/:id` - Get a user by ID (Admin only)
- `PATCH /api/v1/users/:id` - Update user details (Admin only)
- `GET /api/v1/users/` - Get all users (Admin only)

### Room Routes

- `GET /api/v1/rooms/:code` - Get room details by room code
- `POST /api/v1/rooms` - Create a new room (Admin or Collector)
- `PATCH /api/v1/rooms/:id` - Update a room (Admin or Collector)
- `GET /api/v1/rooms/user/me` - Get rooms joined by the current user
- `POST /api/v1/rooms/join/:code` - Join a room by room code
- `POST /api/v1/rooms/leave/:code` - Leave a room by room code
- `GET /api/v1/rooms` - Get all rooms (Admin only)

### Payment Routes

- `POST /api/v1/payment/:roomCode` - Charge a payment for a room
- `POST /webhook` - Webhook for payment status updates

## Error Handling

The API uses a global error handling middleware located in the `middleware/error.ts` file. Any unhandled errors are caught and sent as a formatted JSON response with a status code and error message.

## Cron Jobs

The application uses `node-cron` to schedule cron jobs. Cron jobs are initialized in the `cron.ts` file.

## Project Structure

```bash
├── src
│   ├── controllers
│   ├── cronJobs
│   ├── dtos
│   ├── entity
│   ├── enums
│   ├── helpers
│   ├── interfaces
│  	├── middleware
│   ├── repositories
│   ├── routes
│   ├── services
│   ├── types
│   ├── utils
│   └── app.ts
│   └── cron.ts
│   └── data-source.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

## Technologies Used

- **Node.js**: JavaScript runtime
- **TypeScript**: Typed superset of JavaScript
- **Express**: Web framework for Node.js
- **TypeORM**: Object-Relational Mapping for database management
- **Typedi**: Dependency injection framework
- **JWT**: JSON Web Tokens for authentication
- **Cron**: For scheduling tasks
- **PostgreSQL**: Relational database system
