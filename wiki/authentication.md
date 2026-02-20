# Authentication System

The project uses **NextAuth.js v5** for authentication, integrated with the PostgreSQL database using raw SQL queries for user retrieval.

## Implementation Details

- **Configuration**: Located in [auth.js](../auth.js).
- **Session Strategy**: Uses **JWT** (JSON Web Tokens) for stateless session management.
- **Provider**: uses `CredentialsProvider` for username/password login.

## Authentication Flow

1. **User Login**: User submits username and password at `/login`.
2. **Authorize Callback**: 
   - A query is sent to PostgreSQL: `SELECT * FROM "User" WHERE "username" = $1`.
   - The password is verified using `bcrypt.compare()`.
3. **Token & Session**: 
   - User metadata (`id`, `role`, `username`, `gradeLevel`) is encoded into the JWT.
   - The `session` callback ensures this data is available to the frontend.

## Role-Based Access Control (RBAC)

The application uses the `role` field on the user object to control access:
- **`admin`**: Full access to the Dashboard and User Management (`/admin`).
- **`teacher`**: Access to resources for all grades.
- **`student`**: Filtered access to resources based on their assigned `gradeLevel`.

## Middleware

Protected routes are managed in [middleware.js](../middleware.js). It excludes:
- `/login`
- `/api/auth`
- Static assets (`/_next`, `/favicon.ico`)
