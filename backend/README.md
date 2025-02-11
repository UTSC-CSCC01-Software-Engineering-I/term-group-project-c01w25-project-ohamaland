# CSCC01 Project Backend

### Getting Started

#### Installation

1. Ensure you have Python (>= 3.10) installed.
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

#### Setting Up the Database with PostgreSQL

1. Install PostgreSQL if you haven't already.
2. Create a new PostgreSQL database:
   ```sh
   psql -U postgres -c "CREATE DATABASE catalog;"
   ```
3. Create a `users` table for temporary testing purposes:
   ```sh
   psql -U postgres -d catalog -c "
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(50) NOT NULL UNIQUE,
     password TEXT NOT NULL
   );"
   ```
   **Note:** This table is for temporary testing purposes only and should not be used in production.

4. Create a `.env` file in `backend/core/` with the following content (check Discord team page for content):
   ```ini
   SECRET_KEY=
   DB_NAME=
   DB_USER=
   DB_PASSWORD=
   DB_HOST=
   DB_PORT=
   ```
5. Apply database migrations:
   ```sh
   python manage.py migrate
   ```

#### Starting the Server
1. Start the development server:
   ```sh
   python manage.py runserver
   ```
2. The backend will be accessible at:
   ```
   http://127.0.0.1:8000/
   ```

#### Usage
- `python manage.py runserver`: Run the project in development mode.
- `python manage.py migrate`: Apply database migrations.
- `python manage.py test`: Run tests.

