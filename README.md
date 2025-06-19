# OnePlace

OnePlace is a cloud storage photo manager focused on effective library management and integration with other cloud storage providers, built for my dissertation during my final year at university. Features include:

- Sign up via email/password
- Securely uploading photos
- Thumbnail generation for fast retrieval
- Management features such as tagging, filtering and album creation
- Automatic backup to Google Photos (opt-in)

## Dissertation Overview
This project was developed as part of my final-year dissertation at the University of Portsmouth, titled "OnePlace: Cloud-Based Photo Management System." The aim was to create a secure, privacy-aware photo manager that supports advanced metadata features and integrates with external services like Google Photos for automatic backup.
The dissertation explores:
- Limitations of current cloud photo platforms, like vendor lock-in, metadata inconsistency, and privacy trade-offs.
- Design and implementation of a scalable web-based system using Fastify, MySQL, Firebase, React, and Docker.
- Key features including EXIF parsing, real-time filtering, custom tagging, and OAuth-enabled cloud backup.
- Evaluation of the system’s effectiveness, maintainability, and scalability against established requirements.
This repository includes the implementation side of the dissertation only. The full academic report is not published here and is not licensed for reuse.

## Project Structure
- **client/** - Contains the frontend React application routed using React Router, with Tanstack Query for data fetching.
- **shared/** - TypeScript types and constants shared between the frontend and backend
- **src/** - Dockerised Fastify backend API, including authentication and route handlers.
- **MySQL server** - MySQL database served in the same container as the backend.

## API Endpoint Structure

Photo management endpoints are implemented in [`src/routes/photosRoutes.ts`](src/routes/photosRoutes.ts), including:
- `GET /api/photos/:id` – Get a photo or signed URL
- `POST /api/photos/upload` – Upload photos
- `POST /api/photos` – Main endpoint for bulk photo retrieval using filters in the body
- `PUT /api/photos` – Update photo metadata
- `DELETE /api/photos/:id` – Delete a photo

Other entities like **Tags** and **Collections** follow a similar structure.


This project is **not licensed for reuse**. All rights reserved by the author. Please do not copy, modify, or distribute this code or content without explicit permission.
