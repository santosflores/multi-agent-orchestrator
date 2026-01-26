# Multi-Agent Orchestrator

This project is a multi-agent orchestration platform composed of a Node.js backend (Fastify) and a Next.js frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/)

## Getting Started

To run the project locally, you will need to set up and run both the backend and the frontend.

### Backend

1.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure environment variables:
    Create a `.env` file in the `backend` directory with the following content:

    ```env
    GEMINI_API_KEY=your_gemini_api_key
    GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
    OTEL_METRICS_EXPORTER=none
    OTEL_LOGS_EXPORTER=none
    FLASH_MODEL=gemini-1.5-flash
    THINK_MODEL=gemini-2.0-flash-thinking-exp-1219
    PRO_MODEL=gemini-1.5-pro
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The backend runs on http://localhost:3000 (default Fastify port) or as configured.

### Frontend

1.  Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure environment variables:
    Create a `.env` file in the `frontend` directory with the following content:

    ```env
    BACKEND_URL=http://localhost:3000 # Update if your backend runs on a different port
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend typically runs on http://localhost:3000 or http://localhost:3001 if port 3000 is taken. Next.js will tell you which port is being used.

## Environment Variables Reference

### Frontend

| Variable      | Description             |
| :------------ | :---------------------- |
| `BACKEND_URL` | URL of the backend API. |

### Backend

| Variable                | Description                                                                     |
| :---------------------- | :------------------------------------------------------------------------------ |
| `GEMINI_API_KEY`        | API Key for Google Gemini.                                                      |
| `GOOGLE_CLOUD_PROJECT`  | Google Cloud Project ID.                                                        |
| `OTEL_METRICS_EXPORTER` | OpenTelemetry Metrics Exporter (e.g., `none`).                                  |
| `OTEL_LOGS_EXPORTER`    | OpenTelemetry Logs Exporter (e.g., `none`).                                     |
| `FLASH_MODEL`           | Identifier for the flash model (e.g., `gemini-1.5-flash`).                      |
| `THINK_MODEL`           | Identifier for the thinking model (e.g., `gemini-2.0-flash-thinking-exp-1219`). |
| `PRO_MODEL`             | Identifier for the pro model (e.g., `gemini-1.5-pro`).                          |
