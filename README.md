# OnePlace

OnePlace is a cloud storage photo manager focused on effective library management and integration with other cloud storage providers, built for my dissertation during my final year at university. Features include

- Sign up via email/password
- Securely uploading photos
- Thumbnail generation for fast retrieval
- Management features such as tagging, filtering and album creation
- Automatic backup to Google Photos (opt-in)

## Project Structure
- **client/** - Contains the frontend React application routed using React Router, with Tanstack Query for data fetching.
- **shared/** - TypeScript types and constants shared between the frontend and backend
- **src/** - Dockerised Fastify backend API, including authentication and route handlers.
- **MySQL server** - MySQL database served in the same container as the backend.

## API Endpoint Structure

Photo management endpoints are implemented in [`src/routes/photosRoutes.ts`](src/routes/photosRoutes.ts), including:
