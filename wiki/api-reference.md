# API Reference

The application follows the **Next.js Route Handlers** pattern for its backend. All routes are located within the `app/api` directory.

## Base URL
`/api`

## Endpoints

### 📚 Resources

#### `GET /api/resources`
- **Description**: Fetches all active educational resources (e.g., Quipper, Phoenix).
- **Auth**: Required.
- **Response**: `{ resources: [...] }`

#### `GET /api/resources/[slug]`
- **Description**: Fetches details for a specific resource by its slug.
- **Auth**: Required.
- **Response**: `{ resource: { ... } }`

### 👥 Users

#### `GET /api/users`
- **Description**: Lists all registered users.
- **Auth**: Required (Admin only).
- **Response**: `{ users: [...] }`

#### `POST /api/users`
- **Description**: Creates a new user.
- **Auth**: Required (Admin only).
- **Body**: `{ username, name, password, role, gradeLevel }`

#### `PATCH /api/users`
- **Description**: Updates an existing user.
- **Auth**: Required (Admin only).
- **Body**: `{ id, name, role, gradeLevel }`

#### `DELETE /api/users`
- **Description**: Deletes a user.
- **Auth**: Required (Admin only).
- **Body**: `{ id }`

### 📄 PDF Documents

#### `GET /api/pdf/[id]`
- **Description**: A proxy endpoint to fetch PDFs from Google Drive using an API Key.
- **Caching**: PDFs are cached locally in the `storage/pdfs` directory after the first fetch to reduce latency and API usage.
