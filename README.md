# Gathr: Community Events Directory

Gathr is a modern, high-performance community events directory where organizers can host meetups, upload promotional banners, and connect with attendees. It offers public listing and filtering by cities or dates, a smooth event-joining workflow, and a dedicated organizer dashboard to manage upcoming gatherings.

This application is designed as an educational project featured on [staqed.com](https://staqed.com), the premier platform where you can learn to build real-world, industry-standard full-stack web applications from scratch.

---

## Technical Stack

The architecture separates the frontend and backend to demonstrate modern production design:

- **Backend:** Python & Django with Django REST Framework (DRF) for hand-crafted RESTful API endpoints.
- **Media Hosting:** Cloudinary for secure, signed direct image uploads and delivery.
- **Database:** SQLite for lightweight and robust relational data storage.
- **Frontend:** Next.js (App Router) with TypeScript for highly optimized client-side pages and server-side pre-rendering.
- **Styling & UI:** Tailwind CSS for a modern, responsive, utility-first user interface and Lucide React for consistent iconography.

---

## Core Application Features

- **Authentication System:** Pre-built traditional credential login, social auth integrations (Google and GitHub), and passwordless flow templates.
- **Cloudinary Image Uploads:** Leverage secure backend-signed Cloudinary signatures to upload event banners directly from the client browser.
- **Smart Query Filtering:** Dynamically filter published events by location (city) or exact calendar dates using clean Django ORM lookups.
- **Event Join & Leave Workflows:** Relational attendance tracking using an interactive join/leave toggle system with database-level uniqueness constraints.
- **Organizer Dashboard:** A private workspace to track created events, view attendance stats, and handle full editing or deletion capabilities.
- **Theme Integration:** Clean, elegant dark and light mode UI matching premium design standards.

---

## Project Structure

```text
gathr/
├── backend/            # Django REST API (endpoints, events app, models, userauths)
├── frontend/           # Next.js App Router (dashboard, public pages, UI components)
└── docs/               # Detailed study plans and tasks for the building process
```

---

## Getting Started

### 1. Prerequisites

Make sure you have the following installed on your machine:

- Python 3.12+
- Node.js 18+ & npm

### 2. Backend Setup

1. Navigate to the backend folder:
    ```bash
    cd backend
    ```
2. Create and activate a Python virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4. Create your local environment file:
    - Copy `.env.template` to `.env`.
    - Configure the default development variables, including your Cloudinary cloud name, API key, and API secret.
5. Run migrations to initialize the database:
    ```bash
    python manage.py migrate
    ```
6. Start the Django development server (default port `8000`):
    ```bash
    python manage.py runserver
    ```

### 3. Frontend Setup

1. Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2. Install the node packages:
    ```bash
    npm install
    ```
3. Create your local environment file:
    - Copy `.env.template` to `.env.local`.
    - Configure the API base URLs to point to your backend.
4. Start the Next.js development server (default port `3000`):
    ```bash
    npm run dev
    ```

Now open your browser and navigate to `http://localhost:3000` to interact with the full application!

---

## Learning Goals on Staqed

While building Gathr on [staqed.com](https://staqed.com), you will master:

1.  **Binary File & Media Handling:** Generating secure cryptographic tokens on Django, performing client-side uploads directly to Cloudinary, and saving resulting media references in relational records.
2.  **API Filtering & ORM Queries:** Constructing dynamic database queries based on incoming URL query parameters (like date truncation and case-insensitive location lookups).
3.  **Clean State Coordination:** Synchronizing complex user interaction states like toggling attendance, updating page queries, and displaying loading skeletons for premium UX.

---

_This project is part of the full-stack developer path on [staqed.com](https://staqed.com)._
